interface ContainerInfo {
  name: string;
  image: string;
  status: string;
}

export function ContainerTable({ containers }: { containers: ContainerInfo[] }) {
  if (containers.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Keine Container-Daten vorhanden.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-zinc-500">
            <th className="pb-2 pr-4 font-medium">Name</th>
            <th className="pb-2 pr-4 font-medium">Image</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((c) => (
            <tr key={c.name} className="border-b border-zinc-800/50">
              <td className="py-2 pr-4 text-zinc-200">{c.name}</td>
              <td className="py-2 pr-4 font-mono text-xs text-zinc-400">
                {c.image}
              </td>
              <td className="py-2">
                <span
                  className={
                    c.status.startsWith("Up")
                      ? "text-emerald-400"
                      : "text-zinc-500"
                  }
                >
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
