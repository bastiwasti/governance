import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { UptimeChart, ResponseTimeChart } from "@/components/charts";
import type { Service, UptimeCheck, StatsSnapshot } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();

  const service = db
    .prepare("SELECT * FROM services WHERE slug = ?")
    .get(slug) as Service | undefined;

  if (!service) notFound();

  const checks = db
    .prepare(
      "SELECT * FROM uptime_checks WHERE service_id = ? AND timestamp > datetime('now', '-30 days') ORDER BY timestamp"
    )
    .all(service.id) as UptimeCheck[];

  const latestCheck = checks[checks.length - 1] as
    | UptimeCheck
    | undefined;

  const statsSnapshots = db
    .prepare(
      "SELECT * FROM stats_snapshots WHERE service_id = ? ORDER BY collected_at DESC LIMIT 30"
    )
    .all(service.id) as StatsSnapshot[];

  return (
    <>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          &larr; Dashboard
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {service.name}
          </h1>
          {service.url && (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              {service.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={latestCheck?.status ?? "unknown"} />
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {service.type}
          </span>
        </div>
      </div>

      {service.notes && (
        <p className="mb-6 text-sm text-zinc-500">{service.notes}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Overview
          </h2>

          {checks.length > 0 ? (
            <div className="space-y-6">
              <UptimeChart checks={checks} />
              <ResponseTimeChart checks={checks} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Noch keine Uptime-Daten vorhanden.
            </p>
          )}

          <div className="mt-4 space-y-2 text-sm">
            {latestCheck && (
              <>
                <div className="flex justify-between text-zinc-500">
                  <span>Letzter Check</span>
                  <span className="text-zinc-300">
                    {new Date(latestCheck.timestamp).toLocaleString("de-DE")}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Response Time</span>
                  <span className="text-zinc-300">
                    {latestCheck.response_ms ?? "--"}ms
                  </span>
                </div>
                {latestCheck.version && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Version</span>
                    <span className="text-zinc-300">
                      {latestCheck.version}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Stats
          </h2>

          {statsSnapshots.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Keine Stats-Daten vorhanden.
            </p>
          ) : (
            <div className="space-y-3">
              {statsSnapshots.slice(0, 5).map((snap) => (
                <div key={snap.id} className="rounded bg-zinc-800/50 p-3">
                  <p className="mb-1 text-xs text-zinc-500">
                    {new Date(snap.collected_at).toLocaleString("de-DE")}
                    {!snap.endpoint_available && (
                      <span className="ml-2 text-amber-500">
                        Endpoint nicht erreichbar
                      </span>
                    )}
                  </p>
                  {snap.data_json && (
                    <pre className="overflow-x-auto text-xs text-zinc-400">
                      {JSON.stringify(JSON.parse(snap.data_json), null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
