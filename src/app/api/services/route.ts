import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Service, ServiceCreateInput } from "@/lib/types";

export async function GET() {
  const db = getDb();
  const services = db
    .prepare(
      `SELECT s.*,
        uc.status as latest_status,
        uc.response_ms as latest_response_ms,
        uc.timestamp as latest_check_time,
        (SELECT COUNT(*) FROM uptime_checks uc2 WHERE uc2.service_id = s.id AND uc2.status = 'up' AND uc2.timestamp > datetime('now', '-24 hours')) * 100.0
          / NULLIF((SELECT COUNT(*) FROM uptime_checks uc3 WHERE uc3.service_id = s.id AND uc3.timestamp > datetime('now', '-24 hours')), 0) as uptime_24h,
        CASE WHEN ss.id IS NOT NULL THEN 1 ELSE 0 END as stats_available
      FROM services s
      LEFT JOIN uptime_checks uc ON uc.id = (
        SELECT id FROM uptime_checks WHERE service_id = s.id ORDER BY timestamp DESC LIMIT 1
      )
      LEFT JOIN stats_snapshots ss ON ss.service_id = s.id AND ss.collected_at > datetime('now', '-2 days')
      GROUP BY s.id
      ORDER BY s.name`
    )
    .all();

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as ServiceCreateInput;

  if (!body.name || !body.slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    );
  }

  const stmt = db.prepare(`
    INSERT INTO services (name, slug, url, internal_url, type, repo, health_endpoint, stats_endpoint, status, notes)
    VALUES (@name, @slug, @url, @internal_url, @type, @repo, @health_endpoint, @stats_endpoint, @status, @notes)
  `);

  const result = stmt.run({
    name: body.name,
    slug: body.slug,
    url: body.url ?? null,
    internal_url: body.internal_url ?? null,
    type: body.type ?? "app",
    repo: body.repo ?? null,
    health_endpoint: body.health_endpoint ?? "/api/health",
    stats_endpoint: body.stats_endpoint ?? null,
    status: body.status ?? "active",
    notes: body.notes ?? null,
  });

  const service = db
    .prepare("SELECT * FROM services WHERE id = ?")
    .get(result.lastInsertRowid) as Service;

  return NextResponse.json(service, { status: 201 });
}
