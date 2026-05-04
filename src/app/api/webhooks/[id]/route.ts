import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const result = db.prepare("DELETE FROM webhooks WHERE id = ?").run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const existing = db
    .prepare("SELECT * FROM webhooks WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  db.prepare(
    `UPDATE webhooks SET url = ?, label = ?, events = ?, is_active = ? WHERE id = ?`
  ).run(
    (body.url as string) ?? existing.url,
    (body.label as string) ?? existing.label,
    (body.events as string) ?? existing.events,
    (body.is_active as number) ?? existing.is_active,
    id
  );

  const updated = db
    .prepare("SELECT * FROM webhooks WHERE id = ?")
    .get(id);

  return NextResponse.json(updated);
}
