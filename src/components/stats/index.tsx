import { SofiaStats } from "./sofia";
import { KartenStats } from "./karten";
import { SchafkopfStats } from "./schafkopf-tracker";
import { WebscraperStats } from "./webscraper";
import { FrontendStats } from "./frontend";
import { FitnessStats } from "./fitness";
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
    case "karten":
      return <KartenStats data={data as Parameters<typeof KartenStats>[0]["data"]} />;
    case "schafkopf-tracker":
      return <SchafkopfStats data={data as Parameters<typeof SchafkopfStats>[0]["data"]} />;
    case "webscraper":
      return <WebscraperStats data={data as Parameters<typeof WebscraperStats>[0]["data"]} />;
    case "frontend":
      return <FrontendStats data={data as Parameters<typeof FrontendStats>[0]["data"]} />;
    case "fitness":
      return <FitnessStats data={data as Parameters<typeof FitnessStats>[0]["data"]} />;
    default:
      return <RawJsonStats data={data} />;
  }
}
