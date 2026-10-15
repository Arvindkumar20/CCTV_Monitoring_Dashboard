// import { cameraService } from "../services/camera.service.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { successResponse } from "../utils/response.js";
// import AppError from "../utils/AppError.js";

// /**
//  * Create new camera
//  * @route POST /api/cameras
//  * @access Private
//  */
// export const createCamera = asyncHandler(async (req, res) => {
//   console.log(req.body);
//   const camera = await cameraService.createCamera(req.body, req.user.userId);

//   return successResponse(res, "Camera created successfully", camera, 201);
// });

// /**
//  * Get all cameras
//  * @route GET /api/cameras
//  * @access Private
//  */
// export const getAllCameras = asyncHandler(async (req, res) => {
//   const result = await cameraService.getAllCameras(
//     req.query,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Cameras fetched successfully", result);
// });

// /**
//  * Get camera by ID
//  * @route GET /api/cameras/:id
//  * @access Private
//  */
// export const getCameraById = asyncHandler(async (req, res) => {
//   const camera = await cameraService.getCameraById(
//     req.params.id,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Camera fetched successfully", camera);
// });

// /**
//  * Update camera
//  * @route PUT /api/cameras/:id
//  * @access Private
//  */
// export const updateCamera = asyncHandler(async (req, res) => {
//   const camera = await cameraService.updateCamera(
//     req.params.id,
//     req.body,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Camera updated successfully", camera);
// });

// /**
//  * Delete camera
//  * @route DELETE /api/cameras/:id
//  * @access Private
//  */
// export const deleteCamera = asyncHandler(async (req, res) => {
//   const result = await cameraService.deleteCamera(
//     req.params.id,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Camera deleted successfully", result);
// });

// /**
//  * Get cameras by category
//  * @route GET /api/cameras/by-category/:categoryType/:categoryId
//  * @access Private
//  */
// export const getByCategory = asyncHandler(async (req, res) => {
//   const { categoryType, categoryId } = req.params;

//   const result = await cameraService.getByCategory(
//     categoryId,
//     categoryType,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Cameras fetched successfully", result);
// });

// /**
//  * Get cameras by main category
//  * @route GET /api/cameras/by-main-category/:mainCategoryId
//  * @access Private
//  */
// export const getByMainCategory = asyncHandler(async (req, res) => {
//   const result = await cameraService.getByMainCategory(
//     req.params.mainCategoryId,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Cameras fetched successfully", result);
// });

// /**
//  * Get cameras by sub category
//  * @route GET /api/cameras/by-sub-category/:subCategoryId
//  * @access Private
//  */
// export const getBySubCategory = asyncHandler(async (req, res) => {
//   const result = await cameraService.getBySubCategory(
//     req.params.subCategoryId,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Cameras fetched successfully", result);
// });

// /**
//  * Get cameras by nested sub category
//  * @route GET /api/cameras/by-nested-sub-category/:nestedSubCategoryId
//  * @access Private
//  */
// export const getByNestedSubCategory = asyncHandler(async (req, res) => {
//   const result = await cameraService.getByNestedSubCategory(
//     req.params.nestedSubCategoryId,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Cameras fetched successfully", result);
// });

// /**
//  * Toggle camera status
//  * @route PATCH /api/cameras/:id/toggle-status
//  * @access Private
//  */
// export const toggleStatus = asyncHandler(async (req, res) => {
//   const camera = await cameraService.toggleStatus(
//     req.params.id,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(
//     res,
//     `Camera ${camera.status === "active" ? "activated" : camera.status === "inactive" ? "deactivated" : "set to maintenance"} successfully`,
//     camera,
//   );
// });

// /**
//  * Update stream status
//  * @route PATCH /api/cameras/:id/stream-status
//  * @access Private
//  */
// export const updateStreamStatus = asyncHandler(async (req, res) => {
//   const camera = await cameraService.updateStreamStatus(
//     req.params.id,
//     req.body.status,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(
//     res,
//     `Stream status updated to ${camera.streamStatus} successfully`,
//     camera,
//   );
// });

