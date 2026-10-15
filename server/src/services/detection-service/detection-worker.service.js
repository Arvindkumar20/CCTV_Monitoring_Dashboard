
// // backend/services/detection-worker.service.js
// import WebSocket from "ws";
// import { EventEmitter } from "events";

// const WS_URL = process.env.DETECTOR_WS_URL || "ws://127.0.0.1:8765";

// class DetectorClient extends EventEmitter {
//   constructor() {
//     super();
//     this.ws = null;
//     this.connected = false;
//     this.reconnectDelay = 1000;
//     this.maxDelay = 30_000;
//     this.pendingCameras = new Map();
//     this._connect();
//   }

//   _connect() {
//     console.log(`🔌 Connecting to detector WS: ${WS_URL}`);
//     this.ws = new WebSocket(WS_URL);

//     this.ws.on("open", () => {
//       console.log("✅ Detector WS connected");
//       this.connected = true;
//       this.reconnectDelay = 1000;

//       for (const [cameraId, rtspUrl] of this.pendingCameras) {
//         this._send({ action: "add_camera", cameraId, rtspUrl });
//       }
//     });

//     this.ws.on("message", (data) => {
//       try {
//         const event = JSON.parse(data.toString());

//         // ✅ Ignore control messages
//         if (event.pong) return;      // ping response
//         if (event.ok) return;        // add/remove camera response

//         // ✅ Sirf valid detection events
//         if (!event.type || !event.cameraId) {
//           console.warn("⚠️ Invalid detection event:", event);
//           return;
//         }

//         this.emit("detection:alert", event);
//       } catch (e) {
//         console.warn("Bad WS msg:", data.toString().slice(0, 200));
//       }
//     });

//     this.ws.on("close", () => {
//       console.warn("❌ Detector WS closed. Reconnecting...");
//       this.connected = false;
//       setTimeout(() => this._connect(), this.reconnectDelay);
//       this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
//     });

//     this.ws.on("error", (err) => {
//       console.error("WS error:", err.message);
//     });
//   }

//   _send(obj) {
//     if (this.connected && this.ws.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify(obj));
//     }
//   }

//   addCamera(cameraId, rtspUrl) {
//     this.pendingCameras.set(cameraId, rtspUrl);
//     this._send({ action: "add_camera", cameraId, rtspUrl });
//   }

//   removeCamera(cameraId) {
//     this.pendingCameras.delete(cameraId);
//     this._send({ action: "remove_camera", cameraId });
//   }

//   getStatus() {
//     return {
//       connected: this.connected,
//       cameras: [...this.pendingCameras.keys()],
//     };
//   }
// }

// export const detectorClient = new DetectorClient();

// export class DetectionWorker extends EventEmitter {
//   constructor(cameraId, rtspUrl, options = {}) {
//     super();
//     this.cameraId = cameraId;
//     this.rtspUrl = rtspUrl;
//     this.isRunning = false;

//     this._onAlert = (event) => {
//       if (event.cameraId === this.cameraId) {
//         this.emit("detection:alert", event);
//       }
//     };
//     detectorClient.on("detection:alert", this._onAlert);
//   }

//   start() {
//     if (this.isRunning) return;
//     this.isRunning = true;
//     detectorClient.addCamera(this.cameraId, this.rtspUrl);
//   }

//   stop() {
//     this.isRunning = false;
//     detectorClient.removeCamera(this.cameraId);
//     detectorClient.off("detection:alert", this._onAlert);
//   }

//   getStatus() {
//     return {
//       cameraId: this.cameraId,
//       isRunning: this.isRunning,
//       mode: "shared-ws",
//     };
//   }
// }








// services/detection-worker.service.js
import WebSocket from "ws";
import { EventEmitter } from "events";
import logger from "../../config/logger.js";
import { computeActiveRules ,rulesChanged} from "./schedule-evaluator.service.js";
// import { computeActiveRules, rulesChanged } from "./schedule-evaluator.service.js";
// import logger from "../config/logger.js";

const WS_URL = process.env.DETECTOR_WS_URL || "ws://127.0.0.1:8765";

