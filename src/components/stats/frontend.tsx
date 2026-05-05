interface FrontendStatsData {
  timestamp: string;
  last_scrape: {
    run_id: number;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    cities: string | null;
    events_found: number;
    valid_events: number;
    events_regex: number;
    events_llm: number;
    events_new: number;
  } | null;
  last_rating: {
    run_id: number;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    events_rated: number;
    ratings_failed: number;
    input_tokens: number;
    output_tokens: number;
    user_ratings_written: number;
    rating_users: string[];
  } | null;
  daily_7d: Array<{
    day: string;
    found: number;
    valid: number;
    new_events: number;
    rated: number;
    ratings_written: number;
    failures: number;
    input_tokens: number;
    output_tokens: number;
  }>;
  totals: {
    events_distinct: number;
    user_ratings: number;
    rating_users: number;
    rated_events: number;
  };
}

export function FrontendStats({ data }: { data: FrontendStatsData }) {
  const counterDrift =
    data.last_rating &&
    Math.abs(data.last_rating.events_rated - data.last_rating.user_ratings_written) > 5;

  return (
    <div className="space-y-6">
      <Section title="Letzter Scrape">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Gestartet"
            value={formatDateTime(data.last_scrape?.started_at)}
          />
          <StatCard
            label="Events gefunden"
            value={data.last_scrape?.events_found}
            muted
          />
          <StatCard
            label="davon NEU"
            value={data.last_scrape?.events_new}
            sub="erstmals gesehen"
          />
          <StatCard label="Valid Events" value={data.last_scrape?.valid_events} muted />
          <StatCard
            label="Dauer"
            value={formatDuration(data.last_scrape?.duration_seconds)}
          />
        </div>
        {data.last_scrape?.cities && (
          <p className="mt-2 text-xs text-zinc-500">
            Cities: {data.last_scrape.cities}
          </p>
        )}
      </Section>

      <Section title="Letzter Rating-Lauf">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Gestartet"
            value={formatDateTime(data.last_rating?.started_at)}
          />
          <StatCard
            label="Counter (status)"
            value={data.last_rating?.events_rated}
            sub={counterDrift ? "Drift vs. echte Inserts" : undefined}
            tone={counterDrift ? "warn" : undefined}
            muted={!counterDrift}
          />
          <StatCard
            label="Geschrieben"
            value={data.last_rating?.user_ratings_written}
            sub={formatUsers(data.last_rating?.rating_users)}
          />
          <StatCard
            label="Fehlgeschlagen"
            value={data.last_rating?.ratings_failed}
            tone={(data.last_rating?.ratings_failed ?? 0) > 0 ? "warn" : undefined}
          />
          <StatCard
            label="Tokens (in / out)"
            value={
              data.last_rating
                ? `${formatThousands(data.last_rating.input_tokens)} / ${formatThousands(data.last_rating.output_tokens)}`
                : undefined
            }
          />
        </div>
      </Section>

      <Section title="Letzte 7 Tage">
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-left">Tag</th>
                <th className="px-3 py-2 text-right">Found</th>
                <th className="px-3 py-2 text-right text-zinc-300">Neu</th>
                <th className="px-3 py-2 text-right">Valid</th>
                <th className="px-3 py-2 text-right">Counter</th>
                <th className="px-3 py-2 text-right text-zinc-300">Geschrieben</th>
                <th className="px-3 py-2 text-right">Failures</th>
                <th className="px-3 py-2 text-right">In-Tok</th>
                <th className="px-3 py-2 text-right">Out-Tok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.daily_7d.map((row) => (
                <tr key={row.day} className="text-zinc-200">
                  <td className="px-3 py-2 font-mono text-xs">{row.day}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">
                    {formatThousands(row.found)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-zinc-100">
                    {formatThousands(row.new_events)}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-400">
                    {formatThousands(row.valid)}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-400">
                    {formatThousands(row.rated)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-zinc-100">
                    {formatThousands(row.ratings_written)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right ${row.failures > 0 ? "text-amber-400" : ""}`}
                  >
                    {row.failures}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-400">
                    {formatThousands(row.input_tokens)}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-400">
                    {formatThousands(row.output_tokens)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="flex flex-wrap gap-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <span>
          Distinct Events:{" "}
          <span className="text-zinc-300">{formatThousands(data.totals.events_distinct)}</span>
        </span>
        <span>
          User Ratings:{" "}
          <span className="text-zinc-300">{formatThousands(data.totals.user_ratings)}</span>{" "}
          (von {data.totals.rating_users} Usern auf {formatThousands(data.totals.rated_events)} Events)
        </span>
      </div>
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
  sub,
  tone,
  muted,
}: {
  label: string;
  value?: number | string;
  sub?: string;
  tone?: "warn";
  muted?: boolean;
}) {
  const valueColor =
    tone === "warn" ? "text-amber-400" : muted ? "text-zinc-400" : "text-zinc-100";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value ?? "--"}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function formatDateTime(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | null | undefined): string | undefined {
  if (seconds == null) return undefined;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatThousands(n: number | null | undefined): string {
  if (n == null) return "--";
  return n.toLocaleString("de-DE");
}

function formatUsers(users: string[] | undefined): string | undefined {
  if (!users || users.length === 0) return undefined;
  if (users.length === 1) return `von ${users[0]}`;
  if (users.length <= 2) return `von ${users.join(", ")}`;
  return `von ${users.length} Usern`;
}