// /**
//  * Bulk delete cameras
//  * @route POST /api/cameras/bulk-delete
//  * @access Private
//  */
// export const bulkDelete = asyncHandler(async (req, res) => {
//   const result = await cameraService.bulkDelete(
//     req.body.cameraIds,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, result.message, result);
// });

// /**
//  * Bulk update status
//  * @route PATCH /api/cameras/bulk-status
//  * @access Private
//  */
// export const bulkUpdateStatus = asyncHandler(async (req, res) => {
//   const { cameraIds, status } = req.body;

//   const result = await cameraService.bulkUpdateStatus(
//     cameraIds,
//     status,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(
//     res,
//     `${result.modifiedCount} cameras updated to ${status} successfully`,
//     result,
//   );
// });

// /**
//  * Search cameras
//  * @route GET /api/cameras/search
//  * @access Private
//  */
// export const searchCameras = asyncHandler(async (req, res) => {
//   const { q, ...filters } = req.query;

//   if (!q || q.length < 2) {
//     throw new AppError("Search query must be at least 2 characters", 400);
//   }

//   const results = await cameraService.search(
//     q,
//     req.user.userId,
//     req.user.role,
//     filters,
//   );

//   return successResponse(res, "Search results fetched successfully", results);
// });

// /**
//  * Get statistics
//  * @route GET /api/cameras/stats
//  * @access Private
//  */
// export const getStats = asyncHandler(async (req, res) => {
//   const stats = await cameraService.getStats(req.user.userId, req.user.role);

//   return successResponse(res, "Statistics fetched successfully", stats);
// });

// /**
//  * Validate RTSP URL
//  * @route POST /api/cameras/validate-rtsp
//  * @access Private
//  */
// export const validateRtspUrl = asyncHandler(async (req, res) => {
//   const { rtspUrl } = req.body;

//   const result = await cameraService.validateRtspUrl(rtspUrl);

//   return successResponse(res, "RTSP URL validation completed", result);
// });

// /**
//  * Get camera by RTSP URL
//  * @route GET /api/cameras/by-rtsp/:rtspUrl
//  * @access Private
//  */
// export const getByRtspUrl = asyncHandler(async (req, res) => {
//   const rtspUrl = decodeURIComponent(req.params.rtspUrl);

//   const camera = await cameraService.getByRtspUrl(
//     rtspUrl,
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Camera fetched successfully", camera);
// });

// /**
//  * Get recently added cameras
//  * @route GET /api/cameras/recent
//  * @access Private
//  */
// export const getRecentCameras = asyncHandler(async (req, res) => {
//   const { limit = 10 } = req.query;

//   const cameras = await cameraService.getRecentCameras(
//     parseInt(limit),
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Recent cameras fetched successfully", cameras);
// });

// /**
//  * Get online/offline summary
//  * @route GET /api/cameras/stream-summary
//  * @access Private
//  */
// export const getStreamSummary = asyncHandler(async (req, res) => {
//   const summary = await cameraService.getStreamSummary(
//     req.user.userId,
//     req.user.role,
//   );

//   return successResponse(res, "Stream summary fetched successfully", summary);
// });

// /**
//  * Export cameras data
//  * @route GET /api/cameras/export
//  * @access Private
//  */
// export const exportCameras = asyncHandler(async (req, res) => {
//   const { format = "json" } = req.query;

//   const data = await cameraService.exportCameras(
//     req.user.userId,
//     req.user.role,
//     req.query,
//   );

//   if (format === "csv") {
//     // Convert to CSV and send as file
//     // Implementation depends on your CSV library
//     return successResponse(res, "Export data fetched successfully", data);
//   }

//   return successResponse(res, "Export data fetched successfully", data);
// });


// /**
//  * Start HLS stream for a camera
//  * POST /api/cameras/:cameraId/stream/start
//  */
// export const startStream = asyncHandler(async (req, res) => {
//   const { cameraId } = req.params;
//   const userId = req.user.userId;
// const userRole= req.user.role;
//   // Validate cameraId
//   if (!cameraId) {
//     throw new AppError("Camera ID is required", 400);
//   }

