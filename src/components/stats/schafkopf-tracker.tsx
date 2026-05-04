interface SchafkopfStatsData {
  timestamp: string;
  players?: { total: number };
  sessions?: { total: number };
  rounds?: { total: number };
}

export function SchafkopfStats({ data }: { data: SchafkopfStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Spieler" value={data.players?.total} />
      <StatCard label="Sessions" value={data.sessions?.total} />
      <StatCard label="Runden" value={data.rounds?.total} />
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
