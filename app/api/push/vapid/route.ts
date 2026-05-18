import { NextResponse } from "next/server";
import webpush from "web-push";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";

// Global variable to keep track of background cron loop in Next.js dev/prod server
let cronStarted = false;

function startBackgroundCron(publicKey: string, privateKey: string) {
  if (cronStarted) return;
  cronStarted = true;
  console.log("🚀 Starting FlowTrack background Web Push runner...");

  webpush.setVapidDetails("mailto:admin@flowtrack.local", publicKey, privateKey);

  // Check every 60 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Fetch all users and all push subscriptions
      const [usersSnap, subsSnap] = await Promise.all([
        get(ref(db, "users")),
        get(ref(db, "pushSubscriptions"))
      ]);

      const usersData = usersSnap.val() || {};
      const subsData = subsSnap.val() || {};

      for (const [userId, userData] of Object.entries(usersData)) {
        const tasks: any = userData && typeof userData === "object" && "tasks" in userData ? (userData as any).tasks : {};
        if (!tasks) continue;

        const userSubs = subsData[userId] || {};
        const subscriptions = Object.values(userSubs);
        if (subscriptions.length === 0) continue;

        for (const task of Object.values(tasks) as any[]) {
          if (
            task &&
            task.category === "Daily" &&
            task.reminderTime === currentHHMM &&
            task.status !== "Completed"
          ) {
            // Check if already reminded today to avoid duplicate pushes
            const lastPushKey = `lastPush_${task.id}`;
            const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            if (task[lastPushKey] === todayStr) continue;

            console.log(`⏰ Sending Web Push for daily task [${task.title}] to user [${userId}]`);

            // Mark in DB that we pushed today
            await set(ref(db, `users/${userId}/tasks/${task.id}/${lastPushKey}`), todayStr);

            const payload = JSON.stringify({
              title: `⏰ FlowTrack Reminder: ${task.title}`,
              body: task.description || "It's time to complete your daily routine!",
              url: "/"
            });

            for (const sub of subscriptions as any[]) {
              try {
                await webpush.sendNotification(sub, payload);
              } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  // Subscription expired or unsubscribed
                } else {
                  console.error("Web push error:", err);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Cron runner error:", err);
    }
  }, 60000);
}

export async function GET() {
  try {
    const vapidRef = ref(db, "vapidKeys");
    const snap = await get(vapidRef);
    let keys = snap.val();

    if (!keys || !keys.publicKey || !keys.privateKey) {
      console.log("Generating new VAPID keys for Web Push...");
      keys = webpush.generateVAPIDKeys();
      await set(vapidRef, keys);
    }

    startBackgroundCron(keys.publicKey, keys.privateKey);

    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (error: any) {
    console.error("Error fetching VAPID keys:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