//   const result = await cameraService.startHLSStream(cameraId, userId,userRole);

//   res.status(200).json({
//     success: true,
//     message: result.message,
//     data: {
//       cameraId: result.cameraId,
//       hlsUrl: result.hlsUrl,
//       isStreaming: true
//     }
//   });
// });

// /**
//  * Stop HLS stream for a camera
//  * POST /api/cameras/:cameraId/stream/stop
//  */
// export const stopStream = asyncHandler(async (req, res) => {
//   const { cameraId } = req.params;
//   const userId = req.user.userId;

//   if (!cameraId) {
//     throw new AppError("Camera ID is required", 400);
//   }

//   const result = await cameraService.stopHLSStream(cameraId, userId);

//   res.status(200).json({
//     success: true,
//     message: result.message,
//     data: {
//       cameraId: result.cameraId,
//       isStreaming: false
//     }
//   });
// });

// /**
//  * Restart HLS stream for a camera
//  * POST /api/cameras/:cameraId/stream/restart
//  */
// export const restartStream = asyncHandler(async (req, res) => {
//   const { cameraId } = req.params;
//   const userId = req.user.userId;

//   if (!cameraId) {
//     throw new AppError("Camera ID is required", 400);
//   }

//   const result = await cameraService.restartHLSStream(cameraId, userId);

//   res.status(200).json({
//     success: true,
//     message: "Stream restarted successfully",
//     data: {
//       cameraId: result.cameraId,
//       hlsUrl: result.hlsUrl,
//       isStreaming: true
//     }
//   });
// });

// /**
//  * Get stream status for a camera
//  * GET /api/cameras/:cameraId/stream/status
//  */
// export const getStreamStatus = asyncHandler(async (req, res) => {
//   const { cameraId } = req.params;
//   const userId = req.user.userId;
//   const userRole = req.user.role;

//   if (!cameraId) {
//     throw new AppError("Camera ID is required", 400);
//   }

//   const streamInfo = await cameraService.getStreamInfo(cameraId, userId, userRole);

//   res.status(200).json({
//     success: true,
//     data: streamInfo
//   });
// });

// /**
//  * Get stream URL for viewing
//  * GET /api/cameras/:cameraId/stream/url
//  */
// export const getStreamUrl = asyncHandler(async (req, res) => {
//   const { cameraId } = req.params;
//   const userId = req.user.userId;
//   const userRole = req.user.role;
//   const clientId = req.query.clientId || `client-${Date.now()}`;

//   if (!cameraId) {
//     throw new AppError("Camera ID is required", 400);
//   }

//   const streamInfo = await cameraService.getStreamUrl(
//     cameraId, 
//     userId, 
//     userRole, 
//     clientId
//   );

//   res.status(200).json({
//     success: true,
//     data: {
//       cameraId: streamInfo.cameraId,
//       cameraName: streamInfo.cameraName,
//       hlsUrl: streamInfo.hlsUrl,
//       isStreaming: streamInfo.isStreaming,
//       streamStatus: streamInfo.streamStatus,
//       clients: streamInfo.clients,
//       clientId: clientId
//     }
//   });
// });

// /**
//  * Get all active streams
//  * GET /api/cameras/streams/active
//  */
// export const getActiveStreams = asyncHandler(async (req, res) => {
//   const userId = req.user.userId;
//   const userRole = req.user.role;

//   const activeStreams = await cameraService.getActiveStreams(userId, userRole);

//   res.status(200).json({
//     success: true,
//     data: {
//       activeStreams,
//       total: activeStreams.length
//     }
//   });
// });

// /**
//  * Get stream dashboard statistics
//  * GET /api/cameras/streams/dashboard-stats
//  */
// export const getStreamDashboardStats = asyncHandler(async (req, res) => {
//   const userId = req.user.userId;
//   const userRole = req.user.role;

//   const stats = await cameraService.getStreamDashboardStats(userId, userRole);

//   res.status(200).json({
//     success: true,
//     data: stats
//   });
// });



