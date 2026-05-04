import { getDb } from "./db";
import type { Service, Incident } from "./types";

async function pollService(service: Service): Promise<void> {
  const url = `${service.internal_url}${service.health_endpoint}`;
  const start = Date.now();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const ms = Date.now() - start;

    let appStatus: string | null = null;
    let version: string | null = null;

    if (res.ok) {
      try {
        const body = await res.json();
        appStatus = body.status ?? null;
        version = body.version ?? null;
      } catch {}
    }

    const status = !res.ok ? "down" : ms >= 2000 ? "degraded" : "up";

    const result = getDb()
      .prepare(
        `INSERT INTO uptime_checks (service_id, status, response_ms, http_status_code, app_status, version)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(service.id, status, ms, res.status, appStatus, version);

    await detectIncident(service, status, Number(result.lastInsertRowid));
  } catch (err) {
    const ms = Date.now() - start;
    const result = getDb()
      .prepare(
        `INSERT INTO uptime_checks (service_id, status, response_ms, error_message)
         VALUES (?, 'down', ?, ?)`
      )
      .run(service.id, ms, String(err));

    await detectIncident(service, "down", Number(result.lastInsertRowid));
  }
}

async function detectIncident(
  service: Service,
  newStatus: string,
  checkId: number
): Promise<void> {
  const db = getDb();

  const prev = db
    .prepare(
      `SELECT status FROM uptime_checks
       WHERE service_id = ? AND id != ?
       ORDER BY timestamp DESC LIMIT 1`
    )
    .get(service.id, checkId) as { status: string } | undefined;

  if (!prev || prev.status === newStatus) return;

  const wentDown = prev.status === "up" && (newStatus === "down" || newStatus === "degraded");
  const cameUp = prev.status === "down" && newStatus === "up";
  const cameUpFromDegraded = prev.status === "degraded" && newStatus === "up";

  if (wentDown) {
    const severity = newStatus === "down" ? "down" : "degraded";
    db.prepare(
      `INSERT INTO incidents (service_id, status, severity, started_at, trigger_check_id)
       VALUES (?, 'open', ?, datetime('now'), ?)`
    ).run(service.id, severity, checkId);

    const { sendNotifications } = await import("./notifier");
    await sendNotifications(service, newStatus === "down" ? "service.down" : "service.degraded");
  } else if (cameUp || cameUpFromDegraded) {
    const open = db
      .prepare(
        `SELECT * FROM incidents WHERE service_id = ? AND status = 'open' ORDER BY started_at DESC LIMIT 1`
      )
      .get(service.id) as Incident | undefined;

    if (open) {
      const now = new Date();
      const started = new Date(open.started_at);
      const durationMin = Math.round((now.getTime() - started.getTime()) / 60000);

      db.prepare(
        `UPDATE incidents SET status = 'resolved', resolved_at = datetime('now'), duration_minutes = ?, resolve_check_id = ? WHERE id = ?`
      ).run(durationMin, checkId, open.id);

      const { sendNotifications } = await import("./notifier");
      await sendNotifications(service, "service.up");
    }
  }
}

export async function pollAllServices(): Promise<void> {
  const services = getDb()
    .prepare(
      `SELECT * FROM services
       WHERE status = 'active'
       AND internal_url IS NOT NULL
       AND health_endpoint IS NOT NULL`
    )
    .all() as Service[];

  await Promise.allSettled(services.map(pollService));
}
