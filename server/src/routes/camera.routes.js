import express from "express";
import {
  createCamera,
  getAllCameras,
  getCameraById,
  updateCamera,
  deleteCamera,
  getByCategory,
  getByMainCategory,
  getBySubCategory,
  getByNestedSubCategory,
  toggleStatus,
  updateStreamStatus,
  bulkDelete,
  bulkUpdateStatus,
  searchCameras,
  getStats,
  validateRtspUrl,
  getByRtspUrl,
  getRecentCameras,
  getStreamSummary,
  exportCameras,
  startStream,
  stopStream,
  restartStream,
  getStreamStatus,
  getStreamUrl,
  getActiveStreams,
  getStreamDashboardStats,
  clientDisconnected,
  cleanupInactiveStreams,
  getDetectionStatus,
  getAllDetectionStatus,
  toggleDetection,
  testDetection,
} from "../controllers/camera.controller.js";
import {
  createCameraValidation,
  updateCameraValidation,
  cameraIdValidation,
  getAllCamerasValidation,
  bulkDeleteValidation,
  bulkStatusUpdateValidation,
  getByCategoryValidation,
  updateStreamStatusValidation,
  validateRtspUrlValidation,
} from "../validations/camera.validation.js";


// import { checkPermission } from "../middleware/permission.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (within authenticated)
router.get("/stats", getStats);
router.get("/search", searchCameras);
router.get("/recent", getRecentCameras);
router.get("/stream-summary", getStreamSummary);
router.get("/export", exportCameras);
router.post("/validate-rtsp", validate(validateRtspUrlValidation), validateRtspUrl);
router.get("/by-rtsp/:rtspUrl", getByRtspUrl);
router.get("/by-category/:categoryType/:categoryId", validate(getByCategoryValidation), getByCategory);
router.get("/by-main-category/:mainCategoryId", getByMainCategory);
router.get("/by-sub-category/:subCategoryId", getBySubCategory);
router.get("/by-nested-sub-category/:nestedSubCategoryId", getByNestedSubCategory);

// CRUD routes
router.route("/")
  .get(
    validate(getAllCamerasValidation),
    getAllCameras
  )
  .post(
    validate(createCameraValidation),
    createCamera
  );

router.route("/bulk-delete")
  .post(
    validate(bulkDeleteValidation),
    bulkDelete
  );

router.route("/bulk-status")
  .patch(
    validate(bulkStatusUpdateValidation),
    bulkUpdateStatus
  );

router.route("/:id")
  .get(
    validate(cameraIdValidation),
    getCameraById
  )
  .patch(
    validate([...cameraIdValidation, ...updateCameraValidation]),
    updateCamera
  )
  .delete(
    validate(cameraIdValidation),
    deleteCamera
  );

router.route("/:id/toggle-status")
  .patch(
    validate(cameraIdValidation),
    toggleStatus
  );

router.route("/:id/stream-status")
  .patch(
    validate([...cameraIdValidation, ...updateStreamStatusValidation]),
    updateStreamStatus
  );

  router.post('/:cameraId/stream/start', startStream);
router.post('/:cameraId/stream/stop', stopStream);
router.post('/:cameraId/stream/restart', restartStream);
router.get('/:cameraId/stream/status', getStreamStatus);
router.get('/:cameraId/stream/url', getStreamUrl);

// Bulk stream management
router.get('/streams/active', getActiveStreams);
router.get('/streams/dashboard-stats', getStreamDashboardStats);
router.get('/streams/summary', getStreamSummary);
router.post('/streams/client-disconnect', clientDisconnected);

// ✅ Detection routes (NEW)
router.get(
  "/:cameraId/detection/status",
  authenticate,
  getDetectionStatus,
);

router.get(
  "/detection/all",
  authenticate,
  getAllDetectionStatus,
);

router.patch(
  "/:cameraId/detection/toggle",
  authenticate,
  toggleDetection,
);

router.post(
  "/:cameraId/detection/test",
  authenticate,
  testDetection,
);
// rtsp://chinamdvr.com:6604/3/3?AVType=1&jsession=de2301e074af4234b6537c1f793fbb88&DevIDNO=018270236711&Channel=0&Stream=1



// Admin only routes
// router.post(
//   '/streams/cleanup', 
//   authorize(['admin']), 
//   cleanupInactiveStreams
// );


export const cameraRoter= router;




// // routes/camera.routes.js
// import express from 'express';
// import * as from '../controllers/camera.controller.js';
// import { authenticate } from '../middlewares/auth.middleware.js';

// const router = express.Router();

// // All routes require authentication
// router.use(authenticate);

// // WebRTC routes
// router.get('/:id/webrtc-stream', getWebRTCStream);
// router.post('/webrtc-connect', connectWebRTC);
// router.post('/:id/webrtc-stop', stopWebRTCStream);
// router.get('/:id/webrtc-stats', getWebRTCStats);
// router.get('/webrtc/active', getActiveWebRTCStreams);
// router.post('/webrtc/bulk', bulkWebRTC);

// // CRUD routes
// router.post('/', createCamera);
// router.get('/', getAllCameras);
// router.get('/:id', getCameraById);
// router.put('/:id', updateCamera);
// router.delete('/:id', deleteCamera);

// // Category routes
// router.get('/by-category/:categoryType/:categoryId', getByCategory);
// router.get('/by-main-category/:mainCategoryId', getByMainCategory);
// router.get('/by-sub-category/:subCategoryId', getBySubCategory);
// router.get('/by-nested-sub-category/:nestedSubCategoryId', getByNestedSubCategory);

// // Status routes
// router.patch('/:id/toggle-status', toggleStatus);
// router.patch('/:id/stream-status', updateStreamStatus);

// // Bulk operations
// router.post('/bulk-delete', bulkDelete);
// router.patch('/bulk-status', bulkUpdateStatus);

// // Search and stats
// router.get('/search', searchCameras);
// router.get('/stats', getStats);
// router.get('/stream-summary', getStreamSummary);

// // Validation and export
// router.post('/validate-rtsp', validateRtspUrl);
// router.get('/by-rtsp/:rtspUrl', getByRtspUrl);
// router.get('/recent', getRecentCameras);
// router.get('/export', exportCameras);

// export const cameraRoter= router;