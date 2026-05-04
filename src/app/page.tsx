import { ServiceCard } from "@/components/service-card";
import { getDb } from "@/lib/db";
import type { ServiceWithLatestCheck } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = getDb();
  const services = db
    .prepare(
      `SELECT s.*,
        uc.status as latest_status,
        uc.response_ms as latest_response_ms,
        uc.timestamp as latest_check_time,
        (SELECT COUNT(*) FROM uptime_checks uc2 WHERE uc2.service_id = s.id AND uc2.status = 'up' AND uc2.timestamp > datetime('now', '-24 hours')) * 100.0
          / NULLIF((SELECT COUNT(*) FROM uptime_checks uc3 WHERE uc3.service_id = s.id AND uc3.timestamp > datetime('now', '-24 hours')), 0) as uptime_24h,
        CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as stats_available,
        CASE WHEN inc.id IS NOT NULL THEN 1 ELSE 0 END as open_incident
      FROM services s
      LEFT JOIN uptime_checks uc ON uc.id = (
        SELECT id FROM uptime_checks WHERE service_id = s.id ORDER BY timestamp DESC LIMIT 1
      )
      LEFT JOIN stats_snapshots ss ON ss.service_id = s.id AND ss.collected_at > datetime('now', '-2 days')
      LEFT JOIN incidents inc ON inc.service_id = s.id AND inc.status = 'open'
      GROUP BY s.id
      ORDER BY s.name`
    )
    .all() as ServiceWithLatestCheck[];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {services.length} Service{services.length !== 1 ? "s" : ""} registriert
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-500">Keine Services registriert.</p>
          <p className="mt-2 text-sm text-zinc-600">
            Gehe zur{" "}
            <a href="/registry" className="text-zinc-400 underline hover:text-zinc-300">
              Registry
            </a>{" "}
            um Services hinzuzufügen.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </>
  );
}
