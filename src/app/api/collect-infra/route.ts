import { NextResponse } from "next/server";
import { collectAllInfra } from "@/lib/ssh-collector";

export async function POST() {
  await collectAllInfra();
  return NextResponse.json({ ok: true });
}
