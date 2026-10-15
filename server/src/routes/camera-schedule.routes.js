// routes/camera-schedule.routes.js
import express from "express";
import Camera from "../models/camera.model.js";
import { computeActiveRules } from "../services/detection-service/schedule-evaluator.service.js";
import logger from "../config/logger.js";
import { detectionManager } from "../services/detection-service/detection-manager.service.js";

const router = express.Router();

// ═══════════════════════════════════════════
// ✅ GET: Schedule + current active rules
// ═══════════════════════════════════════════
router.get("/:cameraId/schedule", async (req, res) => {
  try {
    const camera = await Camera.findOne({ cameraId: req.params.cameraId }).lean();
    if (!camera) return res.status(404).json({ error: "Camera not found" });

    const activeRules = computeActiveRules(camera);

    res.json({
      success: true,
      schedule: camera.detectionSettings?.schedule || {},
      detectionSettings: {
        detectPerson: camera.detectionSettings?.detectPerson,
        detectFire: camera.detectionSettings?.detectFire,
        detectSmoke: camera.detectionSettings?.detectSmoke,
        detectVehicle: camera.detectionSettings?.detectVehicle,
      },
      currentActiveRules: activeRules,
    });
  } catch (err) {
    logger.error("Get schedule error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ PUT: Update full schedule
// ═══════════════════════════════════════════
router.put("/:cameraId/schedule", async (req, res) => {
  try {
    const { schedule } = req.body;

    // ✅ Validate
    if (schedule?.slots) {
      for (const slot of schedule.slots) {
        if (!slot.detectionType) {
          return res.status(400).json({ error: "detectionType required" });
        }
        if (slot.timeWindows) {
          for (const w of slot.timeWindows) {
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(w.startTime)) {
              return res.status(400).json({ error: `Invalid startTime: ${w.startTime}` });
            }
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(w.endTime)) {
              return res.status(400).json({ error: `Invalid endTime: ${w.endTime}` });
            }
          }
        }
      }
    }

    const camera = await Camera.findOneAndUpdate(
      { cameraId: req.params.cameraId },
      { $set: { "detectionSettings.schedule": schedule } },
      { new: true, runValidators: true }
    );

    if (!camera) return res.status(404).json({ error: "Camera not found" });

    // ✅ HOT RELOAD - worker ko immediately update karo
    await detectionManager.reloadCamera(req.params.cameraId);

    const activeRules = computeActiveRules(camera.toObject());

    res.json({
      success: true,
      message: "Schedule updated & applied",
      schedule: camera.detectionSettings.schedule,
      currentActiveRules: activeRules,
    });
  } catch (err) {
    logger.error("Update schedule error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════
// ✅ POST: Quick presets (day/night/custom)
// ═══════════════════════════════════════════
router.post("/:cameraId/schedule/preset", async (req, res) => {
  try {
    const { preset } = req.body; // "day-only" | "night-only" | "24x7" | "fire-24x7"

    let schedule;

    switch (preset) {
      case "24x7":
        schedule = { scheduleEnabled: false }; // always on
        break;

      case "day-only":
        schedule = {
          scheduleEnabled: true,
          timezone: "Asia/Kolkata",
          slots: [
            {
              detectionType: "person",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "06:00", endTime: "18:00" }],
            },
            {
              detectionType: "fire",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "06:00", endTime: "18:00" }],
            },
            {
              detectionType: "smoke",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "06:00", endTime: "18:00" }],
            },
          ],
        };
        break;

      case "night-only":
        schedule = {
          scheduleEnabled: true,
          timezone: "Asia/Kolkata",
          slots: [
            {
              detectionType: "person",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "22:00", endTime: "06:00" }],
            },
            {
              detectionType: "fire",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "22:00", endTime: "06:00" }],
            },
            {
              detectionType: "smoke",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "22:00", endTime: "06:00" }],
            },
          ],
        };
        break;

      case "fire-24x7":
        schedule = {
          scheduleEnabled: true,
          timezone: "Asia/Kolkata",
          slots: [
            {
              detectionType: "fire",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [], // empty = always active
            },
            {
              detectionType: "person",
              enabled: true,
              days: [1, 2, 3, 4, 5, 6, 0],
              timeWindows: [{ startTime: "22:00", endTime: "06:00" }],
            },
          ],
        };
        break;

      default:
        return res.status(400).json({ error: "Unknown preset" });
    }

    const camera = await Camera.findOneAndUpdate(
      { cameraId: req.params.cameraId },
      { $set: { "detectionSettings.schedule": schedule } },
      { new: true }
    );

    if (!camera) return res.status(404).json({ error: "Camera not found" });

    await detectionManager.reloadCamera(req.params.cameraId);

    res.json({
      success: true,
      preset,
      schedule: camera.detectionSettings.schedule,
      currentActiveRules: computeActiveRules(camera.toObject()),
    });
  } catch (err) {
    logger.error("Preset error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;