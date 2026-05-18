import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { subscription, userId } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const uid = userId || "anonymous";
    // Create a safe database key from endpoint URL
    const safeKey = subscription.endpoint.replace(/[.#$/[\]]/g, "_");

    await set(ref(db, `pushSubscriptions/${uid}/${safeKey}`), subscription);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
