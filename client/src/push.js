import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function registerPush(token) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push not supported");
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      console.warn("Permission denied");
      return;
    }

    // Public key lo
    const { data } = await axios.get(`${API}/api/push/vapid-public-key`);

    // Subscribe
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.key),
    });

    // Backend me bhejo
    await axios.post(
      `${API}/api/push/subscribe`,
      { ...sub.toJSON(), userAgent: navigator.userAgent },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Push registered");
  } catch (err) {
    console.error("❌ Push registration failed:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}