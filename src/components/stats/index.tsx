import { SofiaStats } from "./sofia";
import { RawJsonStats } from "./raw-json";

export function StatsView({
  slug,
  data,
}: {
  slug: string;
  data: unknown;
}) {
  switch (slug) {
    case "sofia-guide":
      return <SofiaStats data={data as Parameters<typeof SofiaStats>[0]["data"]} />;
    default:
      return <RawJsonStats data={data} />;
  }
}
