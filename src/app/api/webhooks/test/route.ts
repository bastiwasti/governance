import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendNotifications } from "@/lib/notifier";
import type { Service } from "@/lib/types";

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as { webhook_id: number };
  const webhook = db
    .prepare("SELECT * FROM webhooks WHERE id = ?")
    .get(body.webhook_id);

  if (!webhook) {
    return NextResponse.json({ error: "webhook not found" }, { status: 404 });
  }

  const fakeService: Service = {
    id: 0,
    name: "Governance (Test)",
    slug: "governance-test",
    url: "governance.eventig.app",
    internal_url: null,
    type: "app",
    repo: null,
    health_endpoint: null,
    stats_endpoint: null,
    status: "active",
    notes: "Test-Webhook",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await sendNotifications(fakeService, "service.down");

  return NextResponse.json({ ok: true, message: "Test notification sent" });
}
