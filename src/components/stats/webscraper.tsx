interface WebscraperStatsData {
  timestamp: string;
  last_run?: string;
  events_scraped?: number;
  events_rated?: number;
  sources?: number;
}

export function WebscraperStats({ data }: { data: WebscraperStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Letzter Run"
        value={
          data.last_run
            ? new Date(data.last_run).toLocaleString("de-DE")
            : "--"
        }
      />
      <StatCard label="Events gescrapt" value={data.events_scraped} />
      <StatCard label="Events bewertet" value={data.events_rated} />
      <StatCard label="Quellen" value={data.sources} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">
        {value ?? "--"}
      </p>
    </div>
  );
}
