import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { UptimeChart, ResponseTimeChart } from "@/components/charts";
import { Tabs } from "@/components/tabs";
import { StatsView } from "@/components/stats";
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

  const latestStats = statsSnapshots[0];
  const latestStatsData = latestStats?.data_json
    ? JSON.parse(latestStats.data_json)
    : null;

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

      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="space-y-6">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
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
              </div>
            ),
          },
          {
            id: "stats",
            label: "Stats",
            content: (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                {latestStatsData ? (
                  <div className="space-y-6">
                    <div>
                      <p className="mb-4 text-xs text-zinc-500">
                        Letzte Erhebung:{" "}
                        {new Date(
                          latestStats!.collected_at
                        ).toLocaleString("de-DE")}
                        {!latestStats!.endpoint_available && (
                          <span className="ml-2 text-amber-500">
                            Endpoint nicht erreichbar
                          </span>
                        )}
                      </p>
                      <StatsView slug={service.slug} data={latestStatsData} />
                    </div>

                    {statsSnapshots.length > 1 && (
                      <div>
                        <h3 className="mb-3 text-sm font-medium text-zinc-400">
                          Historie
                        </h3>
                        <div className="space-y-2">
                          {statsSnapshots.slice(1, 10).map((snap) => (
                            <div
                              key={snap.id}
                              className="flex items-center justify-between rounded bg-zinc-800/50 px-3 py-2 text-xs"
                            >
                              <span className="text-zinc-500">
                                {new Date(snap.collected_at).toLocaleString("de-DE")}
                              </span>
                              {!snap.endpoint_available ? (
                                <span className="text-amber-500">
                                  Nicht erreichbar
                                </span>
                              ) : (
                                <span className="text-zinc-400">
                                  {snap.data_json
                                    ? Object.keys(JSON.parse(snap.data_json))
                                        .filter((k) => k !== "timestamp")
                                        .length
                                    : 0}{" "}
                                  Metriken
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Keine Stats-Daten vorhanden.
                  </p>
                )}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
