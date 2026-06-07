import { Client } from "ssh2";
import { getDb } from "./db";
import { hosts, getSSHConfig } from "./ssh-config";
import type { BackupFile, BackupCheck } from "./types";

const DOCKER_HOST = hosts.find((h) => h.name === "docker-host")!;
const BACKUP_DIR = process.env.BACKUP_DIR ?? "/mnt/nas-backup";
const BACKUP_LOG = process.env.BACKUP_LOG ?? "/home/sebastian/pg_backup.log";
const EXPECTED_DBS = ["vmpostgres", "fitness", "karten"];

function execCommand(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = "";
      stream.on("data", (data: Buffer) => {
        output += data.toString();
      });
      stream.stderr.on("data", () => {});
      stream.on("close", () => resolve(output));
    });
  });
}

function withConnection<T>(fn: (conn: Client) => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const config = getSSHConfig(DOCKER_HOST);

    conn.on("ready", async () => {
      try {
        const result = await fn(conn);
        conn.end();
        resolve(result);
      } catch (err) {
        conn.end();
        reject(err);
      }
    });

    conn.on("error", (err) => reject(err));
    conn.connect(config);
  });
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function extractDbName(filename: string): string {
  const match = filename.match(/^(vmpostgres|fitness|karten)/);
  return match ? match[1] : "";
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export async function listBackupFiles(): Promise<BackupFile[]> {
  const raw = await withConnection((conn) =>
    execCommand(
      conn,
      `find ${BACKUP_DIR} -maxdepth 2 -type f -printf '%T@ %s %p\\n' 2>/dev/null | sort -rn`
    )
  );

  const todayStr = getTodayStr();
  const lines = raw.trim().split("\n").filter((l) => l.trim());

  return lines.map((line) => {
    const parts = line.split(" ");
    const mtimeEpoch = parseFloat(parts[0]);
    const sizeBytes = parseInt(parts[1], 10);
    const filepath = parts.slice(2).join(" ");
    const filename = filepath.split("/").pop() ?? filepath;

    return {
      name: filename,
      size_bytes: sizeBytes,
      size_human: formatSize(sizeBytes),
      modified: new Date(mtimeEpoch * 1000).toISOString(),
      database: extractDbName(filename),
      is_today: filename.includes(todayStr),
    };
  });
}

interface DbCheckResult {
  database: string;
  found: boolean;
  files: string[];
}

export async function runBackupCheck(): Promise<BackupCheck> {
  const { logTail, todayInLog } = await readLog();
  const files = await listBackupFiles();
  const todayStr = getTodayStr();

  const dbChecks: DbCheckResult[] = EXPECTED_DBS.map((db) => {
    const dbFiles = files.filter(
      (f) => f.database === db && f.name.includes(todayStr)
    );
    return {
      database: db,
      found: dbFiles.length > 0 && dbFiles.every((f) => f.size_bytes > 0),
      files: dbFiles.map((f) => `${f.name} (${f.size_human})`),
    };
  });

  const allFound = dbChecks.every((d) => d.found);
  const someFound = dbChecks.some((d) => d.found);

  let status: BackupCheck["status"];
  let message: string | null = null;

  if (allFound && todayInLog) {
    status = "success";
  } else if (someFound) {
    status = "warning";
    const missing = dbChecks.filter((d) => !d.found).map((d) => d.database);
    message = `Teilweise fehlgeschlagen. Fehlende DBs: ${missing.join(", ")}`;
    if (!todayInLog) {
      message += ". Kein Log-Eintrag für heute.";
    }
  } else {
    status = "failed";
    message = todayInLog
      ? "Backup-Log vorhanden, aber keine Backup-Dateien gefunden."
      : "Kein Backup-Log-Eintrag und keine Backup-Dateien für heute.";
  }

  const check = getDb()
    .prepare(
      `INSERT INTO backup_checks (status, databases_json, log_tail, message)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      status,
      JSON.stringify(dbChecks),
      logTail,
      message
    ) as { lastInsertRowid: number | bigint };

  const result: BackupCheck = {
    id: Number(check.lastInsertRowid),
    check_time: new Date().toISOString(),
    status,
    databases_json: JSON.stringify(dbChecks),
    log_tail: logTail,
    message,
  };

  if (status !== "success") {
    const { sendBackupNotification } = await import("./notifier");
    await sendBackupNotification(status, message ?? "Backup-Check fehlgeschlagen");
  }

  return result;
}

async function readLog(): Promise<{ logTail: string | null; todayInLog: boolean }> {
  try {
    const raw = await withConnection((conn) =>
      execCommand(conn, `tail -30 ${BACKUP_LOG} 2>/dev/null || echo "__NO_LOG__"`)
    );

    if (raw.trim() === "__NO_LOG__" || raw.trim() === "") {
      return { logTail: null, todayInLog: false };
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const todayInLog = raw.includes(todayDate) || raw.includes(getTodayStr());

    return { logTail: raw.trim(), todayInLog };
  } catch {
    return { logTail: null, todayInLog: false };
  }
}

export function getRecentChecks(limit = 30): BackupCheck[] {
  return getDb()
    .prepare(
      `SELECT * FROM backup_checks ORDER BY check_time DESC LIMIT ?`
    )
    .all(limit) as BackupCheck[];
}

export function getLatestCheck(): BackupCheck | null {
  return getDb()
    .prepare(
      `SELECT * FROM backup_checks ORDER BY check_time DESC LIMIT 1`
    )
    .get() as BackupCheck | null;
}
