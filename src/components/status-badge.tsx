type Status = "up" | "degraded" | "down" | "unknown";

const config: Record<Status, { label: string; color: string }> = {
  up: { label: "up", color: "bg-emerald-500" },
  degraded: { label: "degraded", color: "bg-amber-500" },
  down: { label: "down", color: "bg-red-500" },
  unknown: { label: "unknown", color: "bg-zinc-600" },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${c.color}`} />
      {c.label}
    </span>
  );
}
