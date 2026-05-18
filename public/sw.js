const CACHE_NAME = 'flowtrack-v2';
const urlsToCache = [
  '/',
  '/tasks',
  '/icon.svg',
  '/manifest.json'
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch (cache-first for static, network for API) ──────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return; // skip API routes
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {});
    })
  );
});

// ── Scheduled notification alarms (sent from useNotifications hook) ───────────
// Map of taskId -> timeoutId so we can cancel if needed
const scheduledAlarms = new Map();

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { taskId, title, body, delay } = event.data.payload;

    // Cancel any existing alarm for this task
    if (scheduledAlarms.has(taskId)) {
      clearTimeout(scheduledAlarms.get(taskId));
    }

    const timerId = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: taskId,
        renotify: false,
        data: { url: '/' }
      });
      scheduledAlarms.delete(taskId);
    }, delay);

    scheduledAlarms.set(taskId, timerId);
  }

  if (event.data.type === 'CANCEL_NOTIFICATION') {
    const { taskId } = event.data.payload;
    if (scheduledAlarms.has(taskId)) {
      clearTimeout(scheduledAlarms.get(taskId));
      scheduledAlarms.delete(taskId);
    }
  }
});

// ── Push event (server-sent push, future use) ─────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'FlowTrack', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'FlowTrack', {
      body: data.body || 'You have a task reminder.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/' }
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
