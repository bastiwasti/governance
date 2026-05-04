import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, "../../data");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT,
  internal_url TEXT,
  type TEXT NOT NULL DEFAULT 'app',
  repo TEXT,
  health_endpoint TEXT,
  stats_endpoint TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS uptime_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id),
  timestamp TEXT DEFAULT (datetime('now')),
  status TEXT NOT NULL,
  response_ms INTEGER,
  http_status_code INTEGER,
  app_status TEXT,
  version TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS stats_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id),
  collected_at TEXT DEFAULT (datetime('now')),
  endpoint_available INTEGER NOT NULL DEFAULT 1,
  data_json TEXT
);

CREATE TABLE IF NOT EXISTS infra_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value_json TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_uptime_service_time ON uptime_checks(service_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_stats_service_time ON stats_snapshots(service_id, collected_at);
CREATE INDEX IF NOT EXISTS idx_infra_host_time ON infra_metrics(host, metric_type, timestamp);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id),
  status TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'down',
  started_at TEXT NOT NULL,
  resolved_at TEXT,
  duration_minutes INTEGER,
  trigger_check_id INTEGER REFERENCES uptime_checks(id),
  resolve_check_id INTEGER REFERENCES uptime_checks(id)
);
CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service_id, started_at DESC);

CREATE TABLE IF NOT EXISTS webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  label TEXT,
  events TEXT NOT NULL DEFAULT 'down,up',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined;
};

function getDbPath(): string {
  const envFile =
    process.env.NODE_ENV === "test"
      ? "governance-test.db"
      : process.env.NODE_ENV === "development"
        ? "governance-dev.db"
        : "governance.db";
  return join(DATA_DIR, process.env.SQLITE_DB_PATH ?? envFile);
}

export function getDb(): Database.Database {
  if (globalForDb.db) return globalForDb.db;

  mkdirSync(DATA_DIR, { recursive: true });

  const db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);

  globalForDb.db = db;
  return db;
}