class DetectorClient extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.connected = false;
    this.reconnectDelay = 1000;
    this.maxDelay = 30_000;
    // ✅ cameraId → { rtspUrl, rules, meta }
    this.pendingCameras = new Map();
    this._connect();
  }

  _connect() {
    logger.info(`🔌 Connecting to detector WS: ${WS_URL}`);
    this.ws = new WebSocket(WS_URL);

    this.ws.on("open", () => {
      logger.info("✅ Detector WS connected");
      this.connected = true;
      this.reconnectDelay = 1000;

      // ✅ Re-send all cameras with latest rules
      for (const [cameraId, data] of this.pendingCameras) {
        this._send({
          action: "add_camera",
          cameraId,
          rtspUrl: data.rtspUrl,
          rules: data.rules,
          settings: data.settings,
        });
      }
    });

    this.ws.on("message", (data) => {
      try {
        const event = JSON.parse(data.toString());
        if (event.pong || event.ok) return;
        if (!event.type || !event.cameraId) {
          logger.warn("⚠️ Invalid detection event:", event);
          return;
        }
        this.emit("detection:alert", event);
      } catch (e) {
        logger.warn("Bad WS msg:", data.toString().slice(0, 200));
      }
    });

    this.ws.on("close", () => {
      logger.warn("❌ Detector WS closed. Reconnecting...");
      this.connected = false;
      setTimeout(() => this._connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
    });

    this.ws.on("error", (err) => {
      logger.error("WS error:", err.message);
    });
  }

  _send(obj) {
    if (this.connected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }

  addCamera(cameraId, rtspUrl, rules = null, settings = {}) {
    this.pendingCameras.set(cameraId, { rtspUrl, rules, settings });
    this._send({
      action: "add_camera",
      cameraId,
      rtspUrl,
      rules,
      settings,
    });
  }

  removeCamera(cameraId) {
    this.pendingCameras.delete(cameraId);
    this._send({ action: "remove_camera", cameraId });
  }

  /**
   * ✅ NEW: Update only the rules for a camera (no restart needed)
   */
  updateRules(cameraId, rules, settings = {}) {
    const data = this.pendingCameras.get(cameraId);
    if (!data) return false;

    data.rules = rules;
    data.settings = settings;

    return this._send({
      action: "update_rules",
      cameraId,
      rules,
      settings,
    });
  }

  getStatus() {
    return {
      connected: this.connected,
      cameras: [...this.pendingCameras.keys()],
    };
  }
}

export const detectorClient = new DetectorClient();

// ═══════════════════════════════════════════
// ✅ DetectionWorker - schedule-aware
// ═══════════════════════════════════════════
export class DetectionWorker extends EventEmitter {
  constructor(cameraId, rtspUrl, options = {}) {
    super();
    this.cameraId = cameraId;
    this.rtspUrl = rtspUrl;
    this.isRunning = false;

    // ✅ Full camera doc (for schedule computation)
    this.cameraData = options.cameraData || null;
    this.settings = options.settings || {};

    // ✅ Current active rules
    this.currentRules = null;
    this._rulesInterval = null;

    this._onAlert = (event) => {
      if (event.cameraId === this.cameraId) {
        // ✅ Extra safety: agar schedule ke hisaab se detection off hai to ignore
        if (this.currentRules && this.currentRules[event.type] === false) {
          logger.debug(
            `🔇 Ignored ${event.type} alert for ${this.cameraId} (schedule off)`
          );
          return;
        }
        this.emit("detection:alert", event);
      }
    };
    detectorClient.on("detection:alert", this._onAlert);
  }

  /**
   * ✅ Update camera data (called when camera settings change in DB)
   */
  updateCameraData(cameraData) {
    this.cameraData = cameraData;
    this._recomputeRules();
  }

  /**
   * ✅ Recompute active rules and push to Python if changed
   */
  _recomputeRules() {
    if (!this.cameraData) return;

    const newRules = computeActiveRules(this.cameraData);

    if (rulesChanged(this.currentRules, newRules)) {
      logger.info(
        `🔄 Rules changed for ${this.cameraId}:`,
        {
          person: newRules.person,
          fire: newRules.fire,
          smoke: newRules.smoke,
          vehicle: newRules.vehicle,
        }
      );

      this.currentRules = newRules;

      detectorClient.updateRules(this.cameraId, newRules, this.settings);

      // ✅ Emit for listeners (UI updates)
      this.emit("rules:updated", { cameraId: this.cameraId, rules: newRules });
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // ✅ Initial rules
    this.currentRules = this.cameraData
      ? computeActiveRules(this.cameraData)
      : null;

    detectorClient.addCamera(
      this.cameraId,
      this.rtspUrl,
      this.currentRules,
      this.settings
    );

    // ✅ Re-evaluate every minute (schedule boundaries)
    this._rulesInterval = setInterval(() => {
      this._recomputeRules();
    }, 60_000);

    logger.info(`✅ Worker started for ${this.cameraId}`, {
      rules: this.currentRules,
    });
  }

  stop() {
    this.isRunning = false;
    if (this._rulesInterval) {
      clearInterval(this._rulesInterval);
      this._rulesInterval = null;
    }
    detectorClient.removeCamera(this.cameraId);
    detectorClient.off("detection:alert", this._onAlert);
  }

  getStatus() {
    return {
      cameraId: this.cameraId,
      isRunning: this.isRunning,
      mode: "shared-ws",
      currentRules: this.currentRules,
      scheduleEnabled: this.cameraData?.detectionSettings?.schedule?.scheduleEnabled || false,
    };
  }
}