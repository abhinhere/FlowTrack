"use client";

import { useEffect, useRef } from "react";
import { Task } from "@/lib/tasks";
import { useAuth } from "@/components/auth/AuthProvider";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests notification permission, registers Web Push subscription with backend,
 * and schedules daily-task reminders. Works in active tabs, background service worker,
 * and completely closed PWA/browser windows via Web Push.
 */
export function useNotifications(tasks: Task[]) {
  const scheduledRef = useRef<Set<string>>(new Set());
  const { user } = useAuth();
  const pushSubscribedRef = useRef(false);

  // 1. Request permission & setup Web Push subscription
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    async function initPush() {
      try {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }

        if (Notification.permission !== "granted") return;

        // Fetch VAPID public key & start server background cron
        const res = await fetch("/api/push/vapid");
        if (!res.ok) return;
        const { publicKey } = await res.json();
        if (!publicKey) return;

        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
          }

          if (sub && !pushSubscribedRef.current) {
            pushSubscribedRef.current = true;
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscription: sub,
                userId: user?.uid || "anonymous"
              })
            });
            console.log("✅ Web Push subscription active and synced with server.");
          }
        }
      } catch (err) {
        console.error("Error initializing Web Push:", err);
      }
    }

    initPush();
  }, [user]);

  // 2. Re-schedule instant alarms whenever tasks change (for active session / SW)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    tasks
      .filter(t => t.category === "Daily" && t.reminderTime && t.status !== "Completed")
      .forEach(task => {
        const key = `${task.id}-${task.reminderTime}`;
        if (scheduledRef.current.has(key)) return; // already scheduled this session

        const [hStr, mStr] = (task.reminderTime as string).split(":");
        const fireAt = new Date(todayBase.getTime());
        fireAt.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

        const msUntilFire = fireAt.getTime() - now.getTime();
        if (msUntilFire <= 0) return; // time already passed today

        scheduledRef.current.add(key);

        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SCHEDULE_NOTIFICATION",
            payload: {
              taskId: task.id,
              title: `⏰ FlowTrack — ${task.title}`,
              body: task.description || "Time to complete your daily task!",
              delay: msUntilFire
            }
          });
        } else {
          setTimeout(() => {
            if (Notification.permission === "granted") {
              new Notification(`⏰ FlowTrack — ${task.title}`, {
                body: task.description || "Time to complete your daily task!",
                icon: "/icon.svg",
                badge: "/icon.svg",
                tag: task.id
              });
            }
          }, msUntilFire);
        }
      });
  }, [tasks]);
}
