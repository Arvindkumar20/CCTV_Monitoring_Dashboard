







// import { EventEmitter } from "events";
// import { DetectionWorker } from "./detection-worker.service.js";
// import { alertService } from "./alert.service.js";
// import mongoose from "mongoose";
// import Camera from "../../models/camera.model.js";
// import logger from "../../config/logger.js";

// // ✅ Safe type helper — undefined/null pe crash nahi
// const safeUpper = (val, fallback = "UNKNOWN") => {
//   if (typeof val === "string" && val.length > 0) {
//     return val.toUpperCase();
//   }
//   return fallback;
// };

// export class DetectionManager extends EventEmitter {
//   constructor() {
//     super();
//     this.workers = new Map();
//     this.cameraMetaCache = new Map();
//   }

//   async registerCameraMeta(cameraId, meta) {
//     this.cameraMetaCache.set(cameraId, meta);
//   }

//   async loadCameraFromDB(cameraId) {
//     try {
//       const camera = await Camera.findOne({ cameraId })
//         .populate(
//           "createdBy",
//           "fullName email mobile isActive notificationsEnabled alertPreferences"
//         )
//         .lean();

//       if (!camera) {
//         logger.warn(`⚠️ Camera not found in DB: ${cameraId}`);
//         return null;
//       }

//       const meta = {
//         cameraId: camera.cameraId || camera._id.toString(),
//         name: camera.name,
//         rtspUrl: camera.rtspUrl,
//         userId: camera.createdBy?._id,
//         user: camera.createdBy,
//         detectionSettings: camera.detectionSettings,
//       };

//       this.cameraMetaCache.set(cameraId, meta);
//       return meta;
//     } catch (err) {
//       logger.error(`❌ Failed to load camera ${cameraId}:`, err);
//       return null;
//     }
//   }

//   async startWorker(cameraId, rtspUrl = null, options = {}) {
//     if (this.workers.has(cameraId)) {
//       logger.warn(`⚠️ Worker already running for ${cameraId}`);
//       return;
//     }

//     let meta = this.cameraMetaCache.get(cameraId);
//     if (!meta) {
//       meta = await this.loadCameraFromDB(cameraId);
//     }

//     if (!meta) {
//       throw new Error(`Cannot start worker: camera ${cameraId} not found`);
//     }

//     if (!meta.userId) {
//       throw new Error(`Camera ${cameraId} has no owner (user)`);
//     }

//     if (meta.user && !meta.user.isActive) {
//       logger.warn(`⚠️ Camera ${cameraId} owner is inactive. Worker not started.`);
//       throw new Error(`Camera owner is inactive`);
//     }

//     const worker = new DetectionWorker(
//       cameraId,
//       rtspUrl || meta.rtspUrl,
//       { ...meta.detectionSettings, ...options }
//     );

//     // ═══════════════════════════════════════════
//     // ✅ ALERT HANDLER — safe + full error logging
//     // ═══════════════════════════════════════════
//     worker.on("detection:alert", async (event) => {
//       try {
//         // ✅ Basic validation — crash se bachao
//         if (!event || typeof event !== "object") {
//           logger.warn(`⚠️ Invalid detection event for ${cameraId}:`, event);
//           return;
//         }

//         const currentMeta = this.cameraMetaCache.get(cameraId) || meta;
//         const cameraName = currentMeta?.name || cameraId;
//         const userId = currentMeta?.userId;

//         // ✅ SAFE — undefined pe crash nahi hoga
//         const eventType = safeUpper(event.type, "UNKNOWN");

//         logger.info(
//           `🚨 ALERT [${eventType}] ${cameraName} (conf=${event.confidence ?? "n/a"})`
//         );

//         this.emit("alert", {
//           ...event,
//           cameraName,
//           cameraId,
//           userId,
//         });

//         // ✅ userId hai to hi alert bhejo
//         if (!userId) {
//           logger.warn(`⚠️ No userId for camera ${cameraId}, skipping alert`);
//           return;
//         }

//         const result = await alertService.sendAlert({
//           type: event.type || "unknown",
//           cameraName,
//           cameraId,
//           rtspUrl: currentMeta?.rtspUrl,
//           confidence: event.confidence,
//           snapshotPath: event.snapshot,
//           timestamp: event.timestamp,
//           userId,
//         });

//         if (
//           result?.overallStatus === "success" ||
//           result?.overallStatus === "partial"
//         ) {
//           logger.info(
//             `✅ Alert dispatched for user ${userId} (${result.overallStatus})`
//           );
//         } else {
//           logger.warn(
//             `⚠️ Alert status: ${
//               result?.overallStatus || result?.status || "unknown"
//             } — ${result?.reason || "unknown"}`
//           );
//         }
//       } catch (err) {
//         logger.error(`❌ Alert dispatch failed [${cameraId}]:`, {
//           message: err?.message,
//           name: err?.name,
//           stack: err?.stack,
//           raw: err,
//         });
//       }
//     });

//     worker.on("worker:failed", ({ reason }) => {
//       logger.error(`❌ Worker failed [${cameraId}]: ${reason}`);
//       this.emit("worker:failed", { cameraId, reason });
//     });

//     // ✅ worker.set pehle, phir start (race condition se bachao)
//     this.workers.set(cameraId, worker);
//     worker.start();

//     logger.info(`✅ Detection worker started: ${cameraId}`);
//   }

