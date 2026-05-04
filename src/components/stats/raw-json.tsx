export function RawJsonStats({ data }: { data: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-800/50 p-4 text-xs text-zinc-400">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
