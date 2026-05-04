import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Webhook, WebhookCreateInput } from "@/lib/types";

export async function GET() {
  const db = getDb();
  const webhooks = db
    .prepare("SELECT * FROM webhooks ORDER BY created_at DESC")
    .all() as Webhook[];

  return NextResponse.json(webhooks);
}

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as WebhookCreateInput;

  if (!body.url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const stmt = db.prepare(
    `INSERT INTO webhooks (url, label, events, is_active) VALUES (@url, @label, @events, @is_active)`
  );

  const result = stmt.run({
    url: body.url,
    label: body.label ?? null,
    events: body.events ?? "down,up",
    is_active: body.is_active ?? 1,
  });

  const webhook = db
    .prepare("SELECT * FROM webhooks WHERE id = ?")
    .get(result.lastInsertRowid) as Webhook;

  return NextResponse.json(webhook, { status: 201 });
}
