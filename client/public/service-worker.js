/* eslint-disable no-restricted-globals */

const CACHE_NAME = "cctv-alerts-v1";

// ═══════════════════════════════════════════════════════════
// INSTALL
// ═══════════════════════════════════════════════════════════
self.addEventListener("install", (event) => {
  console.log("🔧 [SW] Installing...");
  self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════
// ACTIVATE
// ═══════════════════════════════════════════════════════════
self.addEventListener("activate", (event) => {
  console.log("✅ [SW] Activated");
  event.waitUntil(self.clients.claim());
});

// ═══════════════════════════════════════════════════════════
// PUSH EVENT — VAPID
// ═══════════════════════════════════════════════════════════
self.addEventListener("push", (event) => {
  console.log("📩 [SW] Push received");

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = {
      title: "New Alert",
      body: event.data ? event.data.text() : "",
    };
  }

  const alertType = data.data?.type || "info";

  // ✅ Type-specific vibration
  const vibrateMap = {
    fire: [300, 100, 300, 100, 300, 100, 300],
    smoke: [300, 100, 300, 100, 300],
    person: [200, 100, 200],
    info: [100],
  };

  const options = {
    body: data.body || "New alert received",
    icon: data.icon || "/icons/alert-icon.png",
    badge: data.badge || "/icons/badge.png",
    tag: data.tag || `alert-${Date.now()}`,
    requireInteraction: data.requireInteraction || alertType === "fire",
    urgency: data.urgency || "normal",
    vibrate: vibrateMap[alertType] || [200, 100, 200],
    silent: false,
    renotify: true,
    data: {
      url: data.data?.url || "/alerts",
      alertId: data.data?.alertId,
      type: alertType,
      cameraId: data.data?.cameraId,
      cameraName: data.data?.cameraName,
      confidence: data.data?.confidence,
      timestamp: data.data?.timestamp,
      snapshot: data.data?.snapshot,
    },
    actions: data.actions || [
      { action: "view", title: "👁️ View" },
      { action: "dismiss", title: "✕ Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "🚨 Alert", options)
  );
});

// ═══════════════════════════════════════════════════════════
// NOTIFICATION CLICK
// ═══════════════════════════════════════════════════════════
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ [SW] Notification clicked:", event.action);
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/alerts";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // ✅ Pehle se open tab focus karein
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            client.postMessage({
              type: "ALERT_CLICKED",
              data: event.notification.data,
            });
            return client.focus();
          }
        }
        // ✅ Nahi to naya window kholein
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// ═══════════════════════════════════════════════════════════
// NOTIFICATION CLOSE
// ═══════════════════════════════════════════════════════════
self.addEventListener("notificationclose", (event) => {
  console.log("❌ [SW] Notification closed");
});

// ═══════════════════════════════════════════════════════════
// PUSH SUBSCRIPTION CHANGE
// ═══════════════════════════════════════════════════════════
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("🔄 [SW] Subscription changed");

  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((newSubscription) => {
        return fetch(`${self.location.origin}/api/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            endpoint: newSubscription.endpoint,
            keys: newSubscription.toJSON().keys,
          }),
        });
      })
      .catch((err) => console.error("Re-subscribe failed:", err))
  );
});

// ═══════════════════════════════════════════════════════════
// MESSAGE FROM MAIN THREAD
// ═══════════════════════════════════════════════════════════
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});