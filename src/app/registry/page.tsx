import { getDb } from "@/lib/db";
import { RegistryClient } from "@/components/registry-client";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const db = getDb();
  const services = db
    .prepare("SELECT * FROM services ORDER BY name")
    .all() as Service[];

  return <RegistryClient initialServices={services} />;
}
