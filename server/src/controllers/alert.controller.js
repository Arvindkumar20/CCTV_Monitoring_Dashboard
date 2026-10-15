
// import { alertService } from "../services/detection-service/alert.service.js";
// import { AlertLogService } from "../services/detection-service/alertLog.service.js";

// export const AlertController = {
//   // GET /api/alerts
//   async list(req, res) {
//     try {
//       const data = await AlertLogService.list(req.query);
//       res.json({ success: true, ...data });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // GET /api/alerts/:id
//   async detail(req, res) {
//     try {
//       const doc = await AlertLogService.getById(req.params.id);
//       if (!doc) return res.status(404).json({ success: false, message: "Not found" });
//       res.json({ success: true, data: doc });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // GET /api/alerts/stats?days=7
//   async stats(req, res) {
//     try {
//       const data = await AlertLogService.stats({ days: Number(req.query.days) || 7 });
//       res.json({ success: true, data });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // GET /api/alerts/failed?hours=24
//   async failed(req, res) {
//     try {
//       const data = await AlertLogService.failed({ hours: Number(req.query.hours) || 24 });
//       res.json({ success: true, data });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // POST /api/alerts/:id/retry
//   async retry(req, res) {
//     try {
//       const result = await alertService.retryFailedChannels(req.params.id);
//       res.json({ success: true, data: result });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // POST /api/alerts/:id/acknowledge
//   async acknowledge(req, res) {
//     try {
//       const { by = "admin", notes = "" } = req.body || {};
//       const doc = await AlertLogService.acknowledge(req.params.id, by, notes);
//       if (!doc) return res.status(404).json({ success: false, message: "Not found" });
//       res.json({ success: true, data: doc });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // DELETE /api/alerts/:id
//   async remove(req, res) {
//     try {
//       await AlertLogService.remove(req.params.id);
//       res.json({ success: true });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },

//   // POST /api/alerts/test  (manual trigger for testing)
//   async test(req, res) {
//     try {
//       const {
//         type = "person",
//         cameraName = "Test Camera",
//         cameraId = "test-01",
//         confidence = 0.95,
//         snapshotPath = null,
//         timestamp = new Date(),
//       } = req.body || {};

//       const result = await alertService.sendAlert({
//         type, cameraName, cameraId, confidence, snapshotPath, timestamp,
//       });
//       res.json({ success: true, data: result });
//     } catch (e) {
//       res.status(500).json({ success: false, message: e.message });
//     }
//   },
// };





// import { AlertLogService } from "../services/detection-service/alertLog.service";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import { AlertLogService } from "../services/detection-service/alertLog.service.js";

/**
 * @desc    Get all alerts (user-specific)
 * @route   GET /api/alerts
 * @access  Private
 */
export const listAlerts = asyncHandler(async (req, res) => {
  const result = await AlertLogService.list({
    ...req.query,
    userId: req.user.userId,
    userRole: req.user.role,
  });

  return successResponse(res, "Alerts fetched successfully", result);
});

/**
 * @desc    Get alert by ID
 * @route   GET /api/alerts/:id
 * @access  Private
 */
export const getAlert = asyncHandler(async (req, res) => {
  const alert = await AlertLogService.getById(
    req.params.id,
    req.user.userId,
    req.user.role
  );

  if (!alert) throw new AppError("Alert not found", 404);

  return successResponse(res, "Alert fetched successfully", alert);
});

/**
 * @desc    Get alert stats
 * @route   GET /api/alerts/stats
 * @access  Private
 */
export const getAlertStats = asyncHandler(async (req, res) => {
  const stats = await AlertLogService.stats({
    days: Number(req.query.days) || 7,
    userId: req.user.userId,
    userRole: req.user.role,
  });

  return successResponse(res, "Stats fetched successfully", stats);
});

/**
 * @desc    Get failed alerts
 * @route   GET /api/alerts/failed
 * @access  Private
 */
export const getFailedAlerts = asyncHandler(async (req, res) => {
  const alerts = await AlertLogService.failed({
    hours: Number(req.query.hours) || 24,
    userId: req.user.userId,
    userRole: req.user.role,
  });

  return successResponse(res, "Failed alerts fetched successfully", alerts);
});

/**
 * @desc    Acknowledge alert
 * @route   PATCH /api/alerts/:id/acknowledge
 * @access  Private
 */
export const acknowledgeAlert = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const alert = await AlertLogService.acknowledge(
    req.params.id,
    req.user.email,
    notes,
    req.user.userId,
    req.user.role
  );

  if (!alert) throw new AppError("Alert not found", 404);

  return successResponse(res, "Alert acknowledged", alert);
});

/**
 * @desc    Retry failed channels
 * @route   POST /api/alerts/:id/retry
 * @access  Private
 */
export const retryAlert = asyncHandler(async (req, res) => {
  const alert = await AlertLogService.getById(
    req.params.id,
    req.user.userId,
    req.user.role
  );

  if (!alert) throw new AppError("Alert not found", 404);

  const result = await alertService.retryFailedChannels(req.params.id);

  return successResponse(res, "Retry initiated", result);
});

/**
 * @desc    Delete alert
 * @route   DELETE /api/alerts/:id
 * @access  Private/Admin
 */
export const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await AlertLogService.remove(
    req.params.id,
    req.user.userId,
    req.user.role
  );

  if (!alert) throw new AppError("Alert not found", 404);

  return successResponse(res, "Alert deleted successfully");
});