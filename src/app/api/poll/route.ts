import { NextResponse } from "next/server";
import { pollAllServices } from "@/lib/poller";

export async function POST() {
  try {
    await pollAllServices();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
