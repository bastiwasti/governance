import { getDb } from "@/lib/db";
import { HostCard } from "@/components/infra/host-card";
import { ContainerTable } from "@/components/infra/container-table";
import { CpuChart, MemoryChart, DiskChart } from "@/components/infra/metric-charts";
import type { InfraMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InfraPage() {
  const db = getDb();

  const latestByHostAndType = db
    .prepare(
      `SELECT m.* FROM infra_metrics m
       INNER JOIN (
         SELECT host, metric_type, MAX(timestamp) as max_ts
         FROM infra_metrics
         GROUP BY host, metric_type
       ) latest ON m.host = latest.host AND m.metric_type = latest.metric_type AND m.timestamp = latest.max_ts`
    )
    .all() as InfraMetric[];

  const metrics24h = db
    .prepare(
      `SELECT * FROM infra_metrics
       WHERE metric_type IN ('cpu', 'memory')
       AND timestamp > datetime('now', '-24 hours')
       ORDER BY timestamp`
    )
    .all() as InfraMetric[];

  const metrics7d = db
    .prepare(
      `SELECT * FROM infra_metrics
       WHERE metric_type = 'disk'
       AND timestamp > datetime('now', '-7 days')
       ORDER BY timestamp`
    )
    .all() as InfraMetric[];

  const allChartMetrics = [...metrics24h, ...metrics7d];

  const hosts = ["docker-host", "dev-vm"] as const;

  const hostData = hosts.map((name) => {
    const hostMetrics = latestByHostAndType.filter((m) => m.host === name);
    const cpu = hostMetrics.find((m) => m.metric_type === "cpu");
    const memory = hostMetrics.find((m) => m.metric_type === "memory");
    const disk = hostMetrics.find((m) => m.metric_type === "disk");
    const latest = hostMetrics.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return {
      name,
      cpu: cpu ? JSON.parse(cpu.value_json) : null,
      memory: memory ? JSON.parse(memory.value_json) : null,
      disk: disk ? JSON.parse(disk.value_json) : null,
      lastCollected: latest?.timestamp ?? null,
    };
  });

  const containerMetric = latestByHostAndType.find(
    (m) => m.host === "docker-host" && m.metric_type === "container"
  );
  const containers = containerMetric
    ? JSON.parse(containerMetric.value_json)
    : [];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Infrastruktur</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Systemauslastung — alle 5 Minuten via SSH
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {hostData.map((h) => (
          <HostCard
            key={h.name}
            name={h.name}
            cpu={h.cpu}
            memory={h.memory}
            disk={h.disk}
            lastCollected={h.lastCollected}
          />
        ))}
      </div>

      {allChartMetrics.length > 0 && (
        <div className="mb-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <CpuChart metrics={allChartMetrics} />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <MemoryChart metrics={allChartMetrics} />
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <DiskChart metrics={allChartMetrics} />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Container (docker-host)
        </h2>
        <ContainerTable containers={containers} />
      </div>
    </>
  );
}