// /**
//  * Client disconnected from stream
//  * POST /api/cameras/streams/client-disconnect
//  */
// export const clientDisconnected = asyncHandler(async (req, res) => {
//   const { clientId } = req.body;

//   if (!clientId) {
//     throw new AppError("Client ID is required", 400);
//   }

//   await cameraService.clientDisconnected(clientId);

//   res.status(200).json({
//     success: true,
//     message: "Client disconnected successfully"
//   });
// });

// /**
//  * Clean up inactive streams (Admin only)
//  * POST /api/cameras/streams/cleanup
//  */
// export const cleanupInactiveStreams = asyncHandler(async (req, res) => {
//   // Check if user is admin
//   if (req.user.role !== 'admin') {
//     throw new AppError("Only admins can clean up streams", 403);
//   }

//   await cameraService.cleanupInactiveStreams();

//   res.status(200).json({
//     success: true,
//     message: "Inactive streams cleaned up successfully"
//   });
// });





import { cameraService } from "../services/camera.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import { detectionManager } from "../services/detection-service/detection-manager.service.js";

/**
 * ✅ Helper: Start detection worker for a camera
 */
const startDetectionIfActive = (camera) => {
  if (!camera || camera.status !== "active" || !camera.rtspUrl) return;

  const cameraId = camera._id.toString();
  const settings = camera.detectionSettings || {};

  // Agar detection disabled hai toh skip
  if (settings.enabled === false) {
    console.log(`⏭️ Detection disabled for ${camera.name}`);
    return;
  }

  detectionManager.registerCameraMeta(cameraId, {
    name: camera.name,
    location: camera.location,
  });

  detectionManager.startWorker(cameraId, camera.rtspUrl, {
    personConfidence: settings.personConfidence ?? 0.45,
    fireConfidence: settings.fireConfidence ?? 0.5,
    frameSampleRate: settings.frameSampleRate ?? 5,
    cooldownMs: settings.cooldownMs ?? 30_000,
    detectPerson: settings.detectPerson ?? true,
    detectFire: settings.detectFire ?? true,
    detectSmoke: settings.detectSmoke ?? true,
  });
};

/**
 * ✅ Helper: Stop detection worker for a camera
 */
const stopDetection = (cameraId) => {
  try {
    detectionManager.stopWorker(cameraId.toString());
  } catch (err) {
    console.error(`Stop detection failed [${cameraId}]:`, err.message);
  }
};

// ============================================
// CREATE
// ============================================
export const createCamera = asyncHandler(async (req, res) => {
  console.log("📷 Create camera:", req.body);

  const camera = await cameraService.createCamera(
    req.body,
    req.user.userId,
  );

  // ✅ Auto-start detection agar camera active hai
  if (camera.status === "active") {
    startDetectionIfActive(camera);
  }

  return successResponse(res, "Camera created successfully", camera, 201);
});

// ============================================
// GET ALL
// ============================================
export const getAllCameras = asyncHandler(async (req, res) => {
  const result = await cameraService.getAllCameras(
    req.query,
    req.user.userId,
    req.user.role,
  );

  return successResponse(res, "Cameras fetched successfully", result);
});

