import { NextResponse } from "next/server";
import { collectAllStats } from "@/lib/stats-collector";

export async function POST() {
  await collectAllStats();
  return NextResponse.json({ ok: true });
}
