import { getDb } from "./db";

const RETENTION = {
  uptime_checks: 90,
  stats_snapshots: 365,
  infra_metrics: 30,
} as const;

const BATCH_SIZE = 10000;

export function runRetention(): void {
  const db = getDb();

  for (const [table, days] of Object.entries(RETENTION)) {
    const tsCol = table === "stats_snapshots" ? "collected_at" : "timestamp";

    let total = 0;
    let deleted: number;
    do {
      const result = db
        .prepare(
          `DELETE FROM ${table} WHERE rowid IN (
            SELECT rowid FROM ${table}
            WHERE ${tsCol} < datetime('now', '-${days} days')
            LIMIT ${BATCH_SIZE}
          )`
        )
        .run();
      deleted = result.changes;
      total += deleted;
    } while (deleted === BATCH_SIZE);

    if (total > 0) {
      console.log(`Retention: deleted ${total} rows from ${table} (>${days}d)`);
    }
  }
}