//   stopWorker(cameraId) {
//     const worker = this.workers.get(cameraId);
//     if (!worker) return;
//     worker.stop();
//     this.workers.delete(cameraId);
//     logger.info(`⏹️ Detection worker stopped: ${cameraId}`);
//   }

//   stopAll() {
//     for (const [id, worker] of this.workers.entries()) {
//       worker.stop();
//     }
//     this.workers.clear();
//   }

//   getStatus() {
//     return Array.from(this.workers.values()).map((w) => w.getStatus());
//   }
// }

// export const detectionManager = new DetectionManager();





// services/detection-manager.service.js
import { EventEmitter } from "events";
import { DetectionWorker } from "./detection-worker.service.js";
import { alertService } from "./alert.service.js";
import Camera from "../../models/camera.model.js";
import logger from "../../config/logger.js";

const safeUpper = (val, fallback = "UNKNOWN") =>
  typeof val === "string" && val.length > 0 ? val.toUpperCase() : fallback;

export class DetectionManager extends EventEmitter {
  constructor() {
    super();
    this.workers = new Map();
    this.cameraMetaCache = new Map();
  }

  async registerCameraMeta(cameraId, meta) {
    this.cameraMetaCache.set(cameraId, meta);
  }

  async loadCameraFromDB(cameraId) {
    try {
      const camera = await Camera.findOne({ cameraId })
        .populate(
          "createdBy",
          "fullName email mobile isActive notificationsEnabled alertPreferences"
        )
        .lean();

      if (!camera) {
        logger.warn(`⚠️ Camera not found in DB: ${cameraId}`);
        return null;
      }

      const meta = {
        cameraId: camera.cameraId || camera._id.toString(),
        name: camera.name,
        rtspUrl: camera.rtspUrl,
        userId: camera.createdBy?._id,
        user: camera.createdBy,
        detectionSettings: camera.detectionSettings,
      };

      this.cameraMetaCache.set(cameraId, meta);
      return meta;
    } catch (err) {
      logger.error(`❌ Failed to load camera ${cameraId}:`, err);
      return null;
    }
  }

  async startWorker(cameraId, rtspUrl = null, options = {}) {
    if (this.workers.has(cameraId)) {
      logger.warn(`⚠️ Worker already running for ${cameraId}`);
      return;
    }

    let meta = this.cameraMetaCache.get(cameraId);
    if (!meta) meta = await this.loadCameraFromDB(cameraId);
    if (!meta) throw new Error(`Camera ${cameraId} not found`);

    if (!meta.userId) throw new Error(`Camera ${cameraId} has no owner`);
    if (meta.user && !meta.user.isActive) {
      throw new Error(`Camera owner is inactive`);
    }

    // ✅ Pass full camera data for schedule evaluation
    const worker = new DetectionWorker(
      cameraId,
      rtspUrl || meta.rtspUrl,
      {
        cameraData: {
          detectionSettings: meta.detectionSettings,
        },
        settings: {
          cooldownMs: meta.detectionSettings?.cooldownMs,
          frameSampleRate: meta.detectionSettings?.frameSampleRate,
        },
        ...options,
      }
    );

    worker.on("detection:alert", async (event) => {
      try {
        if (!event || typeof event !== "object") return;

        const currentMeta = this.cameraMetaCache.get(cameraId) || meta;
        const cameraName = currentMeta?.name || cameraId;
        const userId = currentMeta?.userId;
        const eventType = safeUpper(event.type, "UNKNOWN");

        logger.info(
          `🚨 ALERT [${eventType}] ${cameraName} (conf=${event.confidence ?? "n/a"})`
        );

        this.emit("alert", { ...event, cameraName, cameraId, userId });

        if (!userId) {
          logger.warn(`⚠️ No userId for camera ${cameraId}`);
          return;
        }

        await alertService.sendAlert({
          type: event.type || "unknown",
          cameraName,
          cameraId,
          rtspUrl: currentMeta?.rtspUrl,
          confidence: event.confidence,
          snapshotPath: event.snapshot,
          timestamp: event.timestamp,
          userId,
        });
      } catch (err) {
        logger.error(`❌ Alert dispatch failed [${cameraId}]:`, err);
      }
    });

    worker.on("rules:updated", ({ cameraId, rules }) => {
      this.emit("rules:updated", { cameraId, rules });
    });

    this.workers.set(cameraId, worker);
    worker.start();

    logger.info(`✅ Detection worker started: ${cameraId}`);
  }

  /**
   * ✅ NEW: Reload camera from DB and update worker rules
   * Call this when camera settings are updated via API
   */
  async reloadCamera(cameraId) {
    const worker = this.workers.get(cameraId);
    if (!worker) {
      logger.warn(`⚠️ No running worker for ${cameraId}`);
      return;
    }

    const meta = await this.loadCameraFromDB(cameraId);
    if (!meta) return;

    worker.updateCameraData({
      detectionSettings: meta.detectionSettings,
    });

    logger.info(`🔄 Camera reloaded: ${cameraId}`);
  }

  stopWorker(cameraId) {
    const worker = this.workers.get(cameraId);
    if (!worker) return;
    worker.stop();
    this.workers.delete(cameraId);
    logger.info(`⏹️ Detection worker stopped: ${cameraId}`);
  }

  stopAll() {
    for (const [, worker] of this.workers.entries()) worker.stop();
    this.workers.clear();
  }

  getStatus() {
    return Array.from(this.workers.values()).map((w) => w.getStatus());
  }
}

export const detectionManager = new DetectionManager();