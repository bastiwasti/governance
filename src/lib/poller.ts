import { getDb } from "./db";
import type { Service } from "./types";

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

    getDb()
      .prepare(
        `INSERT INTO uptime_checks (service_id, status, response_ms, http_status_code, app_status, version)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(service.id, status, ms, res.status, appStatus, version);
  } catch (err) {
    const ms = Date.now() - start;
    getDb()
      .prepare(
        `INSERT INTO uptime_checks (service_id, status, response_ms, error_message)
         VALUES (?, 'down', ?, ?)`
      )
      .run(service.id, ms, String(err));
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
