import api from "../api";


class NotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  /**
   * ✅ Check browser support
   */
  isSupported() {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * ✅ Get permission status
   */
  getPermission() {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission; // "default" | "granted" | "denied"
  }

  /**
   * ✅ Register service worker
   */
  async registerServiceWorker() {
    if (!this.isSupported()) {
      throw new Error("Push notifications not supported");
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        { scope: "/" }
      );

      await navigator.serviceWorker.ready;
      console.log("✅ [SW] Registered:", this.registration.scope);
      return this.registration;
    } catch (err) {
      console.error("❌ [SW] Registration failed:", err);
      throw err;
    }
  }

  /**
   * ✅ Get or register service worker
   */
  async getRegistration() {
    if (this.registration) return this.registration;

    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await this.registerServiceWorker();
      this.registration = reg;
      return reg;
    } catch (err) {
      console.error("❌ [SW] Get registration failed:", err);
      return null;
    }
  }

  /**
   * ✅ Subscribe to push notifications
   */
  async subscribe() {
    if (!this.isSupported()) {
      throw new Error("Push notifications not supported in this browser");
    }

    // 1. Register SW
    const registration = await this.getRegistration();
    if (!registration) {
      throw new Error("Service worker registration failed");
    }

    // 2. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }

    // 3. Get VAPID public key from backend
    const { data } = await api.get("/push/vapid-public-key");
    const publicKey = data.key || data.data?.publicKey;

    if (!publicKey) {
      throw new Error("VAPID public key missing from server");
    }

    // 4. Subscribe via pushManager
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(publicKey),
      });
    }

    // 5. Send to backend
    const subJson = subscription.toJSON();
    await api.post("/push/subscribe", {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      userAgent: navigator.userAgent,
    });

    this.subscription = subscription;
    console.log("✅ Push subscription active");
    return subscription;
  }

  /**
   * ✅ Unsubscribe
   */
  async unsubscribe() {
    const registration = await this.getRegistration();
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;

    try {
      await api.post("/push/unsubscribe", { endpoint });
    } catch (err) {
      console.warn("Backend unsubscribe failed:", err.message);
    }

    await subscription.unsubscribe();
    this.subscription = null;
    console.log("🔕 Push unsubscribed");
  }

  /**
   * ✅ Check if already subscribed
   */
  async isSubscribed() {
    if (!this.isSupported()) return false;

    try {
      const registration = await this.getRegistration();
      if (!registration) return false;

      const sub = await registration.pushManager.getSubscription();
      return !!sub;
    } catch {
      return false;
    }
  }

  /**
   * ✅ Test push notification
   */
  async testPush() {
    return api.post("/push/test");
  }

  /**
   * ✅ Helper — VAPID key conversion
   */
  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default new NotificationService();