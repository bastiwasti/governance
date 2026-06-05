interface TopExercise {
  name: string;
  session_count: number;
}

interface FitnessStatsData {
  timestamp: string;
  users?: { total: number; active_30d?: number };
  workout_sessions?: { total: number; completed_30d?: number; active?: number };
  body_weight_logs?: { total: number };
  programs?: { total: number; shared?: number };
  top_exercises?: TopExercise[];
}

export function FitnessStats({ data }: { data: FitnessStatsData }) {
  const topExercises = data.top_exercises ?? [];
  const maxSessionCount =
    topExercises.length > 0 ? topExercises[0].session_count : 0;

  return (
    <div className="space-y-6">
      <Section title="Benutzer">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Gesamt" value={data.users?.total} />
          <StatCard
            label="Aktive 30d"
            value={data.users?.active_30d}
            highlight={(data.users?.active_30d ?? 0) > 0}
          />
        </div>
      </Section>

      <Section title="Workout-Sessions">
        <div className="grid gap-4 grid-cols-3">
          <StatCard label="Gesamt" value={data.workout_sessions?.total} />
          <StatCard
            label="Abgeschlossen 30d"
            value={data.workout_sessions?.completed_30d}
            highlight={(data.workout_sessions?.completed_30d ?? 0) > 0}
          />
          <StatCard
            label="Aktiv"
            value={data.workout_sessions?.active}
            highlight={(data.workout_sessions?.active ?? 0) > 0}
          />
        </div>
      </Section>

      <Section title="Body-Weight & Programme">
        <div className="grid gap-4 grid-cols-3">
          <StatCard
            label="Gewicht-Logs"
            value={data.body_weight_logs?.total}
          />
          <StatCard label="Programme" value={data.programs?.total} />
          <StatCard
            label="Geteilt"
            value={data.programs?.shared}
            highlight={(data.programs?.shared ?? 0) > 0}
          />
        </div>
      </Section>

      {topExercises.length > 0 && (
        <Section title="Top Exercises">
          <div className="space-y-2">
            {topExercises.map((exercise, i) => {
              const pct =
                maxSessionCount > 0
                  ? (exercise.session_count / maxSessionCount) * 100
                  : 0;

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2"
                >
                  <span className="w-6 text-center text-sm font-bold text-zinc-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-zinc-200">
                    {exercise.name}
                  </span>
                  <div className="w-32">
                    <div className="h-2.5 rounded-full bg-zinc-800">
                      <div
                        className="h-2.5 rounded-full bg-emerald-500/70"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-14 text-right text-sm font-bold text-zinc-100">
                    {formatNumber(exercise.session_count)}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
