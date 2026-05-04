import { Client } from "ssh2";
import { getDb } from "./db";
import { hosts, getSSHConfig } from "./ssh-config";
import type { HostConfig } from "./ssh-config";

function execCommand(
  conn: Client,
  cmd: string
): Promise<string> {
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

interface DiskInfo {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percent: number;
}

interface MemoryInfo {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percent: number;
}

interface CpuInfo {
  user_pct: number;
  system_pct: number;
  idle_pct: number;
  total_pct: number;
}

interface ContainerInfo {
  name: string;
  image: string;
  status: string;
}

function parseDf(output: string): DiskInfo {
  const lines = output.trim().split("\n");
  const dataLine = lines.find((l) => l.startsWith("/dev/"));
  if (!dataLine) throw new Error("No /dev/ line in df output");
  const parts = dataLine.split(/\s+/);
  const total = parseFloat(parts[1]);
  const used = parseFloat(parts[2]);
  const available = parseFloat(parts[3]);
  const percent = parseFloat(parts[4]);
  return {
    total_gb: Math.round(total * 100) / 100,
    used_gb: Math.round(used * 100) / 100,
    available_gb: Math.round(available * 100) / 100,
    percent,
  };
}

function parseFree(output: string): MemoryInfo {
  const lines = output.trim().split("\n");
  const memLine = lines.find((l) => l.startsWith("Mem:"));
  if (!memLine) throw new Error("No Mem: line in free output");
  const parts = memLine.split(/\s+/);
  const total = parseFloat(parts[1]);
  const used = parseFloat(parts[2]);
  const available = parseFloat(parts[6] || parts[3]);
  return {
    total_gb: Math.round(total * 100) / 100,
    used_gb: Math.round(used * 100) / 100,
    available_gb: Math.round(available * 100) / 100,
    percent: Math.round((used / total) * 1000) / 10,
  };
}

function parseTop(output: string): CpuInfo {
  const lines = output.trim().split("\n");
  const cpuLine = lines.find((l) => l.includes("%Cpu(s)"));
  if (!cpuLine) throw new Error("No %Cpu line in top output");
  const userMatch = cpuLine.match(/([\d.]+)\s*us/);
  const sysMatch = cpuLine.match(/([\d.]+)\s*sy/);
  const idleMatch = cpuLine.match(/([\d.]+)\s*id/);
  const user = userMatch ? parseFloat(userMatch[1]) : 0;
  const sys = sysMatch ? parseFloat(sysMatch[1]) : 0;
  const idle = idleMatch ? parseFloat(idleMatch[1]) : 0;
  return {
    user_pct: user,
    system_pct: sys,
    idle_pct: idle,
    total_pct: Math.round((user + sys) * 10) / 10,
  };
}

function parseDockerPs(output: string): ContainerInfo[] {
  return output
    .trim()
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [name, status, image] = line.split("\t");
      return { name, image: image ?? "", status: status ?? "" };
    });
}

function insertMetric(
  host: string,
  metricType: string,
  value: unknown
): void {
  getDb()
    .prepare(
      `INSERT INTO infra_metrics (host, metric_type, value_json) VALUES (?, ?, ?)`
    )
    .run(host, metricType, JSON.stringify(value));
}

async function collectHost(host: HostConfig): Promise<void> {
  const config = getSSHConfig(host);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn.on("ready", async () => {
      try {
        const [dfOutput, freeOutput, topOutput] = await Promise.all([
          execCommand(conn, "df -h /"),
          execCommand(conn, "free -h"),
          execCommand(conn, "top -bn1 | head -5"),
        ]);

        const disk = parseDf(dfOutput);
        const memory = parseFree(freeOutput);
        const cpu = parseTop(topOutput);

        insertMetric(host.name, "disk", disk);
        insertMetric(host.name, "memory", memory);
        insertMetric(host.name, "cpu", cpu);

        if (host.collectContainers) {
          const dockerOutput = await execCommand(
            conn,
            "docker ps --format '{{.Names}}\\t{{.Status}}\\t{{.Image}}'"
          );
          const containers = parseDockerPs(dockerOutput);
          insertMetric(host.name, "container", containers);
        }

        conn.end();
        resolve();
      } catch (err) {
        conn.end();
        reject(err);
      }
    });

    conn.on("error", (err) => {
      reject(err);
    });

    conn.connect(config);
  });
}

export async function collectAllInfra(): Promise<void> {
  const results = await Promise.allSettled(hosts.map(collectHost));

  for (const [i, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error(
        `Failed to collect infra for ${hosts[i].name}:`,
        result.reason
      );
    }
  }
}
