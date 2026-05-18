import { NextResponse } from "next/server";
import webpush from "web-push";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";

// Global variable to keep track of background cron loop in Next.js dev/prod server
let cronStarted = false;

function getCurrentHHMMInTimeZone(timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find(p => p.type === "hour")?.value || "00";
    const minutePart = parts.find(p => p.type === "minute")?.value || "00";
    let hourInt = parseInt(hourPart, 10);
    if (hourInt === 24) hourInt = 0;
    return `${String(hourInt).padStart(2, "0")}:${minutePart}`;
  } catch (err) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

export async function checkAndSendReminders(pubKey?: string, privKey?: string) {
  try {
    let publicKey = pubKey;
    let privateKey = privKey;
    if (!publicKey || !privateKey) {
      const vapidRef = ref(db, "vapidKeys");
      const snap = await get(vapidRef);
      const keys = snap.val();
      if (!keys || !keys.publicKey || !keys.privateKey) return;
      publicKey = keys.publicKey;
      privateKey = keys.privateKey;
    }

    if (!publicKey || !privateKey) return;

    webpush.setVapidDetails("mailto:admin@flowtrack.local", publicKey, privateKey);

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
          task.reminderTime &&
          task.status !== "Completed"
        ) {
          for (const sub of subscriptions as any[]) {
            const userTz = sub.timeZone || "UTC";
            const currentHHMM = getCurrentHHMMInTimeZone(userTz);

            if (task.reminderTime === currentHHMM) {
              const nowInTz = new Intl.DateTimeFormat("en-US", {
                timeZone: userTz,
                year: "numeric",
                month: "numeric",
                day: "numeric"
              }).format(new Date());
              
              const lastPushKey = `lastPush_${task.id}`;
              if (task[lastPushKey] === nowInTz) continue;

              console.log(`⏰ Sending Web Push for daily task [${task.title}] to user [${userId}] (TZ: ${userTz}, Time: ${currentHHMM})`);

              await set(ref(db, `users/${userId}/tasks/${task.id}/${lastPushKey}`), nowInTz);
              task[lastPushKey] = nowInTz;

              const payload = JSON.stringify({
                title: `⏰ FlowTrack Reminder: ${task.title}`,
                body: task.description || "It's time to complete your daily routine!",
                url: "/"
              });

              try {
                await webpush.sendNotification(sub, payload);
                console.log("✅ Web push notification sent successfully.");
              } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  if (sub.endpoint) {
                    const safeKey = sub.endpoint.replace(/[.#$/[\]]/g, "_");
                    await set(ref(db, `pushSubscriptions/${userId}/${safeKey}`), null);
                  }
                } else {
                  console.error("Web push error:", err);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("checkAndSendReminders error:", err);
  }
}

function startBackgroundCron(publicKey: string, privateKey: string) {
  if (cronStarted) return;
  cronStarted = true;
  console.log("🚀 Starting FlowTrack background Web Push runner...");

  // Run immediately on start
  checkAndSendReminders(publicKey, privateKey);

  // Check every 30 seconds for precise timing
  setInterval(() => {
    checkAndSendReminders(publicKey, privateKey);
  }, 30000);
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
