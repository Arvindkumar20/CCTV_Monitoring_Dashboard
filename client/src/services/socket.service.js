import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.listeners = new Map();
    this.pendingListeners = [];
  }

  /**
   * ✅ Connect to Socket.IO
   */
  connect(token) {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    if (this.socket) this.disconnect();

    this.token = token;

    this.socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("✅ [Socket] Connected:", this.socket.id);
      this._flushPendingListeners();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 [Socket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Error:", err.message);
      // 🆕 Don't clear pendingListeners — reconnection pe flush honge
    });

    this.socket.on("reconnect", (attempt) => {
      console.log(`🔄 [Socket] Reconnected (attempt ${attempt})`);
      this._flushPendingListeners(); // 🆕 safety net
    });

    return this.socket;
  }

  /**
   * 🆕 Flush pending listeners (connect/reconnect pe)
   */
  _flushPendingListeners() {
    if (!this.socket) return;

    this.pendingListeners.forEach(({ event, handler }) => {
      // 🆕 dedup: same event + same handler dobara register na ho
      const existing = this.listeners.get(event);
      if (existing?.has(handler)) return;

      this.socket.on(event, handler);
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event).add(handler);
    });

    this.pendingListeners = [];
    console.log(`✅ [Socket] Flushed ${this.listeners.size} event types`);
  }

  /**
   * ✅ Disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.listeners.clear();
      this.pendingListeners = [];
    }
  }

  /**
   * ✅ Register event listener (auto-queue if not connected yet)
   */
  on(event, handler) {
    // 🆕 dedup: same event + same handler already registered? skip
    const existing = this.listeners.get(event);
    if (existing?.has(handler)) {
      console.warn(`[Socket] Listener already registered for "${event}" — skipping`);
      return;
    }

    if (!this.socket) {
      console.warn(`[Socket] Queuing listener until connected: ${event}`);
      this.pendingListeners.push({ event, handler });
      return;
    }

    this.socket.on(event, handler);
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
  }

  /**
   * ✅ Remove listener
   */
  off(event, handler) {
    if (handler) {
      this.pendingListeners = this.pendingListeners.filter(
        (l) => !(l.event === event && l.handler === handler)
      );
    } else {
      this.pendingListeners = this.pendingListeners.filter((l) => l.event !== event);
    }

    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler);
      this.listeners.get(event)?.delete(handler);
      if (this.listeners.get(event)?.size === 0) this.listeners.delete(event);
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * ✅ Emit event
   */
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Cannot emit "${event}" — not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * ✅ Subscribe to specific cameras
   */
  subscribeCameras(cameraIds = []) {
    this.emit("subscribe:cameras", cameraIds);
  }

  /**
   * ✅ Unsubscribe cameras
   */
  unsubscribeCameras(cameraIds = []) {
    this.emit("unsubscribe:cameras", cameraIds);
  }

  /**
   * ✅ Acknowledge an alert
   */
  acknowledgeAlert(alertId) {
    this.emit("alert:ack", alertId);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();