interface SofiaStatsData {
  timestamp: string;
  users: { total: number; active_tracking: number };
  locations: { total: number };
  notes: { total: number };
  events: { total: number };
}

export function SofiaStats({ data }: { data: SofiaStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Benutzer" value={data.users.total} />
      <StatCard
        label="GPS aktiv"
        value={data.users.active_tracking}
        highlight={data.users.active_tracking > 0}
      />
      <StatCard label="Orte" value={data.locations.total} />
      <StatCard label="Notizen" value={data.notes.total} />
      <StatCard label="Events" value={data.events.total} />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-emerald-400" : "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
