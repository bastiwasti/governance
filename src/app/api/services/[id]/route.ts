import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Service, ServiceUpdateInput } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const service = db
    .prepare("SELECT * FROM services WHERE id = ? OR slug = ?")
    .get(id, id) as Service | undefined;

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = (await request.json()) as ServiceUpdateInput;

  const existing = db
    .prepare("SELECT * FROM services WHERE id = ? OR slug = ?")
    .get(id, id) as Service | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fields: string[] = [];
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (
      [
        "name",
        "slug",
        "url",
        "internal_url",
        "type",
        "repo",
        "health_endpoint",
        "stats_endpoint",
        "status",
        "notes",
      ].includes(key)
    ) {
      fields.push(`${key} = @${key}`);
      values[key] = value;
    }
  }

  if (fields.length === 0) {
    return NextResponse.json(existing);
  }

  fields.push("updated_at = datetime('now')");
  values["service_id"] = existing.id;

  const stmt = db.prepare(
    `UPDATE services SET ${fields.join(", ")} WHERE id = @service_id`
  );
  stmt.run(values);

  const updated = db
    .prepare("SELECT * FROM services WHERE id = ?")
    .get(existing.id) as Service;

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM services WHERE id = ? OR slug = ?")
    .get(id, id) as Service | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM uptime_checks WHERE service_id = ?").run(
    existing.id
  );
  db.prepare("DELETE FROM stats_snapshots WHERE service_id = ?").run(
    existing.id
  );
  db.prepare("DELETE FROM services WHERE id = ?").run(existing.id);

  return NextResponse.json({ ok: true });
}