// ============================================
// GET BY ID
// ============================================
export const getCameraById = asyncHandler(async (req, res) => {
  const camera = await cameraService.getCameraById(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  return successResponse(res, "Camera fetched successfully", camera);
});

// ============================================
// UPDATE
// ============================================
export const updateCamera = asyncHandler(async (req, res) => {
  // ✅ Pehle purana camera fetch karo (RTSP change detect karne ke liye)
  const oldCamera = await cameraService.getCameraById(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  const camera = await cameraService.updateCamera(
    req.params.id,
    req.body,
    req.user.userId,
    req.user.role,
  );

  // ✅ Detection restart agar RTSP ya settings change hue
  const rtspChanged = oldCamera.rtspUrl !== camera.rtspUrl;
  const settingsChanged =
    JSON.stringify(oldCamera.detectionSettings) !==
    JSON.stringify(camera.detectionSettings);

  if (rtspChanged || settingsChanged || oldCamera.status !== camera.status) {
    stopDetection(camera._id);
    startDetectionIfActive(camera);
  }

  return successResponse(res, "Camera updated successfully", camera);
});

// ============================================
// DELETE
// ============================================
export const deleteCamera = asyncHandler(async (req, res) => {
  // ✅ Pehle camera fetch karo
  const camera = await cameraService.getCameraById(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  const result = await cameraService.deleteCamera(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  // ✅ Detection worker stop karo (zombie process prevent)
  stopDetection(camera._id);

  return successResponse(res, "Camera deleted successfully", result);
});

// ============================================
// CATEGORY FILTERS (unchanged)
// ============================================
export const getByCategory = asyncHandler(async (req, res) => {
  const { categoryType, categoryId } = req.params;
  const result = await cameraService.getByCategory(
    categoryId,
    categoryType,
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Cameras fetched successfully", result);
});

export const getByMainCategory = asyncHandler(async (req, res) => {
  const result = await cameraService.getByMainCategory(
    req.params.mainCategoryId,
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Cameras fetched successfully", result);
});

export const getBySubCategory = asyncHandler(async (req, res) => {
  const result = await cameraService.getBySubCategory(
    req.params.subCategoryId,
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Cameras fetched successfully", result);
});

export const getByNestedSubCategory = asyncHandler(async (req, res) => {
  const result = await cameraService.getByNestedSubCategory(
    req.params.nestedSubCategoryId,
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Cameras fetched successfully", result);
});

// ============================================
// TOGGLE STATUS — ✅ Detection start/stop
// ============================================
export const toggleStatus = asyncHandler(async (req, res) => {
  const camera = await cameraService.toggleStatus(
    req.params.id,
    req.user.userId,
    req.user.role,
  );

  const cameraId = camera._id.toString();

  if (camera.status === "active") {
    // ✅ Camera active → detection start
    startDetectionIfActive(camera);
  } else {
    // ✅ Camera inactive/maintenance → detection stop
    stopDetection(cameraId);
  }

  return successResponse(
    res,
    `Camera ${
      camera.status === "active"
        ? "activated"
        : camera.status === "inactive"
          ? "deactivated"
          : "set to maintenance"
    } successfully`,
    camera,
  );
});

// ============================================
// UPDATE STREAM STATUS (unchanged)
// ============================================
export const updateStreamStatus = asyncHandler(async (req, res) => {
  const camera = await cameraService.updateStreamStatus(
    req.params.id,
    req.body.status,
    req.user.userId,
    req.user.role,
  );

  return successResponse(
    res,
    `Stream status updated to ${camera.streamStatus} successfully`,
    camera,
  );
});

// ============================================
// BULK DELETE — ✅ Detection stop for all
// ============================================
export const bulkDelete = asyncHandler(async (req, res) => {
  const { cameraIds } = req.body;

  if (!Array.isArray(cameraIds) || cameraIds.length === 0) {
    throw new AppError("cameraIds array is required", 400);
  }

  // ✅ Har camera ka detection worker stop karo
  cameraIds.forEach((id) => stopDetection(id));

  const result = await cameraService.bulkDelete(
    cameraIds,
    req.user.userId,
    req.user.role,
  );

  return successResponse(res, result.message, result);
});

// ============================================
// BULK UPDATE STATUS — ✅ Detection for each
// ============================================
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { cameraIds, status } = req.body;

  if (!Array.isArray(cameraIds) || cameraIds.length === 0) {
    throw new AppError("cameraIds array is required", 400);
  }

  const result = await cameraService.bulkUpdateStatus(
    cameraIds,
    status,
    req.user.userId,
    req.user.role,
  );

  // ✅ Har camera ka detection handle karo
  for (const cameraId of cameraIds) {
    if (status === "active") {
      const camera = await cameraService.getCameraById(
        cameraId,
        req.user.userId,
        req.user.role,
      );
      startDetectionIfActive(camera);
    } else {
      stopDetection(cameraId);
    }
  }

  return successResponse(
    res,
    `${result.modifiedCount} cameras updated to ${status} successfully`,
    result,
  );
});

// ============================================
// SEARCH
// ============================================
export const searchCameras = asyncHandler(async (req, res) => {
  const { q, ...filters } = req.query;

  if (!q || q.length < 2) {
    throw new AppError("Search query must be at least 2 characters", 400);
  }

  const results = await cameraService.search(
    q,
    req.user.userId,
    req.user.role,
    filters,
  );

  return successResponse(res, "Search results fetched successfully", results);
});

// ============================================
// STATS
// ============================================
export const getStats = asyncHandler(async (req, res) => {
  const stats = await cameraService.getStats(req.user.userId, req.user.role);
  return successResponse(res, "Statistics fetched successfully", stats);
});

// ============================================
// RTSP VALIDATION
// ============================================
export const validateRtspUrl = asyncHandler(async (req, res) => {
  const { rtspUrl } = req.body;
  const result = await cameraService.validateRtspUrl(rtspUrl);
  return successResponse(res, "RTSP URL validation completed", result);
});

export const getByRtspUrl = asyncHandler(async (req, res) => {
  const rtspUrl = decodeURIComponent(req.params.rtspUrl);
  const camera = await cameraService.getByRtspUrl(
    rtspUrl,
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Camera fetched successfully", camera);
});

// ============================================
// RECENT
// ============================================
export const getRecentCameras = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const cameras = await cameraService.getRecentCameras(
    parseInt(limit),
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Recent cameras fetched successfully", cameras);
});

// ============================================
// STREAM SUMMARY
// ============================================
export const getStreamSummary = asyncHandler(async (req, res) => {
  const summary = await cameraService.getStreamSummary(
    req.user.userId,
    req.user.role,
  );
  return successResponse(res, "Stream summary fetched successfully", summary);
});

// ============================================
// EXPORT
// ============================================
export const exportCameras = asyncHandler(async (req, res) => {
  const { format = "json" } = req.query;
  const data = await cameraService.exportCameras(
    req.user.userId,
    req.user.role,
    req.query,
  );

  if (format === "csv") {
    return successResponse(res, "Export data fetched successfully", data);
  }

  return successResponse(res, "Export data fetched successfully", data);
});

// ============================================
// STREAM START / STOP / RESTART
// ============================================

export const startStream = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const result = await cameraService.startHLSStream(cameraId, userId, userRole);

  // ✅ Stream start ke saath detection bhi ensure karo
  if (result.success) {
    const camera = await cameraService.getCameraById(
      cameraId,
      userId,
      userRole,
    );
    startDetectionIfActive(camera);
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      cameraId: result.cameraId,
      hlsUrl: result.hlsUrl,
      isStreaming: true,
    },
  });
});

export const stopStream = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;
  const userId = req.user.userId;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const result = await cameraService.stopHLSStream(cameraId, userId);

  // ⚠️ Note: Stream stop hone se detection nahi rukni chahiye.
  // Detection camera.status pe depend karti hai, stream pe nahi.
  // Isliye yahan stopDetection NAHI call karenge.

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      cameraId: result.cameraId,
      isStreaming: false,
    },
  });
});

