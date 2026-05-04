interface MetricBarProps {
  label: string;
  percent: number;
  used: string;
  total: string;
}

function MetricBar({ label, percent, used, total }: MetricBarProps) {
  const color =
    percent >= 90
      ? "bg-red-500"
      : percent >= 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-300">
          {used} / {total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-right text-xs text-zinc-500">{percent}%</p>
    </div>
  );
}

function formatGb(val: number): string {
  return val >= 1 ? `${val.toFixed(1)} GB` : `${Math.round(val * 1024)} MB`;
}

interface HostCardProps {
  name: string;
  cpu: { total_pct: number } | null;
  memory: { total_gb: number; used_gb: number; percent: number } | null;
  disk: { total_gb: number; used_gb: number; percent: number } | null;
  lastCollected: string | null;
}

function timeAgo(ts: string | null): string {
  if (!ts) return "nie";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade";
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  return `vor ${hours} Std`;
}

export function HostCard({ name, cpu, memory, disk, lastCollected }: HostCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>
        <span className="text-xs text-zinc-600">
          {timeAgo(lastCollected)}
        </span>
      </div>

      {cpu && (
        <div className="mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">CPU</span>
            <span
              className={
                cpu.total_pct >= 90
                  ? "text-red-400"
                  : cpu.total_pct >= 70
                    ? "text-amber-400"
                    : "text-emerald-400"
              }
            >
              {cpu.total_pct}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-zinc-800">
            <div
              className={`h-2 rounded-full transition-all ${
                cpu.total_pct >= 90
                  ? "bg-red-500"
                  : cpu.total_pct >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(cpu.total_pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {memory && (
        <div className="mb-3">
          <MetricBar
            label="RAM"
            percent={memory.percent}
            used={formatGb(memory.used_gb)}
            total={formatGb(memory.total_gb)}
          />
        </div>
      )}

      {disk && (
        <MetricBar
          label="Disk"
          percent={disk.percent}
          used={formatGb(disk.used_gb)}
          total={formatGb(disk.total_gb)}
        />
      )}

      {!cpu && !memory && !disk && (
        <p className="text-sm text-zinc-500">Keine Daten vorhanden.</p>
      )}
    </div>
  );
}
