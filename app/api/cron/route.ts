import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { checkAndSendReminders } from "@/app/api/push/vapid/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vapidRef = ref(db, "vapidKeys");
    const snap = await get(vapidRef);
    const keys = snap.val();

    if (!keys || !keys.publicKey || !keys.privateKey) {
      return NextResponse.json({ error: "VAPID keys not generated yet" }, { status: 400 });
    }

    await checkAndSendReminders(keys.publicKey, keys.privateKey);

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("Cron route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