export const restartStream = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;
  const userId = req.user.userId;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const result = await cameraService.restartHLSStream(cameraId, userId);

  res.status(200).json({
    success: true,
    message: "Stream restarted successfully",
    data: {
      cameraId: result.cameraId,
      hlsUrl: result.hlsUrl,
      isStreaming: true,
    },
  });
});

export const getStreamStatus = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const streamInfo = await cameraService.getStreamInfo(
    cameraId,
    userId,
    userRole,
  );

  res.status(200).json({
    success: true,
    data: streamInfo,
  });
});

export const getStreamUrl = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const clientId = req.query.clientId || `client-${Date.now()}`;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const streamInfo = await cameraService.getStreamUrl(
    cameraId,
    userId,
    userRole,
    clientId,
  );

  res.status(200).json({
    success: true,
    data: {
      cameraId: streamInfo.cameraId,
      cameraName: streamInfo.cameraName,
      hlsUrl: streamInfo.hlsUrl,
      isStreaming: streamInfo.isStreaming,
      streamStatus: streamInfo.streamStatus,
      clients: streamInfo.clients,
      clientId: clientId,
    },
  });
});

export const getActiveStreams = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  const activeStreams = await cameraService.getActiveStreams(userId, userRole);

  res.status(200).json({
    success: true,
    data: {
      activeStreams,
      total: activeStreams.length,
    },
  });
});

