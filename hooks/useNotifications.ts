"use client";

import { useEffect, useRef, useState } from "react";
import { Task } from "@/lib/tasks";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLocalAnonUid } from "@/hooks/useTasks";

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
  const { user, loading: authLoading } = useAuth();
  const subscribedUserIdRef = useRef<string | null>(null);
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 1. Request permission & setup Web Push subscription
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (authLoading) return;

    const currentUserId = user ? user.uid : getLocalAnonUid();

    async function initPush() {
      try {
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          setPermission(perm);
        } else {
          setPermission(Notification.permission);
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

          if (sub && subscribedUserIdRef.current !== currentUserId) {
            subscribedUserIdRef.current = currentUserId;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscription: sub,
                userId: currentUserId,
                timeZone
              })
            });
            console.log(`✅ Web Push subscription active for user [${currentUserId}] and synced with server.`);
          }
        }
      } catch (err) {
        console.error("Error initializing Web Push:", err);
      }
    }

    initPush();
  }, [user, authLoading]);

  // 2. Re-schedule instant alarms whenever tasks change or permission is granted
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
  }, [tasks, permission]);
}
