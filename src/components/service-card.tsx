import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { ServiceWithLatestCheck } from "@/lib/types";

function formatUptime(pct: number | null): string {
  if (pct === null) return "--";
  return pct.toFixed(1) + "%";
}

function timeAgo(ts: string | null): string {
  if (!ts) return "nie";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade";
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? "en" : ""}`;
}

export function ServiceCard({
  service,
}: {
  service: ServiceWithLatestCheck;
}) {
  return (
    <Link href={`/services/${service.slug}`}>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-zinc-100">{service.name}</h3>
            {service.url && (
              <p className="text-xs text-zinc-500">{service.url}</p>
            )}
          </div>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {service.type}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-4">
          <StatusBadge status={service.latest_status ?? "unknown"} />
          <span className="text-sm text-zinc-400">
            {formatUptime(service.uptime_24h)} (24h)
          </span>
          {service.latest_response_ms !== null && (
            <span className="text-sm text-zinc-500">
              {service.latest_response_ms}ms
            </span>
          )}
        </div>

        {!service.stats_available && (
          <p className="text-xs text-amber-500/80">
            Stats: kein Endpoint
          </p>
        )}

        <p className="mt-2 text-xs text-zinc-600">
          Letzter Check: {timeAgo(service.latest_check_time)}
        </p>
      </div>
    </Link>
  );
}
