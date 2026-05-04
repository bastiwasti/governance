import type { Incident } from "@/lib/types";

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "--";
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours} Std ${mins > 0 ? `${mins} Min` : ""}`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days} Tag${days > 1 ? "e" : ""}${remainingHours > 0 ? ` ${remainingHours} Std` : ""}`;
}

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-500">Keine Incidents in den letzten 30 Tagen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={`rounded-lg border p-4 ${
            inc.status === "open"
              ? "border-red-900/50 bg-red-950/20"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  inc.severity === "down" ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {inc.severity === "down" ? "Ausfall" : "Eingeschränkt"}
                </p>
                <p className="text-xs text-zinc-500">
                  Gestartet: {new Date(inc.started_at).toLocaleString("de-DE")}
                </p>
              </div>
            </div>
            <div className="text-right">
              {inc.status === "open" ? (
                <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-400">
                  Offen
                </span>
              ) : (
                <span className="rounded bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">
                  Gelöst
                </span>
              )}
            </div>
          </div>

          {inc.resolved_at && (
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Gelöst: {new Date(inc.resolved_at).toLocaleString("de-DE")}
              </span>
              <span className="text-zinc-400">
                Dauer: {formatDuration(inc.duration_minutes)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
