interface KartenStatsData {
  timestamp: string;
  players?: { total: number; active_30d?: number };
  sessions?: { total: number; active_30d?: number };
  rounds?: { total: number };
  games?: { total: number };
}

export function KartenStats({ data }: { data: KartenStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Spieler" value={data.players?.total} />
      <StatCard label="Sessions" value={data.sessions?.total} />
      <StatCard label="Runden" value={data.rounds?.total} />
      <StatCard label="Spiele" value={data.games?.total} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">
        {value ?? "--"}
      </p>
    </div>
  );
}
