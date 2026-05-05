interface GameTypeStats {
  total: number;
  sessions: number;
  avg_per_session: number;
}

interface KartenStatsData {
  timestamp: string;
  users?: { total: number; active_30d?: number };
  tenants?: { total: number };
  players?: { total: number };
  game_sessions?: { total: number; active_30d?: number; archived?: number };
  games_by_type?: Record<string, GameTypeStats>;
  total_games?: number;
}

const GAME_META: Record<string, { emoji: string; label: string }> = {
  schafkopf: { emoji: "\u2660\uFE0F", label: "Schafkopf" },
  doppelkopf: { emoji: "\u2666\uFE0F", label: "Doppelkopf" },
  skat: { emoji: "\u2663\uFE0F", label: "Skat" },
  romme: { emoji: "\uD83C\uDCCF", label: "Romme" },
  kinderkarten: { emoji: "\uD83D\uDC76", label: "Kinderkarten" },
  wizard: { emoji: "\uD83E\uDDD9", label: "Wizard" },
  watten: { emoji: "\u26F0\uFE0F", label: "Watten" },
};

export function KartenStats({ data }: { data: KartenStatsData }) {
  const gamesByType = data.games_by_type ?? {};
  const totalGames = data.total_games ?? 0;

  const sortedTypes = Object.entries(gamesByType)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      <Section title="Benutzer & Tische">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Benutzer" value={data.users?.total} />
          <StatCard
            label="Aktive 30d"
            value={data.users?.active_30d}
            highlight={(data.users?.active_30d ?? 0) > 0}
          />
          <StatCard label="Tische" value={data.tenants?.total} />
          <StatCard label="Spieler" value={data.players?.total} />
        </div>
      </Section>

      <Section title="Sessions">
        <div className="grid gap-4 grid-cols-3">
          <StatCard label="Gesamt" value={data.game_sessions?.total} />
          <StatCard
            label="Aktive 30d"
            value={data.game_sessions?.active_30d}
            highlight={(data.game_sessions?.active_30d ?? 0) > 0}
          />
          <StatCard label="Archiviert" value={data.game_sessions?.archived} />
        </div>
      </Section>

      {sortedTypes.length > 0 && (
        <Section title={`Spiele nach Typ (${formatNumber(totalGames)} gesamt)`}>
          <div className="space-y-2">
            {sortedTypes.map(([type, stats]) => {
              const meta = GAME_META[type] ?? { emoji: "\uD83C\uDFAE", label: type };
              const pct = totalGames > 0 ? (stats.total / totalGames) * 100 : 0;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2"
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="w-24 text-sm font-medium text-zinc-200">
                    {meta.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-zinc-800">
                      <div
                        className="h-2.5 rounded-full bg-emerald-500/70"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-14 text-right text-sm font-bold text-zinc-100">
                    {formatNumber(stats.total)}
                  </span>
                  <span className="w-10 text-right text-xs text-zinc-500">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="w-20 text-right text-xs text-zinc-500">
                    {"\u2300 "}{stats.avg_per_session}/Sess.
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: number;
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
        {value ?? "--"}
      </p>
    </div>
  );
}

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "--";
  return n.toLocaleString("de-DE");
}