export const getStreamDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  const stats = await cameraService.getStreamDashboardStats(userId, userRole);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const clientDisconnected = asyncHandler(async (req, res) => {
  const { clientId } = req.body;

  if (!clientId) throw new AppError("Client ID is required", 400);

  await cameraService.clientDisconnected(clientId);

  res.status(200).json({
    success: true,
    message: "Client disconnected successfully",
  });
});

export const cleanupInactiveStreams = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new AppError("Only admins can clean up streams", 403);
  }

  await cameraService.cleanupInactiveStreams();

  res.status(200).json({
    success: true,
    message: "Inactive streams cleaned up successfully",
  });
});

// ============================================
// ✅ DETECTION STATUS ENDPOINTS (NEW)
// ============================================

/**
 * Get detection status for a camera
 * GET /api/cameras/:cameraId/detection/status
 */
export const getDetectionStatus = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const camera = await cameraService.getCameraById(
    cameraId,
    req.user.userId,
    req.user.role,
  );

  const worker = detectionManager.workers.get(cameraId.toString());

  res.status(200).json({
    success: true,
    data: {
      cameraId,
      cameraName: camera.name,
      status: camera.status,
      isDetectionRunning: !!worker,
      workerStatus: worker?.getStatus() || null,
      settings: camera.detectionSettings || null,
    },
  });
});

/**
 * Get all detection workers status
 * GET /api/cameras/detection/all
 */
export const getAllDetectionStatus = asyncHandler(async (req, res) => {
  const workers = detectionManager.getStatus();
  const cameraMeta = detectionManager.cameraMetaCache;

  const enriched = workers.map((w) => ({
    ...w,
    cameraName: cameraMeta.get(w.cameraId)?.name || w.cameraId,
    location: cameraMeta.get(w.cameraId)?.location || null,
  }));

  res.status(200).json({
    success: true,
    data: {
      workers: enriched,
      total: workers.length,
    },
  });
});

/**
 * Enable/disable detection for a camera
 * PATCH /api/cameras/:cameraId/detection/toggle
 */
export const toggleDetection = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;

  if (!cameraId) throw new AppError("Camera ID is required", 400);

  const camera = await cameraService.getCameraById(
    cameraId,
    req.user.userId,
    req.user.role,
  );

  const isRunning = detectionManager.workers.has(cameraId.toString());

  if (isRunning) {
    stopDetection(cameraId);
    // Persist in DB
    await cameraService.updateCamera(
      cameraId,
      { "detectionSettings.enabled": false },
      req.user.userId,
      req.user.role,
    );
  } else {
    // Persist in DB
    await cameraService.updateCamera(
      cameraId,
      { "detectionSettings.enabled": true },
      req.user.userId,
      req.user.role,
    );
    startDetectionIfActive(camera);
  }

  res.status(200).json({
    success: true,
    message: `Detection ${isRunning ? "disabled" : "enabled"} for ${camera.name}`,
    data: {
      cameraId,
      isDetectionRunning: !isRunning,
    },
  });
});

/**
 * Manual test — run detection once (for debugging)
 * POST /api/cameras/:cameraId/detection/test
 */
export const testDetection = asyncHandler(async (req, res) => {
  const { cameraId } = req.params;

  const camera = await cameraService.getCameraById(
    cameraId,
    req.user.userId,
    req.user.role,
  );

  // Fire a test alert through detection manager
  detectionManager.emit("alert", {
    cameraId,
    cameraName: camera.name,
    type: "person",
    confidence: 0.99,
    snapshot: null,
    timestamp: Date.now(),
    test: true,
  });

  res.status(200).json({
    success: true,
    message: "Test alert fired. Check your email/SMS/websocket.",
  });
});