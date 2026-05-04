import { getDb } from "./db";
import type { Service } from "./types";

async function collectStats(service: Service): Promise<void> {
  if (!service.internal_url || !service.stats_endpoint) return;

  const url = `${service.internal_url}${service.stats_endpoint}`;
  const db = getDb();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!res.ok) {
      db.prepare(
        `INSERT INTO stats_snapshots (service_id, endpoint_available, data_json) VALUES (?, 0, NULL)`
      ).run(service.id);
      return;
    }

    const body = await res.json();
    db.prepare(
      `INSERT INTO stats_snapshots (service_id, endpoint_available, data_json) VALUES (?, 1, ?)`
    ).run(service.id, JSON.stringify(body));
  } catch {
    db.prepare(
      `INSERT INTO stats_snapshots (service_id, endpoint_available, data_json) VALUES (?, 0, NULL)`
    ).run(service.id);
  }
}

export async function collectAllStats(): Promise<void> {
  const services = getDb()
    .prepare(
      `SELECT * FROM services
       WHERE status = 'active'
       AND internal_url IS NOT NULL
       AND stats_endpoint IS NOT NULL`
    )
    .all() as Service[];

  await Promise.allSettled(services.map(collectStats));
}
