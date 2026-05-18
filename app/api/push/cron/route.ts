import { NextResponse } from "next/server";
import { checkAndSendReminders } from "@/app/api/push/vapid/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await checkAndSendReminders();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("Cron route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
