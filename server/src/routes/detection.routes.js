// routes/detection.routes.js
import express from "express";
import { detectorClient } from "../services/detection-service/detection-worker.service.js";
import { detectionManager } from "../services/detection-service/detection-manager.service.js";
import logger from "../config/logger.js";
import Camera from "../models/camera.model.js";
import { computeActiveRules } from "../services/detection-service/schedule-evaluator.service.js";



const router = express.Router();

// ═══════════════════════════════════════════
// ✅ GET /api/detection/status
// Full system status: WS + all workers
// ═══════════════════════════════════════════
router.get("/status", async (req, res) => {
  try {
    const detector = detectorClient.getStatus();
    const workers = detectionManager.getStatus();

    res.json({
      success: true,
      detector,
      workerCount: workers.length,
      workers,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error("Status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ GET /api/detection/camera/:cameraId/rules
// Current active rules for a camera (live)
// ═══════════════════════════════════════════
router.get("/camera/:cameraId/rules", async (req, res) => {
  try {
    const { cameraId } = req.params;
    const worker = detectionManager.workers.get(cameraId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: `No active worker for ${cameraId}`,
      });
    }

    const camera = await Camera.findOne({ cameraId }).lean();
    if (!camera) {
      return res
        .status(404)
        .json({ success: false, error: "Camera not found" });
    }

    const computed = computeActiveRules(camera);

    res.json({
      success: true,
      cameraId,
      workerRules: worker.currentRules,
      computedRules: computed,
      match:
        JSON.stringify(worker.currentRules) === JSON.stringify(computed),
    });
  } catch (err) {
    logger.error("Get rules error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ POST /api/detection/camera/:cameraId/rules/override
// 🧪 TESTING: Force override rules (bypass schedule)
// Body: { rules: { person: true, fire: false }, ttlSeconds: 300 }
// ═══════════════════════════════════════════
router.post("/camera/:cameraId/rules/override", async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { rules, ttlSeconds = 300 } = req.body;

    if (!rules || typeof rules !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "rules object required" });
    }

    const worker = detectionManager.workers.get(cameraId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: `No active worker for ${cameraId}`,
      });
    }

    const previousRules = worker.currentRules;

    // ✅ Push override to Python via WS
    detectorClient.updateRules(cameraId, rules, worker.settings || {});

    // ✅ Track override state
    worker.currentRules = {
      ...rules,
      _override: true,
      _overrideUntil: Date.now() + ttlSeconds * 1000,
    };

    // ✅ Auto-revert after TTL
    if (ttlSeconds > 0) {
      setTimeout(() => {
        try {
          worker._recomputeRules();
          logger.info(
            `⏱️ Override expired for ${cameraId}, reverted to schedule`,
          );
        } catch (e) {
          logger.error("Override revert error:", e);
        }
      }, ttlSeconds * 1000);
    }

    logger.info(`🧪 Override applied for ${cameraId}:`, rules);

    res.json({
      success: true,
      message: `Override applied for ${ttlSeconds}s`,
      cameraId,
      appliedRules: rules,
      previousRules,
      revertAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    });
  } catch (err) {
    logger.error("Override error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ POST /api/detection/camera/:cameraId/reload
// Force reload camera from DB and re-push rules
// ═══════════════════════════════════════════
router.post("/camera/:cameraId/reload", async (req, res) => {
  try {
    const { cameraId } = req.params;
    await detectionManager.reloadCamera(cameraId);

    const worker = detectionManager.workers.get(cameraId);
    res.json({
      success: true,
      message: "Camera reloaded",
      cameraId,
      currentRules: worker?.currentRules || null,
    });
  } catch (err) {
    logger.error("Reload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ POST /api/detection/camera/:cameraId/test-alert
// 🧪 Fake alert inject (test alert pipeline)
// ═══════════════════════════════════════════
router.post("/camera/:cameraId/test-alert", async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { type = "person", confidence = 0.99 } = req.body;

    const worker = detectionManager.workers.get(cameraId);
    if (!worker) {
      return res.status(404).json({ success: false, error: "No worker" });
    }

    // ✅ Emit fake event through worker → goes to alert handler
    worker.emit("detection:alert", {
      cameraId,
      type,
      confidence,
      bbox: [100, 100, 400, 400],
      snapshot: "/tmp/test-snapshot.jpg",
      timestamp: Date.now(),
      _test: true,
    });

    res.json({
      success: true,
      message: `Test ${type} alert fired for ${cameraId}`,
      event: { cameraId, type, confidence },
    });
  } catch (err) {
    logger.error("Test alert error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;