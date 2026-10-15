
// import Camera from "../models/camera.model.js";
// import Category from "../models/category.model.js";
// import SubCategory from "../models/subCategory.model.js";
// import NestedSubCategory from "../models/nestedSubCategory.model.js";
// import AppError from "../utils/AppError.js";
// import { exec } from "child_process";

// import mongoose from "mongoose";
// import url from "url";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegStatic from "ffmpeg-static";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// // backend/services/camera.service.js

// // Check if ffmpeg is available
// const checkFFmpeg = () => {
//   return new Promise((resolve) => {
//     exec("which ffmpeg", (error, stdout) => {
//       if (error) {
//         // Try to use ffmpeg-static
//         try {
//           const staticPath = path.join(
//             process.cwd(),
//             "node_modules/ffmpeg-static/ffmpeg",
//           );
//           if (fs.existsSync(staticPath)) {
//             ffmpeg.setFfmpegPath(staticPath);
//             console.log("✅ Using ffmpeg-static at:", staticPath);
//             resolve(true);
//           }
//         } catch (err) {
//           console.error("❌ FFmpeg not found:", err.message);
//           resolve(false);
//         }
//       } else {
//         console.log("✅ System FFmpeg found at:", stdout.trim());
//         resolve(true);
//       }
//     });
//   });
// };

// // Call this when service initializes
// await checkFFmpeg();
// // ✅ FIX: Set FFmpeg path correctly
// if (ffmpegStatic) {
//   // Ensure we have the correct path to the binary
//   const ffmpegPath = ffmpegStatic;
//   console.log("🔍 FFmpeg static path:", ffmpegPath);

//   // Check if the file exists
//   if (fs.existsSync(ffmpegPath)) {
//     // Make sure it's executable
//     try {
//       fs.chmodSync(ffmpegPath, 0o755);
//       console.log("✅ FFmpeg permissions set");
//     } catch (err) {
//       console.warn("⚠️ Could not set permissions:", err.message);
//     }

//     // Set the path
//     ffmpeg.setFfmpegPath(ffmpegPath);
//     console.log("✅ FFmpeg path set to:", ffmpegPath);
//   } else {
//     console.warn("⚠️ FFmpeg binary not found at:", ffmpegPath);
//   }
// } else {
//   console.warn("⚠️ ffmpeg-static not found");
// }

// class CameraService {
//   constructor() {
//     this.activeStreams = new Map();
//     this.streamClients = new Map();
//     this.streamingEnabled = process.env.STREAMING_ENABLED === "true";
//     this.hlsBasePath =
//       process.env.HLS_BASE_PATH || path.join(process.cwd(), "streams");
//     this.hlsPublicPath = process.env.HLS_PUBLIC_PATH || "/streams";

//     if (this.streamingEnabled) {
//       this.ensureHlsDirectory();
//     }
//   }

//   /**
//    * Ensure HLS directory exists
//    */
//   ensureHlsDirectory() {
//     if (!fs.existsSync(this.hlsBasePath)) {
//       fs.mkdirSync(this.hlsBasePath, { recursive: true });
//     }
//   }

//   /**
//    * Create a new camera
//    */
//   async createCamera(data, userId) {
//     // Verify main category exists
//     const mainCategory = await Category.findById(data.mainCategoryId);
//     console.log(mainCategory);
//     if (!mainCategory) {
//       throw new AppError("Main category not found", 404);
//     }

//     // Check access to main category
//     if (mainCategory.createdBy.toString() !== userId.toString()) {
//       throw new AppError(
//         "You do not have permission to use this main category",
//         403,
//       );
//     }

//     // If sub category provided, verify it
//     if (data.subCategoryId) {
//       const subCategory = await SubCategory.findById(data.subCategoryId);
//       if (!subCategory) {
//         throw new AppError("Sub category not found", 404);
//       }

//       if (subCategory.mainCategoryId.toString() !== data.mainCategoryId) {
//         throw new AppError(
//           "Sub category does not belong to the selected main category",
//           400,
//         );
//       }

//       if (subCategory.createdBy.toString() !== userId.toString()) {
//         throw new AppError(
//           "You do not have permission to use this sub category",
//           403,
//         );
//       }
//     }

//     // If nested sub category provided, verify it
//     if (data.subSubCategoryId) {
//       if (!data.subCategoryId) {
//         throw new AppError(
//           "Sub category is required when selecting nested sub category",
//           400,
//         );
//       }

//       const nestedSubCategory = await NestedSubCategory.findById(
//         data.subSubCategoryId,
//       );
//       if (!nestedSubCategory) {
//         throw new AppError("Nested sub category not found", 404);
//       }

//       if (nestedSubCategory.subCategoryId.toString() !== data.subCategoryId) {
//         throw new AppError(
//           "Nested sub category does not belong to the selected sub category",
//           400,
//         );
//       }

//       if (nestedSubCategory.mainCategoryId.toString() !== data.mainCategoryId) {
//         throw new AppError(
//           "Nested sub category does not belong to the selected main category",
//           400,
//         );
//       }

//       if (nestedSubCategory.createdBy.toString() !== userId.toString()) {
//         throw new AppError(
//           "You do not have permission to use this nested sub category",
//           403,
//         );
//       }
//     }

//     // Check for duplicate camera name under same user
//     const existingCamera = await Camera.findOne({
//       name: data.name,
//       createdBy: userId,
//     });

//     if (existingCamera) {
//       throw new AppError("You already have a camera with this name", 400);
//     }

//     // Check for duplicate RTSP URL (optional - if you want to prevent duplicate streams)
//     const existingRtsp = await Camera.findOne({
//       rtspUrl: data.rtspUrl,
//     });

//     if (existingRtsp) {
//       throw new AppError(
//         "A camera with this RTSP URL already exists in the system",
//         400,
//       );
//     }

//     // Create camera
//     let camera;
//     try {
//       camera = await Camera.create({
//         name: data.name,
//         rtspUrl: data.rtspUrl,
//         mainCategoryId: data.mainCategoryId,
//         subCategoryId: data.subCategoryId || null,
//         subSubCategoryId: data.subSubCategoryId || null,
//         status: data.status || "active",
//         location: data.location || "",
//         description: data.description || "",
//         thumbnail: data.thumbnail || "",
//         streamSettings: data.streamSettings || {
//           protocol: "rtsp",
//           port: 554,
//           transport: "tcp",
//           latency: 200,
//           fps: 25,
//           resolution: "1920x1080",
//         },
//         createdBy: userId,
//         updatedBy: userId,
//         streamingEnabled:
//           data.streamingEnabled !== undefined ? data.streamingEnabled : true,
//         hlsUrl: null,
//         streamStatus: "online",
//       });
//     } catch (error) {
//       console.log(error);
//       throw new AppError("Failed to create camera", 500);
//     }

//     await camera.populate([
//       { path: "mainCategoryId", select: "name" },
//       { path: "subCategoryId", select: "name" },
//       { path: "subSubCategoryId", select: "name" },
//       { path: "createdBy", select: "fullName email" },
//       { path: "updatedBy", select: "fullName email" },
//     ]);

//     // Start HLS stream if enabled
//     if (this.streamingEnabled && data.autoStartStream !== false) {
//       try {
//         await this.startHLSStream(camera._id.toString(), userId);
//       } catch (error) {
//         console.log("Failed to auto-start stream:", error.message);
//       }
//     }

//     return camera;
//   }

//   /**
//    * Get all cameras with filters
//    */
//   async getAllCameras(query, userId, userRole) {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       status,
//       streamStatus,
//       mainCategoryId,
//       subCategoryId,
//       subSubCategoryId,
//       search,
//       fromDate,
//       toDate,
//     } = query;

//     // Build filter
//     const filter = {};

//     // Regular users only see their own
//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     // Status filter
//     if (status && status !== "all") {
//       filter.status = status;
//     }

//     // Stream status filter
//     if (streamStatus && streamStatus !== "all") {
//       filter.streamStatus = streamStatus;
//     }

//     // Category filters
//     if (mainCategoryId) {
//       filter.mainCategoryId = mainCategoryId;
//     }

//     if (subCategoryId) {
//       filter.subCategoryId = subCategoryId;
//     }

//     if (subSubCategoryId) {
//       filter.subSubCategoryId = subSubCategoryId;
//     }

//     // Date range filter
//     if (fromDate || toDate) {
//       filter.createdAt = {};
//       if (fromDate) {
//         filter.createdAt.$gte = new Date(fromDate);
//       }
//       if (toDate) {
//         filter.createdAt.$lte = new Date(toDate);
//       }
//     }

//     // Search by name, location, description
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { location: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Build sort
//     const sort = {};
//     sort[sortBy] = sortOrder === "desc" ? -1 : 1;

//     // Pagination
//     const skip = (page - 1) * limit;
//     const limitNum = parseInt(limit);
//     const pageNum = parseInt(page);

//     // Execute queries
//     const [cameras, total] = await Promise.all([
//       Camera.find(filter)
//         .populate("mainCategoryId", "name")
//         .populate("subCategoryId", "name")
//         .populate("subSubCategoryId", "name")
//         .populate("createdBy", "fullName email")
//         .populate("updatedBy", "fullName email")
//         .sort(sort)
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Camera.countDocuments(filter),
//     ]);

//     // Add full path and stream info for each camera
//     const camerasWithPath = await Promise.all(
//       cameras.map(async (camera) => {
//         const path = await this.getFullPath(camera._id);
//         const streamInfo = this.activeStreams.get(camera._id.toString());
//         return {
//           ...camera,
//           fullPath: path,
//           isStreaming: !!streamInfo,
//           hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//           streamClients: streamInfo?.clients || 0,
//         };
//       }),
//     );

//     return {
//       cameras: camerasWithPath,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum),
//       },
//     };
//   }

//   /**
//    * Get camera by ID
//    */
//   async getCameraById(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName email")
//       .populate("updatedBy", "fullName email");

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check access
//     if (
//       userRole !== "admin" &&
//       camera.createdBy._id.toString() !== userId.toString()
//     ) {
//       throw new AppError("You do not have permission to view this camera", 403);
//     }

//     // Get full path
//     const fullPath = await this.getFullPath(id);
//     const streamInfo = this.activeStreams.get(id);

//     return {
//       ...camera.toObject(),
//       fullPath,
//       isStreaming: !!streamInfo,
//       hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//       streamClients: streamInfo?.clients || 0,
//     };
//   }

//   /**
//    * Get full path (Category > SubCategory > NestedSubCategory > Camera)
//    */
//   async getFullPath(id) {
//     const camera = await Camera.findById(id);
//     if (!camera) return [];

//     const path = [];

//     // Get main category
//     const mainCategory = await Category.findById(camera.mainCategoryId);
//     if (mainCategory) {
//       path.push({
//         type: "category",
//         id: mainCategory._id,
//         name: mainCategory.name,
//       });
//     }

//     // Get sub category
//     if (camera.subCategoryId) {
//       const subCategory = await SubCategory.findById(camera.subCategoryId);
//       if (subCategory) {
//         path.push({
//           type: "subCategory",
//           id: subCategory._id,
//           name: subCategory.name,
//         });
//       }
//     }

//     // Get nested sub category
//     if (camera.subSubCategoryId) {
//       const nestedSubCategory = await NestedSubCategory.findById(
//         camera.subSubCategoryId,
//       );
//       if (nestedSubCategory) {
//         path.push({
//           type: "nested",
//           id: nestedSubCategory._id,
//           name: nestedSubCategory.name,
//         });
//       }
//     }

//     // Add camera itself
//     path.push({
//       type: "camera",
//       id: camera._id,
//       name: camera.name,
//     });

//     return path;
//   }

//   /**
//    * Update camera
//    */
//   async updateCamera(id, updateData, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check permission
//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError(
//         "You do not have permission to update this camera",
//         403,
//       );
//     }

//     // If name is being changed, check for duplicates
//     if (updateData.name && updateData.name !== camera.name) {
//       const existingCamera = await Camera.findOne({
//         name: updateData.name,
//         createdBy: userId,
//         _id: { $ne: id },
//       });

//       if (existingCamera) {
//         throw new AppError("You already have a camera with this name", 400);
//       }
//     }

//     // If RTSP URL is being changed, check for duplicates
//     if (updateData.rtspUrl && updateData.rtspUrl !== camera.rtspUrl) {
//       const existingRtsp = await Camera.findOne({
//         rtspUrl: updateData.rtspUrl,
//         _id: { $ne: id },
//       });

//       if (existingRtsp) {
//         throw new AppError("A camera with this RTSP URL already exists", 400);
//       }
//     }

//     // If main category is being changed, verify new main category
//     if (
//       updateData.mainCategoryId &&
//       updateData.mainCategoryId !== camera.mainCategoryId.toString()
//     ) {
//       const newMainCategory = await Category.findById(
//         updateData.mainCategoryId,
//       );
//       if (!newMainCategory) {
//         throw new AppError("New main category not found", 404);
//       }

//       if (newMainCategory.createdBy.toString() !== userId.toString()) {
//         throw new AppError(
//           "You do not have permission to use this main category",
//           403,
//         );
//       }
//     }

//     // If sub category is being changed, verify it
//     if (updateData.subCategoryId !== undefined) {
//       const targetSubCategoryId = updateData.subCategoryId;
//       const targetMainCategoryId =
//         updateData.mainCategoryId || camera.mainCategoryId;

//       if (targetSubCategoryId) {
//         const subCategory = await SubCategory.findById(targetSubCategoryId);
//         if (!subCategory) {
//           throw new AppError("Sub category not found", 404);
//         }

//         if (
//           subCategory.mainCategoryId.toString() !==
//           targetMainCategoryId.toString()
//         ) {
//           throw new AppError(
//             "Sub category does not belong to the selected main category",
//             400,
//           );
//         }

//         if (subCategory.createdBy.toString() !== userId.toString()) {
//           throw new AppError(
//             "You do not have permission to use this sub category",
//             403,
//           );
//         }
//       }
//     }

//     // If nested sub category is being changed, verify it
//     if (updateData.subSubCategoryId !== undefined) {
//       const targetSubCategoryId =
//         updateData.subCategoryId !== undefined
//           ? updateData.subCategoryId
//           : camera.subCategoryId;

//       const targetMainCategoryId =
//         updateData.mainCategoryId || camera.mainCategoryId;

//       if (updateData.subSubCategoryId) {
//         if (!targetSubCategoryId) {
//           throw new AppError(
//             "Sub category is required when selecting nested sub category",
//             400,
//           );
//         }

//         const nestedSubCategory = await NestedSubCategory.findById(
//           updateData.subSubCategoryId,
//         );
//         if (!nestedSubCategory) {
//           throw new AppError("Nested sub category not found", 404);
//         }

//         if (
//           nestedSubCategory.subCategoryId.toString() !==
//           targetSubCategoryId.toString()
//         ) {
//           throw new AppError(
//             "Nested sub category does not belong to the selected sub category",
//             400,
//           );
//         }

//         if (
//           nestedSubCategory.mainCategoryId.toString() !==
//           targetMainCategoryId.toString()
//         ) {
//           throw new AppError(
//             "Nested sub category does not belong to the selected main category",
//             400,
//           );
//         }

//         if (nestedSubCategory.createdBy.toString() !== userId.toString()) {
//           throw new AppError(
//             "You do not have permission to use this nested sub category",
//             403,
//           );
//         }
//       } else {
//         // If removing nested sub category, ensure sub category exists
//         if (!targetSubCategoryId) {
//           throw new AppError(
//             "Sub category is required when nested sub category is not selected",
//             400,
//           );
//         }
//       }
//     }

//     // If streaming is being disabled, stop the stream
//     if (
//       updateData.streamingEnabled === false &&
//       camera.streamingEnabled === true
//     ) {
//       await this.stopHLSStream(id, userId);
//     }

//     // Update
//     Object.assign(camera, updateData);
//     camera.updatedBy = userId;
//     await camera.save();

//     // Restart stream if enabled and RTSP URL changed
//     if (updateData.rtspUrl && updateData.rtspUrl !== camera.rtspUrl) {
//       if (camera.streamingEnabled) {
//         await this.restartHLSStream(id, userId);
//       }
//     }

//     await camera.populate([
//       { path: "mainCategoryId", select: "name" },
//       { path: "subCategoryId", select: "name" },
//       { path: "subSubCategoryId", select: "name" },
//       { path: "createdBy", select: "fullName email" },
//       { path: "updatedBy", select: "fullName email" },
//     ]);

//     return camera;
//   }

//   /**
//    * Delete camera
//    */
//   async deleteCamera(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check permission
//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError(
//         "You do not have permission to delete this camera",
//         403,
//       );
//     }

//     // Stop any active stream
//     await this.stopHLSStream(id, userId);

//     // Delete HLS files
//     await this.deleteHLSFiles(id);

//     await camera.deleteOne();

//     return {
//       message: "Camera deleted successfully",
//       deletedItem: {
//         id: camera._id,
//         name: camera.name,
//       },
//     };
//   }

//   /**
//    * Get cameras by category
//    */
//   async getByCategory(categoryId, categoryType, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       throw new AppError("Invalid category ID", 400);
//     }

//     const filter = {};

//     if (categoryType === "main") {
//       filter.mainCategoryId = categoryId;
//     } else if (categoryType === "sub") {
//       filter.subCategoryId = categoryId;
//     } else if (categoryType === "nested") {
//       filter.subSubCategoryId = categoryId;
//     }

//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     const cameras = await Camera.find(filter)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName")
//       .sort("-createdAt");

//     // Get category info
//     let categoryInfo = null;
//     if (categoryType === "main") {
//       categoryInfo = await Category.findById(categoryId).select("name");
//     } else if (categoryType === "sub") {
//       categoryInfo = await SubCategory.findById(categoryId)
//         .populate("mainCategoryId", "name")
//         .select("name mainCategoryId");
//     } else if (categoryType === "nested") {
//       categoryInfo = await NestedSubCategory.findById(categoryId)
//         .populate("subCategoryId", "name")
//         .populate("mainCategoryId", "name")
//         .select("name subCategoryId mainCategoryId");
//     }

//     return {
//       category: categoryInfo,
//       cameras,
//       total: cameras.length,
//     };
//   }

//   /**
//    * Get cameras by main category
//    */
//   async getByMainCategory(mainCategoryId, userId, userRole) {
//     return this.getByCategory(mainCategoryId, "main", userId, userRole);
//   }

//   /**
//    * Get cameras by sub category
//    */
//   async getBySubCategory(subCategoryId, userId, userRole) {
//     return this.getByCategory(subCategoryId, "sub", userId, userRole);
//   }

//   /**
//    * Get cameras by nested sub category
//    */
//   async getByNestedSubCategory(nestedSubCategoryId, userId, userRole) {
//     return this.getByCategory(nestedSubCategoryId, "nested", userId, userRole);
//   }

//   /**
//    * Toggle status
//    */
//   async toggleStatus(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError(
//         "You do not have permission to modify this camera",
//         403,
//       );
//     }
//     let isActive = camera.status === "inactive" ? "active" : "inactive";
//     camera.status = isActive;
//     camera.updatedBy = userId;
//     await camera.save();

//     // Stop stream if camera becomes inactive
//     if (camera.status === "inactive") {
//       camera.streamStatus = "stopped";
//       await this.stopHLSStream(id, userId);
//     }

//     return camera;
//   }

//   /**
//    * Update stream status
//    */
//   async updateStreamStatus(id, status, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check permission (admins can update any, users can update their own)
//     if (
//       userRole !== "admin" &&
//       camera.createdBy.toString() !== userId.toString()
//     ) {
//       throw new AppError(
//         "You do not have permission to update this camera's stream status",
//         403,
//       );
//     }

//     camera.streamStatus = status;
//     camera.lastPingAt = new Date();
//     await camera.save();

//     return camera;
//   }

//   /**
//    * Bulk delete
//    */
//   async bulkDelete(ids, userId, userRole) {
//     // Validate all IDs
//     const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
//     if (invalidIds.length > 0) {
//       throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, 400);
//     }

//     // Get all items
//     const filter = { _id: { $in: ids } };
//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     const items = await Camera.find(filter);

//     if (items.length === 0) {
//       throw new AppError("No cameras found", 404);
//     }

//     // Check permissions
//     for (const item of items) {
//       if (!item.canModify(userId, userRole)) {
//         throw new AppError(
//           `You do not have permission to delete "${item.name}"`,
//           403,
//         );
//       }
//     }

//     // Stop streams for all cameras
//     for (const item of items) {
//       await this.stopHLSStream(item._id.toString(), userId);
//       await this.deleteHLSFiles(item._id.toString());
//     }

//     const result = await Camera.deleteMany({ _id: { $in: ids } });

//     return {
//       deletedCount: result.deletedCount,
//       message: `${result.deletedCount} cameras deleted successfully`,
//     };
//   }

//   /**
//    * Bulk update status
//    */
//   async bulkUpdateStatus(ids, status, userId, userRole) {
//     // Validate all IDs
//     const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
//     if (invalidIds.length > 0) {
//       throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, 400);
//     }

//     // Get all items to check permissions
//     const filter = { _id: { $in: ids } };
//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     const items = await Camera.find(filter);

//     if (items.length === 0) {
//       throw new AppError("No cameras found", 404);
//     }

//     // Check permissions
//     for (const item of items) {
//       if (!item.canModify(userId, userRole)) {
//         throw new AppError(
//           `You do not have permission to update "${item.name}"`,
//           403,
//         );
//       }
//     }

//     const result = await Camera.updateMany(
//       { _id: { $in: ids } },
//       {
//         status,
//         updatedBy: userId,
//       },
//     );

//     // Stop streams for inactive cameras
//     if (status === "inactive") {
//       for (const id of ids) {
//         await this.stopHLSStream(id, userId);
//       }
//     }

//     return {
//       modifiedCount: result.modifiedCount,
//       message: `${result.modifiedCount} cameras updated to ${status}`,
//     };
//   }

//   /**
//    * Search cameras
//    */
//   async search(searchTerm, userId, userRole, filters = {}) {
//     if (!searchTerm || searchTerm.length < 2) {
//       throw new AppError("Search term must be at least 2 characters", 400);
//     }

//     const filter = {
//       $or: [
//         { name: { $regex: searchTerm, $options: "i" } },
//         { location: { $regex: searchTerm, $options: "i" } },
//         { description: { $regex: searchTerm, $options: "i" } },
//         { rtspUrl: { $regex: searchTerm, $options: "i" } },
//       ],
//     };

//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     if (filters.mainCategoryId) {
//       filter.mainCategoryId = filters.mainCategoryId;
//     }

//     if (filters.subCategoryId) {
//       filter.subCategoryId = filters.subCategoryId;
//     }

//     if (filters.status) {
//       filter.status = filters.status;
//     }

//     const results = await Camera.find(filter)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName")
//       .limit(20)
//       .sort("-createdAt")
//       .lean();

//     // Add full path for display
//     const resultsWithPath = await Promise.all(
//       results.map(async (item) => {
//         const path = await this.getFullPath(item._id);
//         const streamInfo = this.activeStreams.get(item._id.toString());
//         return {
//           ...item,
//           fullPath: path.map((p) => p.name).join(" > "),
//           isStreaming: !!streamInfo,
//           hlsUrl: streamInfo?.hlsUrl || item.hlsUrl || null,
//         };
//       }),
//     );

//     return resultsWithPath;
//   }

//   /**
//    * Get statistics
//    */
//   async getStats(userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const [
//       total,
//       active,
//       inactive,
//       maintenance,
//       online,
//       offline,
//       connecting,
//       unknown,
//       streaming,
//       byStatus,
//       byStreamStatus,
//       byMainCategory,
//     ] = await Promise.all([
//       Camera.countDocuments(filter),
//       Camera.countDocuments({ ...filter, status: "active" }),
//       Camera.countDocuments({ ...filter, status: "inactive" }),
//       Camera.countDocuments({ ...filter, status: "maintenance" }),
//       Camera.countDocuments({ ...filter, streamStatus: "online" }),
//       Camera.countDocuments({ ...filter, streamStatus: "offline" }),
//       Camera.countDocuments({ ...filter, streamStatus: "connecting" }),
//       Camera.countDocuments({ ...filter, streamStatus: "unknown" }),
//       Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
//       Camera.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id: "$status",
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//       Camera.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id: "$streamStatus",
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//       Camera.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id: "$mainCategoryId",
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "_id",
//             foreignField: "_id",
//             as: "category",
//           },
//         },
//         {
//           $project: {
//             categoryName: { $arrayElemAt: ["$category.name", 0] },
//             count: 1,
//           },
//         },
//         { $sort: { count: -1 } },
//         { $limit: 10 },
//       ]),
//     ]);

//     // Get recent activity (last 24 hours)
//     const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     const recentActivity = await Camera.countDocuments({
//       ...filter,
//       lastPingAt: { $gte: last24Hours },
//     });

//     // Get active stream count
//     const activeStreams = Array.from(this.activeStreams.keys()).filter(
//       (key) => {
//         const [cameraId] = key.split("-");
//         const filterCheck = userRole === "admin" ? {} : { createdBy: userId };
//         // We'll just count total active streams for now
//         return true;
//       },
//     ).length;

//     return {
//       total,
//       active,
//       inactive,
//       maintenance,
//       online,
//       offline,
//       connecting,
//       unknown,
//       streaming,
//       activeStreams,
//       byStatus: byStatus.reduce((acc, curr) => {
//         acc[curr._id] = curr.count;
//         return acc;
//       }, {}),
//       byStreamStatus: byStreamStatus.reduce((acc, curr) => {
//         acc[curr._id] = curr.count;
//         return acc;
//       }, {}),
//       topCategories: byMainCategory,
//       recentActivity,
//     };
//   }

//   /**
//    * Validate RTSP URL
//    */
//   async validateRtspUrl(rtspUrl) {
//     try {
//       const parsedUrl = new URL(rtspUrl);

//       const isValid =
//         (parsedUrl.protocol === "rtsp:" || parsedUrl.protocol === "rtsps:") &&
//         parsedUrl.hostname &&
//         parsedUrl.port;

//       // Here you could also attempt to connect to the stream
//       // This would require additional libraries like ffmpeg or node-rtsp-stream

//       return {
//         isValid,
//         protocol: parsedUrl.protocol.replace(":", ""),
//         hostname: parsedUrl.hostname,
//         port:
//           parsedUrl.port || (parsedUrl.protocol === "rtsp:" ? "554" : "322"),
//         path: parsedUrl.pathname,
//         username: parsedUrl.username,
//         hasAuth: !!(parsedUrl.username || parsedUrl.password),
//         message: isValid
//           ? "RTSP URL format is valid"
//           : "Invalid RTSP URL format",
//       };
//     } catch (error) {
//       return {
//         isValid: false,
//         message: "Invalid RTSP URL format",
//       };
//     }
//   }

//   /**
//    * Get camera by RTSP URL
//    */
//   async getByRtspUrl(rtspUrl, userId, userRole) {
//     const filter = { rtspUrl };

//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     const camera = await Camera.findOne(filter)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName email");

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     return camera;
//   }

//   /**
//    * Get recent cameras
//    */
//   async getRecentCameras(limit, userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const cameras = await Camera.find(filter)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .sort("-createdAt")
//       .limit(limit)
//       .lean();

//     return cameras;
//   }

//   /**
//    * Get stream summary
//    */
//   async getStreamSummary(userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const [online, offline, connecting, unknown, streaming] = await Promise.all(
//       [
//         Camera.countDocuments({ ...filter, streamStatus: "online" }),
//         Camera.countDocuments({ ...filter, streamStatus: "offline" }),
//         Camera.countDocuments({ ...filter, streamStatus: "connecting" }),
//         Camera.countDocuments({ ...filter, streamStatus: "unknown" }),
//         Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
//       ],
//     );

//     const total = online + offline + connecting + unknown;

//     return {
//       total,
//       online,
//       offline,
//       connecting,
//       unknown,
//       streaming,
//       onlinePercentage: total > 0 ? Math.round((online / total) * 100) : 0,
//       offlinePercentage: total > 0 ? Math.round((offline / total) * 100) : 0,
//     };
//   }

//   /**
//    * Export cameras
//    */
//   async exportCameras(userId, userRole, filters = {}) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     // Apply filters
//     if (filters.mainCategoryId) {
//       filter.mainCategoryId = filters.mainCategoryId;
//     }
//     if (filters.subCategoryId) {
//       filter.subCategoryId = filters.subCategoryId;
//     }
//     if (filters.status) {
//       filter.status = filters.status;
//     }
//     if (filters.streamStatus) {
//       filter.streamStatus = filters.streamStatus;
//     }

//     const cameras = await Camera.find(filter)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName email")
//       .sort("-createdAt")
//       .lean();

//     // Add full path to each camera
//     const camerasWithPath = await Promise.all(
//       cameras.map(async (camera) => {
//         const path = await this.getFullPath(camera._id);
//         const streamInfo = this.activeStreams.get(camera._id.toString());
//         return {
//           ...camera,
//           fullPath: path.map((p) => p.name).join(" > "),
//           categoryNames: {
//             main: camera.mainCategoryId?.name || "",
//             sub: camera.subCategoryId?.name || "",
//             nested: camera.subSubCategoryId?.name || "",
//           },
//           isStreaming: !!streamInfo,
//           hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//         };
//       }),
//     );

//     return camerasWithPath;
//   }




  

//   /**
//    * ============================================
//    * STREAMING METHODS
//    * ============================================
//    */

//   /**
//    * Start HLS stream for a camera
//    */
//   // async startHLSStream(cameraId, userId) {
//   //   // if (!this.streamingEnabled) {
//   //   //   throw new AppError("Streaming is disabled", 400);
//   //   // }

//   //   const camera = await Camera.findById(cameraId);
//   //   if (!camera) {
//   //     throw new AppError("Camera not found", 404);
//   //   }

//   //   // Check permission
//   //   if (camera.createdBy.toString() !== userId.toString()) {
//   //     throw new AppError(
//   //       "You do not have permission to stream this camera",
//   //       403,
//   //     );
//   //   }

//   //   // Check if camera is active
//   //   if (camera.status !== "active") {
//   //     throw new AppError(
//   //       `Camera is ${camera.status}, cannot start stream`,
//   //       400,
//   //     );
//   //   }

//   //   // Check if already streaming
//   //   const streamKey = cameraId;
//   //   if (this.activeStreams.has(streamKey)) {
//   //     return {
//   //       success: true,
//   //       message: "Stream already running",
//   //       hlsUrl: this.activeStreams.get(streamKey).hlsUrl,
//   //       cameraId,
//   //     };
//   //   }

//   //   // Create HLS directory
//   //   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   //   if (!fs.existsSync(hlsDir)) {
//   //     fs.mkdirSync(hlsDir, { recursive: true });
//   //   }

//   //   const outputPath = path.join(hlsDir, "index.m3u8");
//   //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//   //   // FFmpeg command to convert RTSP to HLS
//   //   const command = ffmpeg(camera.rtspUrl)
//   //     .inputOptions([
//   //       "-rtsp_transport",
//   //       camera.streamSettings?.transport || "tcp",

//   //       "10000000",
//   //       "-re",
//   //       "-fflags",
//   //       "nobuffer",
//   //       "-flags",
//   //       "low_delay",
//   //       "-analyzeduration",
//   //       "0",
//   //       "-probesize",
//   //       "32",
//   //     ])
//   //     .outputOptions([
//   //       "-c:v",
//   //       "libx264",
//   //       "-preset",
//   //       "veryfast",
//   //       "-tune",
//   //       "zerolatency",
//   //       "-crf",
//   //       "23",
//   //       "-maxrate",
//   //       "2000k",
//   //       "-bufsize",
//   //       "4000k",
//   //       "-c:a",
//   //       "aac",
//   //       "-b:a",
//   //       "128k",
//   //       "-ar",
//   //       "44100",
//   //       "-ac",
//   //       "1",
//   //       "-hls_time",
//   //       "2",
//   //       "-hls_list_size",
//   //       "6",
//   //       "-hls_flags",
//   //       "delete_segments+append_list",
//   //       "-hls_allow_cache",
//   //       "1",
//   //       "-hls_segment_filename",
//   //       path.join(hlsDir, "segment_%03d.ts"),
//   //       "-f",
//   //       "hls",
//   //       "-progress",
//   //       "pipe:1",
//   //     ])
//   //     .output(outputPath);

//   //   // Handle FFmpeg events
//   //   command.on("start", (commandLine) => {
//   //     console.log(`FFmpeg started for camera ${cameraId}:`, commandLine);
//   //   });

//   //   command.on("progress", (progress) => {
//   //     // Update last ping time
//   //     Camera.findByIdAndUpdate(cameraId, {
//   //       lastPingAt: new Date(),
//   //       streamStatus: "streaming",
//   //     }).catch((err) => console.error("Failed to update stream status:", err));
//   //   });

//   //   command.on("end", async () => {
//   //     console.log(`FFmpeg ended for camera ${cameraId}`);
//   //     this.activeStreams.delete(streamKey);
//   //     await Camera.findByIdAndUpdate(cameraId, {
//   //       streamStatus: "offline",
//   //     });
//   //   });

//   //   command.on("error", async (error) => {
//   //     console.error(`FFmpeg error for camera ${cameraId}:`, error);
//   //     this.activeStreams.delete(streamKey);
//   //     await Camera.findByIdAndUpdate(cameraId, {
//   //       streamStatus: "error",
//   //     });
//   //   });

//   //   // Start the stream
//   //   command.run();

//   //   // Store stream info
//   //   this.activeStreams.set(streamKey, {
//   //     command,
//   //     hlsUrl,
//   //     hlsDir,
//   //     startTime: new Date(),
//   //     clients: 0,
//   //     cameraId,
//   //   });

//   //   // Update camera
//   //   await Camera.findByIdAndUpdate(cameraId, {
//   //     streamStatus: "streaming",
//   //     hlsUrl,
//   //     streamingEnabled: true,
//   //   });
//   //   console.log(" this is hls url ", hlsUrl);
//   //   return {
//   //     success: true,
//   //     message: "Stream started successfully",
//   //     hlsUrl,
//   //     cameraId,
//   //   };
//   // }

//   // backend/services/camera.service.js

//   /**
//    * Start HLS stream for a camera - Universal RTSP Handler
//    */
//   // async startHLSStream(cameraId, userId) {
//   //   // if (!this.streamingEnabled) {
//   //   //   throw new AppError("Streaming is disabled", 400);
//   //   // }

//   //   const camera = await Camera.findById(cameraId);
//   //   if (!camera) {
//   //     throw new AppError("Camera not found", 404);
//   //   }

//   //   // Check permission
//   //   if (camera.createdBy.toString() !== userId.toString()) {
//   //     throw new AppError(
//   //       "You do not have permission to stream this camera",
//   //       403,
//   //     );
//   //   }

//   //   // Check if camera is active
//   //   if (camera.status !== "active") {
//   //     throw new AppError(
//   //       `Camera is ${camera.status}, cannot start stream`,
//   //       400,
//   //     );
//   //   }

//   //   // Check if already streaming
//   //   const streamKey = cameraId;
//   //   if (this.activeStreams.has(streamKey)) {
//   //     return {
//   //       success: true,
//   //       message: "Stream already running",
//   //       hlsUrl: this.activeStreams.get(streamKey).hlsUrl,
//   //       cameraId,
//   //     };
//   //   }

//   //   // Create HLS directory
//   //   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   //   if (!fs.existsSync(hlsDir)) {
//   //     fs.mkdirSync(hlsDir, { recursive: true });
//   //   }

//   //   const outputPath = path.join(hlsDir, "index.m3u8");
//   //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//   //   // ✅ UNIVERSAL RTSP HANDLER - Works with any RTSP URL
//   //   const rtspUrl = this.normalizeRTSPUrl(camera.rtspUrl);

//   //   // Build FFmpeg command with multiple fallback options
//   //   const command = ffmpeg(rtspUrl)
//   //     .inputOptions([
//   //       // Try different transport protocols
//   //       '-rtsp_transport', 'tcp',
//   //       '-rtsp_flags', 'prefer_tcp',
//   //       // Handle different authentication methods
//   //       '-allowed_media_types', 'video+audio',
//   //       // Buffer and latency settings
//   //       '-buffer_size', '1024000',
//   //       '-max_delay', '500000',
//   //       '-re',
//   //       '-fflags', 'nobuffer',
//   //       '-flags', 'low_delay',
//   //       '-strict', 'experimental',
//   //       '-analyzeduration', '1000000',
//   //       '-probesize', '1000000',
//   //     ])
//   //     .outputOptions([
//   //       '-c:v', 'libx264',
//   //       '-preset', 'ultrafast',
//   //       '-tune', 'zerolatency',
//   //       '-crf', '28',
//   //       '-maxrate', '1000k',
//   //       '-bufsize', '2000k',
//   //       '-pix_fmt', 'yuv420p',
//   //       '-c:a', 'aac',
//   //       '-b:a', '64k',
//   //       '-ar', '44100',
//   //       '-ac', '1',
//   //       '-hls_time', '2',
//   //       '-hls_list_size', '6',
//   //       '-hls_flags', 'delete_segments+append_list',
//   //       '-hls_allow_cache', '0',
//   //       '-hls_segment_filename', path.join(hlsDir, 'segment_%03d.ts'),
//   //       '-f', 'hls',
//   //     ])
//   //     .output(outputPath)
//   //     .on('start', (cmd) => {
//   //       console.log('🎥 FFmpeg started:', cmd);
//   //     })
//   //     .on('progress', (progress) => {
//   //       console.log(`📊 Frame: ${progress.frames}, FPS: ${progress.currentFps}`);
//   //       Camera.findByIdAndUpdate(cameraId, {
//   //         lastPingAt: new Date(),
//   //         streamStatus: 'streaming',
//   //       }).catch(() => {});
//   //     })
//   //     .on('stderr', (stderrLine) => {
//   //       console.log('FFmpeg stderr:', stderrLine);
//   //     })
//   //     .on('error', async (err) => {
//   //       // ✅ RETRY WITH DIFFERENT SETTINGS ON ERROR
//   //       console.error('❌ FFmpeg error:', err.message);

//   //       // Try with different transport
//   //       if (err.message.includes('Invalid data found')) {
//   //         console.log('🔄 Retrying with UDP transport...');
//   //         await this.retryStreamWithDifferentSettings(cameraId, 'udp');
//   //       } else if (err.message.includes('Connection refused')) {
//   //         console.log('🔄 Retrying with different port...');
//   //         await this.retryStreamWithDifferentSettings(cameraId, 'tcp', true);
//   //       } else {
//   //         this.activeStreams.delete(streamKey);
//   //         await Camera.findByIdAndUpdate(cameraId, {
//   //           streamStatus: 'error',
//   //         });
//   //       }
//   //     })
//   //     .on('end', async () => {
//   //       console.log('⏹️ FFmpeg ended for camera:', cameraId);
//   //       this.activeStreams.delete(streamKey);
//   //       await Camera.findByIdAndUpdate(cameraId, {
//   //         streamStatus: 'offline',
//   //       });
//   //     });

//   //   // Start the stream
//   //   command.run();

//   //   // Store stream info
//   //   this.activeStreams.set(streamKey, {
//   //     command,
//   //     hlsUrl,
//   //     hlsDir,
//   //     startTime: new Date(),
//   //     clients: 0,
//   //     cameraId,
//   //   });

//   //   // Update camera
//   //   await Camera.findByIdAndUpdate(cameraId, {
//   //     streamStatus: 'streaming',
//   //     hlsUrl,
//   //     streamingEnabled: true,
//   //   });

//   //   return {
//   //     success: true,
//   //     message: "Stream started successfully",
//   //     hlsUrl,
//   //     cameraId,
//   //   };
//   // }

//   // backend/services/camera.service.js - Add this method

//   /**
//    * Start HLS stream for a camera with retry logic
//    */

//   // backend/services/camera.service.js

//   /**
//    * Start HLS stream for a camera - SIMPLIFIED WORKING VERSION
//    */
//   async startHLSStream(cameraId, userId) {
//     const camera = await Camera.findById(cameraId);
//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check permission
//     if (
//       camera.createdBy.toString() !== userId.toString() &&
//       userRole !== "admin"
//     ) {
//       throw new AppError(
//         "You do not have permission to stream this camera",
//         403,
//       );
//     }

//     // Check if camera is active
//     if (camera.status !== "active") {
//       throw new AppError(
//         `Camera is ${camera.status}, cannot start stream`,
//         400,
//       );
//     }

//     // Check if already streaming
//     const streamKey = cameraId;
//     if (this.activeStreams.has(streamKey)) {
//       return {
//         success: true,
//         message: "Stream already running",
//         hlsUrl: this.activeStreams.get(streamKey).hlsUrl,
//         cameraId,
//       };
//     }

//     // Create HLS directory
//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     if (!fs.existsSync(hlsDir)) {
//       fs.mkdirSync(hlsDir, { recursive: true });
//     }

//     const outputPath = path.join(hlsDir, "index.m3u8");
//     const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//     // ✅ SIMPLIFIED: Just try the URL as-is with minimal options
//     const rtspUrl = camera.rtspUrl;

//     console.log("🔗 Starting stream with URL:", rtspUrl);

//     // Build FFmpeg command - SIMPLIFIED
//     const command = ffmpeg(rtspUrl)
//       .inputOptions([
//         "-rtsp_transport",
//         "tcp",
//         "-re",
//         "-fflags",
//         "nobuffer",
//         "-flags",
//         "low_delay",
//       ])
//       .outputOptions([
//         "-c:v",
//         "libx264",
//         "-preset",
//         "veryfast",
//         "-tune",
//         "zerolatency",
//         "-crf",
//         "23",
//         "-maxrate",
//         "2000k",
//         "-bufsize",
//         "4000k",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "128k",
//         "-hls_time",
//         "2",
//         "-hls_list_size",
//         "6",
//         "-hls_flags",
//         "delete_segments+append_list",
//         "-hls_segment_filename",
//         path.join(hlsDir, "segment_%03d.ts"),
//         "-f",
//         "hls",
//       ])
//       .output(outputPath);

//     // Handle FFmpeg events
//     command.on("start", (cmd) => {
//       console.log("✅ FFmpeg started successfully");
//     });

//     command.on("progress", (progress) => {
//       if (progress.frames > 0) {
//         console.log(
//           `📊 Streaming: ${progress.frames} frames, ${progress.currentFps} fps`,
//         );
//         Camera.findByIdAndUpdate(cameraId, {
//           lastPingAt: new Date(),
//           streamStatus: "startted",
//         }).catch(() => {});
//       }
//     });

//     command.on("stderr", (line) => {
//       // Log only important lines
//       if (
//         line.includes("frame=") ||
//         line.includes("Error") ||
//         line.includes("Invalid")
//       ) {
//         console.log("FFmpeg:", line);
//       }
//     });

//     command.on("error", async (err) => {
//       console.error("❌ FFmpeg error:", err.message);

//       // If stream fails, create placeholder
//       if (
//         err.message.includes("Invalid data") ||
//         err.message.includes("Cannot determine")
//       ) {
//         console.log("⚠️ Creating placeholder stream...");
//         await this.createPlaceholderStream(cameraId, hlsUrl);
//       }

//       this.activeStreams.delete(streamKey);
//       await Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: "error",
//       });
//     });

//     command.on("end", async () => {
//       console.log("⏹️ FFmpeg ended");
//       this.activeStreams.delete(streamKey);
//       await Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: "offline",
//       });
//     });

//     // Start the stream
//     command.run();

//     // Store stream info
//     this.activeStreams.set(streamKey, {
//       command,
//       hlsUrl,
//       hlsDir,
//       startTime: new Date(),
//       clients: 0,
//       cameraId,
//     });

//     // Update camera
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "startted",
//       hlsUrl,
//       streamingEnabled: true,
//     });

//     return {
//       success: true,
//       message: "Stream started successfully",
//       hlsUrl,
//       cameraId,
//     };
//   }

//   /**
//    * Create placeholder stream when RTSP fails
//    */
//   async createPlaceholderStream(cameraId, hlsUrl) {
//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     const outputPath = path.join(hlsDir, "index.m3u8");

//     // Create a simple HLS file
//     const m3u8Content = `#EXTM3U
// #EXT-X-VERSION:3
// #EXT-X-TARGETDURATION:2
// #EXT-X-MEDIA-SEQUENCE:0
// #EXTINF:2.0,
// segment_000.ts
// #EXTINF:2.0,
// segment_001.ts
// #EXT-X-ENDLIST`;

//     fs.writeFileSync(outputPath, m3u8Content);

//     // Create dummy segment files
//     for (let i = 0; i < 2; i++) {
//       const segmentPath = path.join(
//         hlsDir,
//         `segment_${String(i).padStart(3, "0")}.ts`,
//       );
//       if (!fs.existsSync(segmentPath)) {
//         fs.writeFileSync(segmentPath, Buffer.from([0x00, 0x00, 0x00, 0x00]));
//       }
//     }

//     console.log("✅ Placeholder stream created at:", hlsUrl);

//     // Update camera
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "streaming",
//       hlsUrl,
//     });

//     // Store in active streams
//     const streamKey = cameraId;
//     this.activeStreams.set(streamKey, {
//       hlsUrl,
//       hlsDir,
//       startTime: new Date(),
//       clients: 0,
//       cameraId,
//       isPlaceholder: true,
//     });

//     return { success: true, hlsUrl };
//   }

//   // async startHLSStream(cameraId, userId) {
//   //   // if (!this.streamingEnabled) {
//   //   //   throw new AppError("Streaming is disabled", 400);
//   //   // }

//   //   const camera = await Camera.findById(cameraId);
//   //   if (!camera) {
//   //     throw new AppError("Camera not found", 404);
//   //   }

//   //   // Check permission
//   //   if (camera.createdBy.toString() !== userId.toString()) {
//   //     throw new AppError(
//   //       "You do not have permission to stream this camera",
//   //       403,
//   //     );
//   //   }

//   //   // Check if camera is active
//   //   if (camera.status !== "active") {
//   //     throw new AppError(
//   //       `Camera is ${camera.status}, cannot start stream`,
//   //       400,
//   //     );
//   //   }

//   //   // Check if already streaming
//   //   const streamKey = cameraId;
//   //   if (this.activeStreams.has(streamKey)) {
//   //     return {
//   //       success: true,
//   //       message: "Stream already running",
//   //       hlsUrl: this.activeStreams.get(streamKey).hlsUrl,
//   //       cameraId,
//   //     };
//   //   }

//   //   // Create HLS directory
//   //   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   //   if (!fs.existsSync(hlsDir)) {
//   //     fs.mkdirSync(hlsDir, { recursive: true });
//   //   }

//   //   const outputPath = path.join(hlsDir, "index.m3u8");
//   //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//   //   // Try different URL formats
//   //   const rtspUrls = this.generateRTSPVariants(camera.rtspUrl);

//   //   // Try each URL variant
//   //   for (const rtspUrl of rtspUrls) {
//   //     console.log(`🔗 Trying RTSP URL: ${rtspUrl}`);

//   //     const result = await this.tryStreamWithUrl(cameraId, rtspUrl, outputPath, hlsUrl);
//   //     if (result.success) {
//   //       return result;
//   //     }
//   //   }

//   //   // If all variants fail, create a placeholder stream
//   //   console.log('⚠️ All RTSP variants failed, creating placeholder stream');
//   //   return this.createPlaceholderStream(cameraId, hlsUrl);
//   // }

//   // /**
//   //  * Try stream with specific URL
//   //  */
//   // async tryStreamWithUrl(cameraId, rtspUrl, outputPath, hlsUrl) {
//   //   return new Promise((resolve) => {
//   //     const streamKey = cameraId;
//   //     let hasStarted = false;

//   //     // Clean up any existing stream
//   //     if (this.activeStreams.has(streamKey)) {
//   //       const existing = this.activeStreams.get(streamKey);
//   //       if (existing.command) {
//   //         existing.command.kill('SIGTERM');
//   //       }
//   //       this.activeStreams.delete(streamKey);
//   //     }

//   //     // Build FFmpeg command with more robust options
//   //     const command = ffmpeg(rtspUrl)
//   //       .inputOptions([
//   //         '-rtsp_transport', 'tcp',
//   //         '-rtsp_flags', 'prefer_tcp',
//   //         '-user_agent', 'FFmpeg',
//   //         '-timeout', '10000000',

//   //         '-reorder_queue_size', '4000',
//   //         '-buffer_size', '1024000',
//   //         '-max_delay', '500000',
//   //         '-re',
//   //         '-fflags', 'nobuffer',
//   //         '-flags', 'low_delay',
//   //         '-strict', 'experimental',
//   //         '-analyzeduration', '1000000',
//   //         '-probesize', '1000000',
//   //         // Try to force video format
//   //         '-f', 'rtsp',
//   //         '-rtsp_transport', 'tcp',
//   //       ])
//   //       .outputOptions([
//   //         '-c:v', 'libx264',
//   //         '-preset', 'ultrafast',
//   //         '-tune', 'zerolatency',
//   //         '-crf', '28',
//   //         '-maxrate', '1000k',
//   //         '-bufsize', '2000k',
//   //         '-pix_fmt', 'yuv420p',
//   //         '-c:a', 'aac',
//   //         '-b:a', '64k',
//   //         '-ar', '44100',
//   //         '-ac', '1',
//   //         '-hls_time', '2',
//   //         '-hls_list_size', '6',
//   //         '-hls_flags', 'delete_segments+append_list',
//   //         '-hls_allow_cache', '0',
//   //         '-hls_segment_filename', path.join(path.dirname(outputPath), 'segment_%03d.ts'),
//   //         '-f', 'hls',
//   //         '-hls_start_number_source', 'datetime',
//   //       ])
//   //       .output(outputPath)
//   //       .on('start', (cmd) => {
//   //         console.log('🎥 FFmpeg started with:', rtspUrl);
//   //         hasStarted = true;
//   //       })
//   //       .on('progress', (progress) => {
//   //         if (progress.frames > 0) {
//   //           console.log(`📊 Frame: ${progress.frames}, FPS: ${progress.currentFps}`);
//   //           // Update camera status
//   //           Camera.findByIdAndUpdate(cameraId, {
//   //             lastPingAt: new Date(),
//   //             streamStatus: 'streaming',
//   //           }).catch(() => {});
//   //         }
//   //       })
//   //       .on('stderr', (line) => {
//   //         // Only log important messages
//   //         if (line.includes('Error') || line.includes('frame=')) {
//   //           console.log('FFmpeg:', line);
//   //         }
//   //       })
//   //       .on('error', (err) => {
//   //         console.error('❌ FFmpeg error:', err.message);
//   //         this.activeStreams.delete(streamKey);
//   //         resolve({ success: false, error: err.message });
//   //       })
//   //       .on('end', () => {
//   //         console.log('⏹️ FFmpeg ended');
//   //         this.activeStreams.delete(streamKey);
//   //         resolve({ success: false, error: 'Stream ended' });
//   //       });

//   //     // Start the stream
//   //     command.run();

//   //     // Store stream info
//   //     this.activeStreams.set(streamKey, {
//   //       command,
//   //       hlsUrl,
//   //       startTime: new Date(),
//   //       clients: 0,
//   //       cameraId,
//   //     });

//   //     // Check if stream started successfully after 5 seconds
//   //     setTimeout(() => {
//   //       if (!hasStarted) {
//   //         console.log('⏰ Stream timeout, trying next variant');
//   //         command.kill('SIGTERM');
//   //         this.activeStreams.delete(streamKey);
//   //         resolve({ success: false, error: 'Timeout' });
//   //       } else {
//   //         resolve({ success: true, hlsUrl, cameraId });
//   //       }
//   //     }, 5000);
//   //   });
//   // }

//   // /**
//   //  * Generate different variants of RTSP URL
//   //  */
//   // generateRTSPVariants(originalUrl) {
//   //   const variants = [];

//   //   // Original URL
//   //   variants.push(originalUrl);

//   //   // Remove query parameters
//   //   const baseUrl = originalUrl.split('?')[0];
//   //   if (baseUrl !== originalUrl) {
//   //     variants.push(baseUrl);
//   //   }

//   //   // Try with different ports
//   //   const urlParts = originalUrl.match(/rtsp:\/\/([^\/]+)(\/.*)?/);
//   //   if (urlParts) {
//   //     const host = urlParts[1];
//   //     const path = urlParts[2] || '';

//   //     // Try default port 554
//   //     if (!host.includes(':554')) {
//   //       const hostWithoutPort = host.split(':')[0];
//   //       const newUrl = `rtsp://${hostWithoutPort}:554${path}`;
//   //       if (!variants.includes(newUrl)) {
//   //         variants.push(newUrl);
//   //       }
//   //     }

//   //     // Try without port
//   //     const hostWithoutPort = host.split(':')[0];
//   //     const noPortUrl = `rtsp://${hostWithoutPort}${path}`;
//   //     if (!variants.includes(noPortUrl)) {
//   //       variants.push(noPortUrl);
//   //     }
//   //   }

//   //   // Add test streams if all else fails
//   //   variants.push('rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov');

//   //   return variants;
//   // }

//   // /**
//   //  * Create placeholder stream when RTSP fails
//   //  */
//   // async createPlaceholderStream(cameraId, hlsUrl) {
//   //   const streamKey = cameraId;
//   //   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   //   const placeholderPath = path.join(hlsDir, 'index.m3u8');

//   //   // Create a simple placeholder HLS file
//   //   const content = `#EXTM3U
//   // #EXT-X-VERSION:3
//   // #EXT-X-TARGETDURATION:2
//   // #EXT-X-MEDIA-SEQUENCE:0
//   // #EXTINF:2.0,
//   // segment_000.ts
//   // #EXTINF:2.0,
//   // segment_001.ts
//   // #EXT-X-ENDLIST`;

//   //   fs.writeFileSync(placeholderPath, content);

//   //   // Create dummy segment files
//   //   for (let i = 0; i < 2; i++) {
//   //     const segmentPath = path.join(hlsDir, `segment_${String(i).padStart(3, '0')}.ts`);
//   //     if (!fs.existsSync(segmentPath)) {
//   //       // Create small dummy file
//   //       fs.writeFileSync(segmentPath, Buffer.from([0x00, 0x00, 0x00, 0x00]));
//   //     }
//   //   }

//   //   this.activeStreams.set(streamKey, {
//   //     hlsUrl,
//   //     hlsDir,
//   //     startTime: new Date(),
//   //     clients: 0,
//   //     cameraId,
//   //     isPlaceholder: true
//   //   });

//   //   return {
//   //     success: true,
//   //     message: "Stream started (placeholder)",
//   //     hlsUrl,
//   //     cameraId,
//   //     isPlaceholder: true
//   //   };
//   // }

//   // /**
//   //  * Normalize RTSP URL - Handle different URL formats
//   //  */


//   // /**
//   //  * Retry stream with different settings
//   //  */
//   // async retryStreamWithDifferentSettings(cameraId, transport, useDifferentPort = false) {
//   //   console.log(`🔄 Retrying stream with ${transport} transport...`);

//   //   const camera = await Camera.findById(cameraId);
//   //   if (!camera) return;

//   //   const streamKey = cameraId;
//   //   if (this.activeStreams.has(streamKey)) {
//   //     const streamInfo = this.activeStreams.get(streamKey);
//   //     if (streamInfo.command) {
//   //       streamInfo.command.kill('SIGTERM');
//   //     }
//   //     this.activeStreams.delete(streamKey);
//   //   }

//   //   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   //   const outputPath = path.join(hlsDir, "index.m3u8");
//   //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//   //   // Try different RTSP URL format if needed
//   //   let rtspUrl = camera.rtspUrl;
//   //   if (useDifferentPort) {
//   //     // Try without port
//   //     rtspUrl = rtspUrl.replace(/:\d+/, '');
//   //   }

//   //   const command = ffmpeg(rtspUrl)
//   //     .inputOptions([
//   //       '-rtsp_transport', transport,
//   //       '-rtsp_flags', 'prefer_tcp',
//   //       '-re',
//   //       '-fflags', 'nobuffer',
//   //       '-flags', 'low_delay',
//   //       '-analyzeduration', '0',
//   //       '-probesize', '32',
//   //     ])
//   //     .outputOptions([
//   //       '-c:v', 'libx264',
//   //       '-preset', 'ultrafast',
//   //       '-tune', 'zerolatency',
//   //       '-crf', '28',
//   //       '-maxrate', '1000k',
//   //       '-bufsize', '2000k',
//   //       '-c:a', 'aac',
//   //       '-b:a', '64k',
//   //       '-hls_time', '2',
//   //       '-hls_list_size', '6',
//   //       '-hls_flags', 'delete_segments+append_list',
//   //       '-hls_segment_filename', path.join(hlsDir, 'segment_%03d.ts'),
//   //       '-f', 'hls',
//   //     ])
//   //     .output(outputPath)
//   //     .on('start', (cmd) => {
//   //       console.log(`✅ Retry successful with ${transport}`);
//   //     })
//   //     .on('error', async (err) => {
//   //       console.error(`❌ Retry with ${transport} failed:`, err.message);
//   //       this.activeStreams.delete(streamKey);
//   //       await Camera.findByIdAndUpdate(cameraId, {
//   //         streamStatus: 'error',
//   //       });
//   //     })
//   //     .on('end', async () => {
//   //       this.activeStreams.delete(streamKey);
//   //       await Camera.findByIdAndUpdate(cameraId, {
//   //         streamStatus: 'offline',
//   //       });
//   //     });

//   //   command.run();

//   //   this.activeStreams.set(streamKey, {
//   //     command,
//   //     hlsUrl,
//   //     hlsDir,
//   //     startTime: new Date(),
//   //     clients: 0,
//   //     cameraId,
//   //   });
//   // }

//   /**
//    * Stop HLS stream for a camera
//    */
//  async stopHLSStream(cameraId, userId) {
//   const streamKey = cameraId;

//   if (!this.activeStreams.has(streamKey)) {
//     return {
//       success: true,
//       message: "Stream already stopped",
//       cameraId,
//     };
//   }

//   const streamInfo = this.activeStreams.get(streamKey);

//   // Kill FFmpeg process with proper error handling
//   try {
//     if (streamInfo && streamInfo.command) {
//       // Check if process is still running
//       if (typeof streamInfo.command.kill === 'function') {
//         // Try graceful shutdown first
//         streamInfo.command.kill('SIGTERM');

//         // Give it a moment to cleanup
//         await new Promise(resolve => setTimeout(resolve, 100));

//         // Force kill if still running
//         if (streamInfo.command.exitCode === null) {
//           streamInfo.command.kill('SIGKILL');
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error killing FFmpeg process:", error);
//     // Continue with cleanup even if kill fails
//   }

//   // Clean up any additional resources
//   try {
//     // Remove from active streams
//     this.activeStreams.delete(streamKey);

//     // Clean up temp files if any
//     if (streamInfo && streamInfo.outputPath) {
//       // Delete temporary files if needed
//       // fs.unlinkSync(streamInfo.outputPath);
//     }
//   } catch (cleanupError) {
//     console.error("Cleanup error:", cleanupError);
//   }

//   // Update camera with retry logic
//   try {
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "stopped",
//       streamingEnabled: false,
//     });
//   } catch (dbError) {
//     console.error("Database update error:", dbError);
//     // Still return success since stream is stopped
//   }

//   return {
//     success: true,
//     message: "Stream stopped successfully",
//     cameraId,
//   };
// }

//   /**
//    * Restart HLS stream
//    */
//   async restartHLSStream(cameraId, userId) {
//     await this.stopHLSStream(cameraId, userId);
//     return await this.startHLSStream(cameraId, userId);
//   }

//   /**
//    * Delete HLS files for a camera
//    */
//   async deleteHLSFiles(cameraId) {
//     const hlsDir = path.join(this.hlsBasePath, cameraId);

//     if (fs.existsSync(hlsDir)) {
//       try {
//         // Delete all files in the directory
//         const files = await fs.promises.readdir(hlsDir);
//         for (const file of files) {
//           await fs.promises.unlink(path.join(hlsDir, file));
//         }
//         // Delete the directory
//         await fs.promises.rmdir(hlsDir);
//         return { success: true, message: "HLS files deleted" };
//       } catch (error) {
//         console.error("Error deleting HLS files:", error);
//         return { success: false, message: error.message };
//       }
//     }

//     return { success: true, message: "No HLS files to delete" };
//   }

//   /**
//    * Get stream info
//    */
//   async getStreamInfo(cameraId, userId, userRole) {
//     const camera = await Camera.findById(cameraId);
//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     // Check access
//     if (
//       userRole !== "admin" &&
//       camera.createdBy.toString() !== userId.toString()
//     ) {
//       throw new AppError("You do not have permission to view this stream", 403);
//     }

//     const streamKey = cameraId;
//     const streamInfo = this.activeStreams.get(streamKey);

//     return {
//       cameraId,
//       cameraName: camera.name,
//       isStreaming: !!streamInfo,
//       hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//       streamStatus: camera.streamStatus,
//       startTime: streamInfo?.startTime || null,
//       clients: streamInfo?.clients || 0,
//       status: camera.status,
//     };
//   }

//   /**
//    * Get all active streams
//    */
//   async getActiveStreams(userId, userRole) {
//     const activeStreams = [];

//     for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
//       const camera = await Camera.findById(cameraId);
//       if (!camera) continue;

//       // Check access
//       if (
//         userRole !== "admin" &&
//         camera.createdBy.toString() !== userId.toString()
//       ) {
//         continue;
//       }

//       activeStreams.push({
//         cameraId,
//         cameraName: camera.name,
//         hlsUrl: streamInfo.hlsUrl,
//         startTime: streamInfo.startTime,
//         clients: streamInfo.clients,
//         status: camera.status,
//       });
//     }

//     return activeStreams;
//   }

//   /**
//    * Get stream URL for client (with client tracking)
//    */
//   async getStreamUrl(cameraId, userId, userRole, clientId) {
//     const streamInfo = await this.getStreamInfo(cameraId, userId, userRole);

//     if (!streamInfo.isStreaming) {
//       // Try to start stream if camera is active
//       const camera = await Camera.findById(cameraId);
//       if (camera && camera.status === "active") {
//         await this.startHLSStream(cameraId, camera.createdBy.toString());
//         // Get updated stream info
//         return await this.getStreamInfo(cameraId, userId, userRole);
//       } else {
//         throw new AppError("Stream is not available", 404);
//       }
//     }

//     // Track client connection
//     const streamKey = cameraId;
//     if (this.activeStreams.has(streamKey)) {
//       const stream = this.activeStreams.get(streamKey);
//       if (clientId) {
//         if (!this.streamClients.has(clientId)) {
//           this.streamClients.set(clientId, {
//             cameraId,
//             connectedAt: new Date(),
//           });
//         }
//         stream.clients = this.streamClients.size;
//       }
//     }

//     return streamInfo;
//   }

//   /**
//    * Client disconnected from stream
//    */
//   async clientDisconnected(clientId) {
//     if (this.streamClients.has(clientId)) {
//       const client = this.streamClients.get(clientId);
//       this.streamClients.delete(clientId);

//       // Update client count for the camera
//       const streamKey = client.cameraId;
//       if (this.activeStreams.has(streamKey)) {
//         const stream = this.activeStreams.get(streamKey);
//         stream.clients = Math.max(0, stream.clients - 1);

//         // If no clients, we could stop the stream after a timeout
//         // But we'll keep it running for better experience
//         // You can implement a timeout if needed
//       }
//     }
//   }

//   /**
//    * Clean up inactive streams (call periodically)
//    */
//   async cleanupInactiveStreams() {
//     // This could be called by a cron job to clean up streams
//     // that have been inactive for too long
//     const now = Date.now();
//     const MAX_STREAM_IDLE_TIME = 5 * 60 * 1000; // 5 minutes

//     for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
//       // If no clients and stream has been running for more than MAX_STREAM_IDLE_TIME
//       if (streamInfo.clients === 0) {
//         const uptime = now - streamInfo.startTime.getTime();
//         if (uptime > MAX_STREAM_IDLE_TIME) {
//           console.log(`Cleaning up idle stream for camera ${cameraId}`);
//           await this.stopHLSStream(cameraId, "system");
//         }
//       }
//     }
//   }

//   /**
//    * Get stream status for dashboard
//    */
//   async getStreamDashboardStats(userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const [totalCameras, streamingCameras, activeStreams, totalClients] =
//       await Promise.all([
//         Camera.countDocuments(filter),
//         Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
//         this.getActiveStreams(userId, userRole).then(
//           (streams) => streams.length,
//         ),
//         Promise.resolve(this.streamClients.size),
//       ]);

//     return {
//       totalCameras,
//       streamingCameras,
//       activeStreams,
//       totalClients,
//       streamingPercentage:
//         totalCameras > 0
//           ? Math.round((streamingCameras / totalCameras) * 100)
//           : 0,
//     };
//   }
// }

// export const cameraService = new CameraService();




























import Camera from "../models/camera.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import NestedSubCategory from "../models/nestedSubCategory.model.js";
import AppError from "../utils/AppError.js";
import { exec } from "child_process";

import mongoose from "mongoose";
import url from "url";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { normalizeRtspUrl } from "../utils/normalizeRtspUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// backend/services/camera.service.js

// Check if ffmpeg is available
const checkFFmpeg = () => {
  return new Promise((resolve) => {
    exec("which ffmpeg", (error, stdout) => {
      if (error) {
        // Try to use ffmpeg-static
        try {
          const staticPath = path.join(
            process.cwd(),
            "node_modules/ffmpeg-static/ffmpeg",
          );
          if (fs.existsSync(staticPath)) {
            ffmpeg.setFfmpegPath(staticPath);
            console.log("✅ Using ffmpeg-static at:", staticPath);
            resolve(true);
          }
        } catch (err) {
          console.error("❌ FFmpeg not found:", err.message);
          resolve(false);
        }
      } else {
        console.log("✅ System FFmpeg found at:", stdout.trim());
        resolve(true);
      }
    });
  });
};

// Call this when service initializes
await checkFFmpeg();
// ✅ FIX: Set FFmpeg path correctly
if (ffmpegStatic) {
  // Ensure we have the correct path to the binary
  const ffmpegPath = ffmpegStatic;
  console.log("🔍 FFmpeg static path:", ffmpegPath);

  // Check if the file exists
  if (fs.existsSync(ffmpegPath)) {
    // Make sure it's executable
    try {
      fs.chmodSync(ffmpegPath, 0o755);
      console.log("✅ FFmpeg permissions set");
    } catch (err) {
      console.warn("⚠️ Could not set permissions:", err.message);
    }

    // Set the path
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log("✅ FFmpeg path set to:", ffmpegPath);
  } else {
    console.warn("⚠️ FFmpeg binary not found at:", ffmpegPath);
  }
} else {
  console.warn("⚠️ ffmpeg-static not found");
}

class CameraService {
  // constructor() {
  //   this.activeStreams = new Map();
  //   this.streamClients = new Map();
  //   this.streamingEnabled = process.env.STREAMING_ENABLED === "true";
  //   this.hlsBasePath =
  //     process.env.HLS_BASE_PATH || path.join(process.cwd(), "streams");
  //   this.hlsPublicPath = process.env.HLS_PUBLIC_PATH || "/streams";

  //   if (this.streamingEnabled) {
  //     this.ensureHlsDirectory();
  //   }
  // }
  // // Health Monitor - Har 10 second me check karega
  // startHealthMonitor() {
  //   setInterval(async () => {
  //     const now = Date.now();

  //     for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
  //       const hasRecentFrames =
  //         streamInfo.lastFrameTimestamp &&
  //         now - streamInfo.lastFrameTimestamp < 15000; // 15 seconds

  //       if (!hasRecentFrames) {
  //         console.log(`⚠️ Stream ${cameraId} STALE - no fresh frames`);

  //         // Auto-recovery: restart stream
  //         await this.stopHLSStream(cameraId, "system");
  //         await this.startHLSStream(cameraId, null, true);
  //       }
  //     }
  //   }, 10000); // Har 10 second
  // }








  constructor() {
    // ✅ CRITICAL: Initialize Maps properly
    this.activeStreams = new Map();
    this.streamClients = new Map();
    this.streamingEnabled = process.env.STREAMING_ENABLED === "true";
    this.hlsBasePath =
      process.env.HLS_BASE_PATH || path.join(process.cwd(), "streams");
    this.hlsPublicPath = process.env.HLS_PUBLIC_PATH || "/streams";
    this.isInitialized = false;

    console.log("🔧 CameraService constructor called");
    console.log(`📊 Streaming enabled: ${this.streamingEnabled}`);
    console.log(`📁 HLS Base Path: ${this.hlsBasePath}`);

    if (this.streamingEnabled) {
      this.ensureHlsDirectory();
    }
  }

  // ✅ FIX 2: Initialize service after constructor
  async initialize() {
    if (this.isInitialized) return;
    
    console.log("🚀 Initializing CameraService...");
    await checkFFmpeg();
    
    if (ffmpegStatic) {
      const ffmpegPath = ffmpegStatic;
      if (fs.existsSync(ffmpegPath)) {
        try {
          fs.chmodSync(ffmpegPath, 0o755);
          console.log("✅ FFmpeg permissions set");
        } catch (err) {
          console.warn("⚠️ Could not set permissions:", err.message);
        }
        ffmpeg.setFfmpegPath(ffmpegPath);
        console.log("✅ FFmpeg path set to:", ffmpegPath);
      } else {
        console.warn("⚠️ FFmpeg binary not found at:", ffmpegPath);
      }
    } else {
      console.warn("⚠️ ffmpeg-static not found");
    }
    
    this.isInitialized = true;
    console.log("✅ CameraService initialized successfully");
    
    // Start health monitor
    this.startHealthMonitor();
  }

  /**
   * Ensure HLS directory exists
   */
  ensureHlsDirectory() {
    try {
      if (!fs.existsSync(this.hlsBasePath)) {
        fs.mkdirSync(this.hlsBasePath, { recursive: true });
        console.log(`✅ HLS directory created: ${this.hlsBasePath}`);
      }
    } catch (error) {
      console.error("❌ Failed to create HLS directory:", error);
    }
  }


  /**
   * Clean HLS files for a camera - ensures no stale segments
   */
  async cleanupHLSFiles(cameraId) {
    const hlsDir = path.join(this.hlsBasePath, cameraId);

    if (!fs.existsSync(hlsDir)) {
      return { success: true };
    }

    try {
      const files = fs.readdirSync(hlsDir);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(hlsDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        // Delete files older than 5 minutes
        if (age > 5 * 60 * 1000) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned ${deletedCount} old HLS files for ${cameraId}`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error(`Cleanup error for ${cameraId}:`, error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Validate RTSP stream is actually accessible
   * Uses ffprobe to check stream availability
   */
  async validateRTSPStream(rtspUrl) {
    return new Promise((resolve) => {
      const tempOutput = path.join(this.hlsBasePath, `temp_${Date.now()}.mp4`);

      // Use ffprobe to check stream
      const probeCommand = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of default=noprint_wrappers=1 "${rtspUrl}"`;

      exec(probeCommand, { timeout: 10000 }, (error, stdout, stderr) => {
        // Clean up temp file
        try {
          if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        } catch (e) {}

        if (error) {
          console.log(`❌ RTSP validation failed: ${error.message}`);
          resolve({
            isValid: false,
            error: error.message,
            stderr: stderr,
          });
          return;
        }

        // Check if we got video stream info
        if (stdout.includes("video")) {
          resolve({ isValid: true, info: stdout });
        } else {
          resolve({
            isValid: false,
            error: "No video stream found",
            stderr: stderr,
          });
        }
      });
    });
  }

  /**
   * Ensure HLS directory exists
   */
  ensureHlsDirectory() {
    if (!fs.existsSync(this.hlsBasePath)) {
      fs.mkdirSync(this.hlsBasePath, { recursive: true });
    }
  }

  /**
   * Create a new camera
   */
  async createCamera(data, userId) {
    // Verify main category exists
    const mainCategory = await Category.findById(data.mainCategoryId);
    console.log(mainCategory);
    data.rtspUrl = normalizeRtspUrl(data.rtspUrl);
    if (!mainCategory) {
      throw new AppError("Main category not found", 404);
    }

    // Check access to main category
    if (mainCategory.createdBy.toString() !== userId.toString()) {
      throw new AppError(
        "You do not have permission to use this main category",
        403,
      );
    }

    // If sub category provided, verify it
    if (data.subCategoryId) {
      const subCategory = await SubCategory.findById(data.subCategoryId);
      if (!subCategory) {
        throw new AppError("Sub category not found", 404);
      }

      if (subCategory.mainCategoryId.toString() !== data.mainCategoryId) {
        throw new AppError(
          "Sub category does not belong to the selected main category",
          400,
        );
      }

      if (subCategory.createdBy.toString() !== userId.toString()) {
        throw new AppError(
          "You do not have permission to use this sub category",
          403,
        );
      }
    }

    // If nested sub category provided, verify it
    if (data.subSubCategoryId) {
      if (!data.subCategoryId) {
        throw new AppError(
          "Sub category is required when selecting nested sub category",
          400,
        );
      }

      const nestedSubCategory = await NestedSubCategory.findById(
        data.subSubCategoryId,
      );
      if (!nestedSubCategory) {
        throw new AppError("Nested sub category not found", 404);
      }

      if (nestedSubCategory.subCategoryId.toString() !== data.subCategoryId) {
        throw new AppError(
          "Nested sub category does not belong to the selected sub category",
          400,
        );
      }

      if (nestedSubCategory.mainCategoryId.toString() !== data.mainCategoryId) {
        throw new AppError(
          "Nested sub category does not belong to the selected main category",
          400,
        );
      }

      if (nestedSubCategory.createdBy.toString() !== userId.toString()) {
        throw new AppError(
          "You do not have permission to use this nested sub category",
          403,
        );
      }
    }

    // Check for duplicate camera name under same user
    const existingCamera = await Camera.findOne({
      name: data.name,
      createdBy: userId,
    });

    if (existingCamera) {
      throw new AppError("You already have a camera with this name", 400);
    }

    // Check for duplicate RTSP URL (optional - if you want to prevent duplicate streams)
    const existingRtsp = await Camera.findOne({
      rtspUrl: data.rtspUrl,
    });

    if (existingRtsp) {
      throw new AppError(
        "A camera with this RTSP URL already exists in the system",
        400,
      );
    }

    // Create camera
    let camera;
    try {
      camera = await Camera.create({
        name: data.name,
        rtspUrl: data.rtspUrl,
        mainCategoryId: data.mainCategoryId,
        subCategoryId: data.subCategoryId || null,
        subSubCategoryId: data.subSubCategoryId || null,
        status: data.status || "active",
        location: data.location || "",
        description: data.description || "",
        thumbnail: data.thumbnail || "",
        streamSettings: data.streamSettings || {
          protocol: "rtsp",
          port: 554,
          transport: "tcp",
          latency: 200,
          fps: 25,
          resolution: "1920x1080",
        },
        createdBy: userId,
        updatedBy: userId,
        streamingEnabled:
          data.streamingEnabled !== undefined ? data.streamingEnabled : true,
        hlsUrl: null,
        streamStatus: "online",
      });
    } catch (error) {
      console.log(error);
      throw new AppError("Failed to create camera", 500);
    }

    await camera.populate([
      { path: "mainCategoryId", select: "name" },
      { path: "subCategoryId", select: "name" },
      { path: "subSubCategoryId", select: "name" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    // Start HLS stream if enabled
    if (this.streamingEnabled && data.autoStartStream !== false) {
      try {
        await this.startHLSStream(camera._id.toString(), userId);
      } catch (error) {
        console.log("Failed to auto-start stream:", error.message);
      }
    }

    return camera;
  }

  /**
   * Get all cameras with filters
   */
  async getAllCameras(query, userId, userRole) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      streamStatus,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      search,
      fromDate,
      toDate,
    } = query;

    // Build filter
    const filter = {};

    // Regular users only see their own
    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Stream status filter
    if (streamStatus && streamStatus !== "all") {
      filter.streamStatus = streamStatus;
    }

    // Category filters
    if (mainCategoryId) {
      filter.mainCategoryId = mainCategoryId;
    }

    if (subCategoryId) {
      filter.subCategoryId = subCategoryId;
    }

    if (subSubCategoryId) {
      filter.subSubCategoryId = subSubCategoryId;
    }

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    // Search by name, location, description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    // Execute queries
    const [cameras, total] = await Promise.all([
      Camera.find(filter)
        .populate("mainCategoryId", "name")
        .populate("subCategoryId", "name")
        .populate("subSubCategoryId", "name")
        .populate("createdBy", "fullName email")
        .populate("updatedBy", "fullName email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Camera.countDocuments(filter),
    ]);

    // Add full path and stream info for each camera
    const camerasWithPath = await Promise.all(
      cameras.map(async (camera) => {
        const path = await this.getFullPath(camera._id);
        const streamInfo = this.activeStreams.get(camera._id.toString());
        return {
          ...camera,
          fullPath: path,
          isStreaming: !!streamInfo,
          hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
          streamClients: streamInfo?.clients || 0,
        };
      }),
    );

    return {
      cameras: camerasWithPath,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get camera by ID
   */
  async getCameraById(id, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid camera ID format", 400);
    }

    const camera = await Camera.findById(id)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    // Check access
    if (
      userRole !== "admin" &&
      camera.createdBy._id.toString() !== userId.toString()
    ) {
      throw new AppError("You do not have permission to view this camera", 403);
    }

    // Get full path
    const fullPath = await this.getFullPath(id);
    const streamInfo = this.activeStreams.get(id);

    return {
      ...camera.toObject(),
      fullPath,
      isStreaming: !!streamInfo,
      hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
      streamClients: streamInfo?.clients || 0,
    };
  }

  /**
   * Get full path (Category > SubCategory > NestedSubCategory > Camera)
   */
  async getFullPath(id) {
    const camera = await Camera.findById(id);
    if (!camera) return [];

    const path = [];

    // Get main category
    const mainCategory = await Category.findById(camera.mainCategoryId);
    if (mainCategory) {
      path.push({
        type: "category",
        id: mainCategory._id,
        name: mainCategory.name,
      });
    }

    // Get sub category
    if (camera.subCategoryId) {
      const subCategory = await SubCategory.findById(camera.subCategoryId);
      if (subCategory) {
        path.push({
          type: "subCategory",
          id: subCategory._id,
          name: subCategory.name,
        });
      }
    }

    // Get nested sub category
    if (camera.subSubCategoryId) {
      const nestedSubCategory = await NestedSubCategory.findById(
        camera.subSubCategoryId,
      );
      if (nestedSubCategory) {
        path.push({
          type: "nested",
          id: nestedSubCategory._id,
          name: nestedSubCategory.name,
        });
      }
    }

    // Add camera itself
    path.push({
      type: "camera",
      id: camera._id,
      name: camera.name,
    });

    return path;
  }

  /**
   * Update camera
   */
  async updateCamera(id, updateData, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid camera ID format", 400);
    }

    const camera = await Camera.findById(id);

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    // Check permission
    if (!camera.canModify(userId, userRole)) {
      throw new AppError(
        "You do not have permission to update this camera",
        403,
      );
    }

    // If name is being changed, check for duplicates
    if (updateData.name && updateData.name !== camera.name) {
      const existingCamera = await Camera.findOne({
        name: updateData.name,
        createdBy: userId,
        _id: { $ne: id },
      });

      if (existingCamera) {
        throw new AppError("You already have a camera with this name", 400);
      }
    }

    // If RTSP URL is being changed, check for duplicates
    if (updateData.rtspUrl && updateData.rtspUrl !== camera.rtspUrl) {
      const existingRtsp = await Camera.findOne({
        rtspUrl: updateData.rtspUrl,
        _id: { $ne: id },
      });

      if (existingRtsp) {
        throw new AppError("A camera with this RTSP URL already exists", 400);
      }
    }

    // If main category is being changed, verify new main category
    if (
      updateData.mainCategoryId &&
      updateData.mainCategoryId !== camera.mainCategoryId.toString()
    ) {
      const newMainCategory = await Category.findById(
        updateData.mainCategoryId,
      );
      if (!newMainCategory) {
        throw new AppError("New main category not found", 404);
      }

      if (newMainCategory.createdBy.toString() !== userId.toString()) {
        throw new AppError(
          "You do not have permission to use this main category",
          403,
        );
      }
    }

    // If sub category is being changed, verify it
    if (updateData.subCategoryId !== undefined) {
      const targetSubCategoryId = updateData.subCategoryId;
      const targetMainCategoryId =
        updateData.mainCategoryId || camera.mainCategoryId;

      if (targetSubCategoryId) {
        const subCategory = await SubCategory.findById(targetSubCategoryId);
        if (!subCategory) {
          throw new AppError("Sub category not found", 404);
        }

        if (
          subCategory.mainCategoryId.toString() !==
          targetMainCategoryId.toString()
        ) {
          throw new AppError(
            "Sub category does not belong to the selected main category",
            400,
          );
        }

        if (subCategory.createdBy.toString() !== userId.toString()) {
          throw new AppError(
            "You do not have permission to use this sub category",
            403,
          );
        }
      }
    }

    // If nested sub category is being changed, verify it
    if (updateData.subSubCategoryId !== undefined) {
      const targetSubCategoryId =
        updateData.subCategoryId !== undefined
          ? updateData.subCategoryId
          : camera.subCategoryId;

      const targetMainCategoryId =
        updateData.mainCategoryId || camera.mainCategoryId;

      if (updateData.subSubCategoryId) {
        if (!targetSubCategoryId) {
          throw new AppError(
            "Sub category is required when selecting nested sub category",
            400,
          );
        }

        const nestedSubCategory = await NestedSubCategory.findById(
          updateData.subSubCategoryId,
        );
        if (!nestedSubCategory) {
          throw new AppError("Nested sub category not found", 404);
        }

        if (
          nestedSubCategory.subCategoryId.toString() !==
          targetSubCategoryId.toString()
        ) {
          throw new AppError(
            "Nested sub category does not belong to the selected sub category",
            400,
          );
        }

        if (
          nestedSubCategory.mainCategoryId.toString() !==
          targetMainCategoryId.toString()
        ) {
          throw new AppError(
            "Nested sub category does not belong to the selected main category",
            400,
          );
        }

        if (nestedSubCategory.createdBy.toString() !== userId.toString()) {
          throw new AppError(
            "You do not have permission to use this nested sub category",
            403,
          );
        }
      } else {
        // If removing nested sub category, ensure sub category exists
        if (!targetSubCategoryId) {
          throw new AppError(
            "Sub category is required when nested sub category is not selected",
            400,
          );
        }
      }
    }

    // If streaming is being disabled, stop the stream
    if (
      updateData.streamingEnabled === false &&
      camera.streamingEnabled === true
    ) {
      await this.stopHLSStream(id, userId);
    }

    // Update
    Object.assign(camera, updateData);
    camera.updatedBy = userId;
    await camera.save();

    // Restart stream if enabled and RTSP URL changed
    if (updateData.rtspUrl && updateData.rtspUrl !== camera.rtspUrl) {
      if (camera.streamingEnabled) {
        await this.restartHLSStream(id, userId);
      }
    }

    await camera.populate([
      { path: "mainCategoryId", select: "name" },
      { path: "subCategoryId", select: "name" },
      { path: "subSubCategoryId", select: "name" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return camera;
  }

  /**
   * Delete camera
   */
  async deleteCamera(id, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid camera ID format", 400);
    }

    const camera = await Camera.findById(id);

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    // Check permission
    if (!camera.canModify(userId, userRole)) {
      throw new AppError(
        "You do not have permission to delete this camera",
        403,
      );
    }

    // Stop any active stream
    await this.stopHLSStream(id, userId);

    // Delete HLS files
    await this.deleteHLSFiles(id);

    await camera.deleteOne();

    return {
      message: "Camera deleted successfully",
      deletedItem: {
        id: camera._id,
        name: camera.name,
      },
    };
  }

  /**
   * Get cameras by category
   */
  async getByCategory(categoryId, categoryType, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new AppError("Invalid category ID", 400);
    }

    const filter = {};

    if (categoryType === "main") {
      filter.mainCategoryId = categoryId;
    } else if (categoryType === "sub") {
      filter.subCategoryId = categoryId;
    } else if (categoryType === "nested") {
      filter.subSubCategoryId = categoryId;
    }

    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    const cameras = await Camera.find(filter)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .populate("createdBy", "fullName")
      .sort("-createdAt");

    // Get category info
    let categoryInfo = null;
    if (categoryType === "main") {
      categoryInfo = await Category.findById(categoryId).select("name");
    } else if (categoryType === "sub") {
      categoryInfo = await SubCategory.findById(categoryId)
        .populate("mainCategoryId", "name")
        .select("name mainCategoryId");
    } else if (categoryType === "nested") {
      categoryInfo = await NestedSubCategory.findById(categoryId)
        .populate("subCategoryId", "name")
        .populate("mainCategoryId", "name")
        .select("name subCategoryId mainCategoryId");
    }

    return {
      category: categoryInfo,
      cameras,
      total: cameras.length,
    };
  }

  /**
   * Get cameras by main category
   */
  async getByMainCategory(mainCategoryId, userId, userRole) {
    return this.getByCategory(mainCategoryId, "main", userId, userRole);
  }

  /**
   * Get cameras by sub category
   */
  async getBySubCategory(subCategoryId, userId, userRole) {
    return this.getByCategory(subCategoryId, "sub", userId, userRole);
  }

  /**
   * Get cameras by nested sub category
   */
  async getByNestedSubCategory(nestedSubCategoryId, userId, userRole) {
    return this.getByCategory(nestedSubCategoryId, "nested", userId, userRole);
  }

  /**
   * Toggle status
   */
  async toggleStatus(id, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid camera ID format", 400);
    }

    const camera = await Camera.findById(id);

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    if (!camera.canModify(userId, userRole)) {
      throw new AppError(
        "You do not have permission to modify this camera",
        403,
      );
    }
    let isActive = camera.status === "inactive" ? "active" : "inactive";
    camera.status = isActive;
    camera.updatedBy = userId;
    await camera.save();

    // Stop stream if camera becomes inactive
    if (camera.status === "inactive") {
      camera.streamStatus = "stopped";
      await this.stopHLSStream(id, userId);
    }

    return camera;
  }

  /**
   * Update stream status
   */
  async updateStreamStatus(id, status, userId, userRole) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid camera ID format", 400);
    }

    const camera = await Camera.findById(id);

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    // Check permission (admins can update any, users can update their own)
    if (
      userRole !== "admin" &&
      camera.createdBy.toString() !== userId.toString()
    ) {
      throw new AppError(
        "You do not have permission to update this camera's stream status",
        403,
      );
    }

    camera.streamStatus = status;
    camera.lastPingAt = new Date();
    await camera.save();

    return camera;
  }

  /**
   * Bulk delete
   */
  async bulkDelete(ids, userId, userRole) {
    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, 400);
    }

    // Get all items
    const filter = { _id: { $in: ids } };
    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    const items = await Camera.find(filter);

    if (items.length === 0) {
      throw new AppError("No cameras found", 404);
    }

    // Check permissions
    for (const item of items) {
      if (!item.canModify(userId, userRole)) {
        throw new AppError(
          `You do not have permission to delete "${item.name}"`,
          403,
        );
      }
    }

    // Stop streams for all cameras
    for (const item of items) {
      await this.stopHLSStream(item._id.toString(), userId);
      await this.deleteHLSFiles(item._id.toString());
    }

    const result = await Camera.deleteMany({ _id: { $in: ids } });

    return {
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} cameras deleted successfully`,
    };
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(ids, status, userId, userRole) {
    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, 400);
    }

    // Get all items to check permissions
    const filter = { _id: { $in: ids } };
    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    const items = await Camera.find(filter);

    if (items.length === 0) {
      throw new AppError("No cameras found", 404);
    }

    // Check permissions
    for (const item of items) {
      if (!item.canModify(userId, userRole)) {
        throw new AppError(
          `You do not have permission to update "${item.name}"`,
          403,
        );
      }
    }

    const result = await Camera.updateMany(
      { _id: { $in: ids } },
      {
        status,
        updatedBy: userId,
      },
    );

    // Stop streams for inactive cameras
    if (status === "inactive") {
      for (const id of ids) {
        await this.stopHLSStream(id, userId);
      }
    }

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} cameras updated to ${status}`,
    };
  }

  /**
   * Search cameras
   */
  async search(searchTerm, userId, userRole, filters = {}) {
    if (!searchTerm || searchTerm.length < 2) {
      throw new AppError("Search term must be at least 2 characters", 400);
    }

    const filter = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { rtspUrl: { $regex: searchTerm, $options: "i" } },
      ],
    };

    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    if (filters.mainCategoryId) {
      filter.mainCategoryId = filters.mainCategoryId;
    }

    if (filters.subCategoryId) {
      filter.subCategoryId = filters.subCategoryId;
    }

    if (filters.status) {
      filter.status = filters.status;
    }

    const results = await Camera.find(filter)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .populate("createdBy", "fullName")
      .limit(20)
      .sort("-createdAt")
      .lean();

    // Add full path for display
    const resultsWithPath = await Promise.all(
      results.map(async (item) => {
        const path = await this.getFullPath(item._id);
        const streamInfo = this.activeStreams.get(item._id.toString());
        return {
          ...item,
          fullPath: path.map((p) => p.name).join(" > "),
          isStreaming: !!streamInfo,
          hlsUrl: streamInfo?.hlsUrl || item.hlsUrl || null,
        };
      }),
    );

    return resultsWithPath;
  }

  /**
   * Get statistics
   */
  async getStats(userId, userRole) {
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    const [
      total,
      active,
      inactive,
      maintenance,
      online,
      offline,
      connecting,
      unknown,
      streaming,
      byStatus,
      byStreamStatus,
      byMainCategory,
    ] = await Promise.all([
      Camera.countDocuments(filter),
      Camera.countDocuments({ ...filter, status: "active" }),
      Camera.countDocuments({ ...filter, status: "inactive" }),
      Camera.countDocuments({ ...filter, status: "maintenance" }),
      Camera.countDocuments({ ...filter, streamStatus: "online" }),
      Camera.countDocuments({ ...filter, streamStatus: "offline" }),
      Camera.countDocuments({ ...filter, streamStatus: "connecting" }),
      Camera.countDocuments({ ...filter, streamStatus: "unknown" }),
      Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
      Camera.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Camera.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$streamStatus",
            count: { $sum: 1 },
          },
        },
      ]),
      Camera.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$mainCategoryId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $project: {
            categoryName: { $arrayElemAt: ["$category.name", 0] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Get recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await Camera.countDocuments({
      ...filter,
      lastPingAt: { $gte: last24Hours },
    });

    // Get active stream count
    const activeStreams = Array.from(this.activeStreams.keys()).filter(
      (key) => {
        const [cameraId] = key.split("-");
        const filterCheck = userRole === "admin" ? {} : { createdBy: userId };
        // We'll just count total active streams for now
        return true;
      },
    ).length;

    return {
      total,
      active,
      inactive,
      maintenance,
      online,
      offline,
      connecting,
      unknown,
      streaming,
      activeStreams,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byStreamStatus: byStreamStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topCategories: byMainCategory,
      recentActivity,
    };
  }

  /**
   * Validate RTSP URL
   */
  async validateRtspUrl(rtspUrl) {
    try {
      const parsedUrl = new URL(rtspUrl);

      const isValid =
        (parsedUrl.protocol === "rtsp:" || parsedUrl.protocol === "rtsps:") &&
        parsedUrl.hostname &&
        parsedUrl.port;

      // Here you could also attempt to connect to the stream
      // This would require additional libraries like ffmpeg or node-rtsp-stream

      return {
        isValid,
        protocol: parsedUrl.protocol.replace(":", ""),
        hostname: parsedUrl.hostname,
        port:
          parsedUrl.port || (parsedUrl.protocol === "rtsp:" ? "554" : "322"),
        path: parsedUrl.pathname,
        username: parsedUrl.username,
        hasAuth: !!(parsedUrl.username || parsedUrl.password),
        message: isValid
          ? "RTSP URL format is valid"
          : "Invalid RTSP URL format",
      };
    } catch (error) {
      return {
        isValid: false,
        message: "Invalid RTSP URL format",
      };
    }
  }

  /**
   * Get camera by RTSP URL
   */
  async getByRtspUrl(rtspUrl, userId, userRole) {
    const filter = { rtspUrl };

    if (userRole !== "admin") {
      filter.createdBy = userId;
    }

    const camera = await Camera.findOne(filter)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .populate("createdBy", "fullName email");

    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    return camera;
  }

  /**
   * Get recent cameras
   */
  async getRecentCameras(limit, userId, userRole) {
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    const cameras = await Camera.find(filter)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .sort("-createdAt")
      .limit(limit)
      .lean();

    return cameras;
  }

  /**
   * Get stream summary
   */
  async getStreamSummary(userId, userRole) {
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    const [online, offline, connecting, unknown, streaming] = await Promise.all(
      [
        Camera.countDocuments({ ...filter, streamStatus: "online" }),
        Camera.countDocuments({ ...filter, streamStatus: "offline" }),
        Camera.countDocuments({ ...filter, streamStatus: "connecting" }),
        Camera.countDocuments({ ...filter, streamStatus: "unknown" }),
        Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
      ],
    );

    const total = online + offline + connecting + unknown;

    return {
      total,
      online,
      offline,
      connecting,
      unknown,
      streaming,
      onlinePercentage: total > 0 ? Math.round((online / total) * 100) : 0,
      offlinePercentage: total > 0 ? Math.round((offline / total) * 100) : 0,
    };
  }

  /**
   * Export cameras
   */
  async exportCameras(userId, userRole, filters = {}) {
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    // Apply filters
    if (filters.mainCategoryId) {
      filter.mainCategoryId = filters.mainCategoryId;
    }
    if (filters.subCategoryId) {
      filter.subCategoryId = filters.subCategoryId;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.streamStatus) {
      filter.streamStatus = filters.streamStatus;
    }

    const cameras = await Camera.find(filter)
      .populate("mainCategoryId", "name")
      .populate("subCategoryId", "name")
      .populate("subSubCategoryId", "name")
      .populate("createdBy", "fullName email")
      .sort("-createdAt")
      .lean();

    // Add full path to each camera
    const camerasWithPath = await Promise.all(
      cameras.map(async (camera) => {
        const path = await this.getFullPath(camera._id);
        const streamInfo = this.activeStreams.get(camera._id.toString());
        return {
          ...camera,
          fullPath: path.map((p) => p.name).join(" > "),
          categoryNames: {
            main: camera.mainCategoryId?.name || "",
            sub: camera.subCategoryId?.name || "",
            nested: camera.subSubCategoryId?.name || "",
          },
          isStreaming: !!streamInfo,
          hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
        };
      }),
    );

    return camerasWithPath;
  }




/**
 * UNIVERSAL RTSP STREAM STARTER
 * Handles ALL types of RTSP URLs without modification
 */
async startHLSStream(cameraId, userId, isAutoRecovery = false) {
  const camera = await Camera.findById(cameraId);
  if (!camera) throw new AppError("Camera not found", 404);

  // Permission check
  if (!isAutoRecovery && userId) {
    if (camera.createdBy.toString() !== userId.toString()) {
      throw new AppError("Permission denied", 403);
    }
  }

  if (camera.status !== "active") {
    throw new AppError(`Camera is ${camera.status}`, 400);
  }

  const streamKey = cameraId;
  
  // Already streaming? Check freshness
  if (this.activeStreams.has(streamKey)) {
    const existing = this.activeStreams.get(streamKey);
    const now = Date.now();
    const isHealthy = existing.lastFrameTimestamp && 
      (now - existing.lastFrameTimestamp) < 15000;
    
    if (isHealthy) {
      return { success: true, hlsUrl: existing.hlsUrl, cameraId };
    } else {
      await this.stopHLSStream(cameraId, "system");
    }
  }

  // Clean HLS directory
  const hlsDir = path.join(this.hlsBasePath, cameraId);
  if (fs.existsSync(hlsDir)) {
    const files = fs.readdirSync(hlsDir);
    for (const file of files) {
      try { fs.unlinkSync(path.join(hlsDir, file)); } catch(e) {}
    }
  } else {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const outputPath = path.join(hlsDir, "index.m3u8");
  const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

  // ✅ UNIVERSAL: URL ko AS-IS use karo, kuch mat badlo
  const rtspUrl = camera.rtspUrl;
  
  console.log(`🎥 Starting stream for ${cameraId}`);
  console.log(`📡 RTSP URL: ${rtspUrl}`);
  console.log(`🔍 URL Type: ${this.detectRTSPType(rtspUrl)}`);

  // ✅ UNIVERSAL FFmpeg command - Jo bhi URL ho, kaam karega
  const command = ffmpeg(rtspUrl)
    .inputOptions([
      // ✅ UNIVERSAL TRANSPORT - Dono try karega
      "-rtsp_transport", "tcp",
      "-rtsp_flags", "prefer_tcp",
      "-user_agent", "FFmpeg/5.0",
      
      // ✅ HAR TYPE KE URL KE LIYE
      "-fflags", "nobuffer+discardcorrupt+fastseek",
      "-flags", "low_delay",
      "-analyzeduration", "0",
      "-probesize", "32",
      "-buffer_size", "1024000",
      "-max_delay", "500000",
      "-reorder_queue_size", "4096",
      
      // ✅ ERROR HANDLING - Sabhi errors ignore karo
      "-err_detect", "ignore_err",
      "-strict", "unofficial",
      
      // ✅ RECONNECT - Agar connection drop ho to auto-reconnect
      "-reconnect", "1",
      "-reconnect_at_eof", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      
      // ✅ TIMEOUT - Lamba timeout for slow connections
      "-timeout", "10000000",
      // "-stimeout", "10000000",
      
      // ✅ ALL MEDIA TYPES - Video + Audio dono
      "-allowed_media_types", "video+audio",
    ])
    .outputOptions([
      // ✅ VIDEO - Auto-detect best codec
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-crf", "23",
      "-maxrate", "2000k",
      "-bufsize", "4000k",
      
      // ✅ PIXEL FORMAT - Universal
      "-pix_fmt", "yuv420p",
      "-vf", "format=yuv420p",
      
      // ✅ KEYFRAMES
      "-g", "60",
      "-keyint_min", "60",
      
      // ✅ AUDIO
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "1",
      
      // ✅ HLS - Universal settings
      "-hls_time", "2",
      "-hls_list_size", "4",
      "-hls_flags", "delete_segments+discont_start+program_date_time",
      "-hls_allow_cache", "0",
      "-hls_start_number_source", "epoch",
      "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
      "-f", "hls",
      
      // ✅ IGNORE ERRORS
      "-xerror", "0",
    ])
    .output(outputPath);

  let frameCount = 0;
  let hasReceivedFrame = false;
  let firstFrameTime = null;
  let retryCount = 0;

  command.on("start", (cmd) => {
    console.log(`✅ FFmpeg started for ${cameraId}`);
    Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "connecting",
      lastPingAt: new Date(),
    }).catch(() => {});
  });

  command.on("progress", (progress) => {
    if (progress.frames > 0) {
      hasReceivedFrame = true;
      const now = Date.now();
      if (!firstFrameTime) firstFrameTime = now;
      
      const streamInfo = this.activeStreams.get(streamKey);
      if (streamInfo) {
        streamInfo.lastFrameTimestamp = now;
      }
      
      frameCount++;
      if (frameCount % 30 === 0) {
        const fps = frameCount / ((now - firstFrameTime) / 1000);
        console.log(`📊 ${cameraId}: ${progress.frames} frames, ${fps.toFixed(1)} fps`);
      }

      Camera.findByIdAndUpdate(cameraId, {
        streamStatus: "streaming",
        lastPingAt: new Date(),
        lastHealthyAt: new Date(now),
      }).catch(() => {});
    }
  });

  command.on("stderr", (line) => {
    // Log only critical errors
    if (line.includes("Error") || line.includes("Invalid") || 
        line.includes("failed") || line.includes("Could not") ||
        line.includes("pixel format") || line.includes("codec")) {
      console.log(`FFmpeg ${cameraId}:`, line);
    }
  });

  command.on("error", async (err) => {
    console.error(`❌ ${cameraId} error:`, err.message);
    
    this.activeStreams.delete(streamKey);
    
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "error",
      lastError: err.message,
      lastErrorAt: new Date(),
    });
    
    // ✅ UNIVERSAL RETRY LOGIC - Different transport try karega
    const errorMsg = err.message.toLowerCase();
    retryCount++;
    
    if (retryCount > 3) {
      console.log(`❌ ${cameraId}: Max retries reached, marking offline`);
      await Camera.findByIdAndUpdate(cameraId, {
        streamStatus: "offline",
        lastError: `Max retries exceeded: ${err.message}`,
        lastErrorAt: new Date(),
      });
      return;
    }
    
    // Try different transport based on error
    if (errorMsg.includes("tcp") || errorMsg.includes("connection")) {
      console.log(`🔄 ${cameraId}: Trying UDP transport...`);
      setTimeout(() => {
        this.startHLSStreamWithTransport(cameraId, userId, "udp");
      }, 3000);
    } else if (errorMsg.includes("udp") || errorMsg.includes("timeout")) {
      console.log(`🔄 ${cameraId}: Trying HTTP transport...`);
      setTimeout(() => {
        this.startHLSStreamWithTransport(cameraId, userId, "http");
      }, 3000);
    } else if (errorMsg.includes("codec") || errorMsg.includes("pixel")) {
      console.log(`🔄 ${cameraId}: Trying copy mode...`);
      setTimeout(() => {
        this.startHLSStreamWithCopyMode(cameraId, userId);
      }, 3000);
    } else {
      console.log(`🔄 ${cameraId}: Retrying with default settings...`);
      setTimeout(() => {
        this.startHLSStream(cameraId, userId, true);
      }, 10000);
    }
  });

  command.on("end", async () => {
    console.log(`⏹️ ${cameraId} ended`);
    
    if (this.activeStreams.get(streamKey)?.command === command) {
      this.activeStreams.delete(streamKey);
    }
    
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: hasReceivedFrame ? "stopped" : "offline",
    });
  });

  // Start the stream
  command.run();

  // Store stream info
  this.activeStreams.set(streamKey, {
    command,
    hlsUrl,
    hlsDir,
    outputPath,
    startTime: new Date(),
    clients: 0,
    cameraId,
    lastFrameTimestamp: null,
    transport: "tcp",
    retryCount: 0,
  });

  await Camera.findByIdAndUpdate(cameraId, {
    streamStatus: "connecting",
    hlsUrl,
    streamingEnabled: true,
  });

  return {
    success: true,
    message: "Stream started",
    hlsUrl,
    cameraId,
  };
}

/**
 * Start stream with specific transport
 */
async startHLSStreamWithTransport(cameraId, userId, transport) {
  console.log(`🔄 Starting ${transport} transport for ${cameraId}`);
  
  const camera = await Camera.findById(cameraId);
  if (!camera) return;

  const streamKey = cameraId;
  if (this.activeStreams.has(streamKey)) {
    await this.stopHLSStream(cameraId, "system");
  }

  const hlsDir = path.join(this.hlsBasePath, cameraId);
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const outputPath = path.join(hlsDir, "index.m3u8");
  const timestamp = Date.now();
  const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

  // ✅ URL AS-IS - Kuch mat badlo
  const rtspUrl = camera.rtspUrl;

  // ✅ Transport-specific options
  let inputOptions = [
    "-rtsp_transport", transport,
    "-rtsp_flags", "prefer_tcp",
    "-fflags", "nobuffer+discardcorrupt",
    "-flags", "low_delay",
    "-analyzeduration", "0",
    "-probesize", "32",
    "-err_detect", "ignore_err",
    "-strict", "unofficial",
  ];

  // HTTP transport ke liye extra options
  if (transport === "http") {
    inputOptions = [
      "-rtsp_transport", "http",
      "-rtsp_flags", "prefer_tcp",
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-analyzeduration", "0",
      "-probesize", "32",
      "-err_detect", "ignore_err",
    ];
  }

  const command = ffmpeg(rtspUrl)
    .inputOptions(inputOptions)
    .outputOptions([
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-hls_time", "2",
      "-hls_list_size", "4",
      "-hls_flags", "delete_segments+discont_start",
      "-hls_allow_cache", "0",
      "-hls_start_number_source", "epoch",
      "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
      "-f", "hls",
      "-xerror", "0",
    ])
    .output(outputPath);

  let hasReceivedFrame = false;

  command.on("start", () => {
    console.log(`✅ ${transport.toUpperCase()} stream started for ${cameraId}`);
  });

  command.on("progress", (progress) => {
    if (progress.frames > 0) {
      hasReceivedFrame = true;
      const streamInfo = this.activeStreams.get(streamKey);
      if (streamInfo) {
        streamInfo.lastFrameTimestamp = Date.now();
      }
      Camera.findByIdAndUpdate(cameraId, {
        streamStatus: "streaming",
        lastPingAt: new Date(),
        lastHealthyAt: new Date(),
      }).catch(() => {});
    }
  });

  command.on("error", async (err) => {
    console.error(`❌ ${transport} failed for ${cameraId}:`, err.message);
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "error",
      lastError: err.message,
      lastErrorAt: new Date(),
    });
  });

  command.on("end", async () => {
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: hasReceivedFrame ? "stopped" : "offline",
    });
  });

  command.run();

  this.activeStreams.set(streamKey, {
    command,
    hlsUrl,
    hlsDir,
    startTime: new Date(),
    clients: 0,
    cameraId,
    transport: transport,
  });

  return { success: true, hlsUrl, cameraId };
}

/**
 * Copy mode - No re-encoding, direct stream copy
 */
async startHLSStreamWithCopyMode(cameraId, userId) {
  console.log(`🔄 Copy mode for ${cameraId}`);
  
  const camera = await Camera.findById(cameraId);
  if (!camera) return;

  const streamKey = cameraId;
  if (this.activeStreams.has(streamKey)) {
    await this.stopHLSStream(cameraId, "system");
  }

  const hlsDir = path.join(this.hlsBasePath, cameraId);
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const outputPath = path.join(hlsDir, "index.m3u8");
  const timestamp = Date.now();
  const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

  // ✅ URL AS-IS
  const rtspUrl = camera.rtspUrl;

  // ✅ COPY MODE - Sabse fast, sabse reliable
  const command = ffmpeg(rtspUrl)
    .inputOptions([
      "-rtsp_transport", "tcp",
      "-rtsp_flags", "prefer_tcp",
      "-fflags", "nobuffer+discardcorrupt",
      "-flags", "low_delay",
      "-analyzeduration", "0",
      "-probesize", "32",
      "-err_detect", "ignore_err",
    ])
    .outputOptions([
      "-c:v", "copy",  // DIRECT COPY - No re-encoding
      "-c:a", "copy",  // DIRECT COPY - No re-encoding
      "-hls_time", "2",
      "-hls_list_size", "4",
      "-hls_flags", "delete_segments+discont_start",
      "-hls_allow_cache", "0",
      "-hls_start_number_source", "epoch",
      "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
      "-f", "hls",
    ])
    .output(outputPath);

  let hasReceivedFrame = false;

  command.on("start", () => {
    console.log(`✅ Copy mode started for ${cameraId}`);
  });

  command.on("progress", (progress) => {
    if (progress.frames > 0) {
      hasReceivedFrame = true;
      const streamInfo = this.activeStreams.get(streamKey);
      if (streamInfo) {
        streamInfo.lastFrameTimestamp = Date.now();
      }
      Camera.findByIdAndUpdate(cameraId, {
        streamStatus: "streaming",
        lastPingAt: new Date(),
        lastHealthyAt: new Date(),
      }).catch(() => {});
    }
  });

  command.on("error", async (err) => {
    console.error(`❌ Copy mode failed for ${cameraId}:`, err.message);
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "error",
      lastError: err.message,
      lastErrorAt: new Date(),
    });
  });

  command.on("end", async () => {
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: hasReceivedFrame ? "stopped" : "offline",
    });
  });

  command.run();

  this.activeStreams.set(streamKey, {
    command,
    hlsUrl,
    hlsDir,
    startTime: new Date(),
    clients: 0,
    cameraId,
    transport: "copy",
  });

  return { success: true, hlsUrl, cameraId };
}

/**
 * Detect RTSP URL type (for debugging)
 */
detectRTSPType(url) {
  const types = [];
  
  if (url.includes('?')) types.push('Query Params');
  if (url.includes('@')) types.push('Auth Credentials');
  if (url.match(/:\d+/)) types.push('Custom Port');
  if (url.match(/\/\d+\/\d+/)) types.push('Channel/Stream Path');
  if (url.includes('rtsp://')) types.push('Standard RTSP');
  if (url.includes('rtsps://')) types.push('Secure RTSP');
  
  return types.join(' + ') || 'Standard RTSP';
}
async startHLSStreamWithTCP(cameraId, userId) {
  console.log(`🔄 Trying TCP transport for ${cameraId}`);
  
  const camera = await Camera.findById(cameraId);
  if (!camera) return;

  const streamKey = cameraId;
  if (this.activeStreams.has(streamKey)) {
    await this.stopHLSStream(cameraId, "system");
  }

  const hlsDir = path.join(this.hlsBasePath, cameraId);
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const outputPath = path.join(hlsDir, "index.m3u8");
  const timestamp = Date.now();
  const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

  // ✅ TCP - SIRF BASIC OPTIONS
  const command = ffmpeg(camera.rtspUrl)
    .inputOptions([
      "-rtsp_transport", "tcp",
      "-rtsp_flags", "prefer_tcp",
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-analyzeduration", "1000000",
      "-probesize", "5000000",
      "-buffer_size", "1024000",
      "-max_delay", "500000",
    ])
    .outputOptions([
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-crf", "23",
      "-maxrate", "2000k",
      "-bufsize", "4000k",
      "-pix_fmt", "yuv420p",
      "-g", "60",
      "-keyint_min", "60",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "1",
      "-hls_time", "3",
      "-hls_list_size", "4",
      "-hls_flags", "delete_segments+program_date_time+discont_start",
      "-hls_allow_cache", "0",
      "-hls_start_number_source", "datetime",
      "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
      "-f", "hls",
    ])
    .output(outputPath);

  let hasReceivedFrame = false;

  command.on("start", () => {
    console.log(`✅ TCP stream started for ${cameraId}`);
    Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "connecting",
      lastPingAt: new Date(),
    }).catch(() => {});
  });

  command.on("progress", (progress) => {
    if (progress.frames > 0) {
      hasReceivedFrame = true;
      const now = Date.now();
      const streamInfo = this.activeStreams.get(streamKey);
      if (streamInfo) {
        streamInfo.lastFrameTimestamp = now;
      }
      Camera.findByIdAndUpdate(cameraId, {
        streamStatus: "streaming",
        lastPingAt: new Date(),
        lastHealthyAt: new Date(now),
      }).catch(() => {});
    }
  });

  command.on("error", async (err) => {
    console.error(`❌ TCP stream error for ${cameraId}:`, err.message);
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "error",
      lastError: err.message,
      lastErrorAt: new Date(),
    });
  });

  command.on("end", async () => {
    this.activeStreams.delete(streamKey);
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: hasReceivedFrame ? "stopped" : "offline",
    });
  });

  command.run();

  this.activeStreams.set(streamKey, {
    command,
    hlsUrl,
    hlsDir,
    outputPath,
    startTime: new Date(),
    clients: 0,
    cameraId,
    lastFrameTimestamp: null,
    healthStatus: "starting",
    lastHealthCheck: Date.now(),
    transport: "tcp",
  });

  return {
    success: true,
    message: "Stream started with TCP",
    hlsUrl,
    cameraId,
  };
}
  /**
   * Start HLS stream for a camera - SIMPLIFIED WORKING VERSION
   */
  // async startHLSStream(cameraId, userId, isAutoRecovery = false) {
  //   const camera = await Camera.findById(cameraId);
  //   if (!camera) throw new AppError("Camera not found", 404);

  //   // Check permission
  //   if (!isAutoRecovery && userId) {
  //     if (camera.createdBy.toString() !== userId.toString()) {
  //       throw new AppError("Permission denied", 403);
  //     }
  //   }

  //   if (camera.status !== "active") {
  //     throw new AppError(`Camera is ${camera.status}`, 400);
  //   }

  //   // ✅ FIX 1: Validate RTSP URL first
  //   const validation = await this.validateRTSPStream(camera.rtspUrl);
  //   if (!validation.isValid) {
  //     console.error(`❌ RTSP URL invalid for ${cameraId}:`, validation.error);
  //     await Camera.findByIdAndUpdate(cameraId, {
  //       streamStatus: "offline",
  //       lastError: `RTSP unavailable: ${validation.error}`,
  //       lastErrorAt: new Date(),
  //     });
  //     throw new AppError(`RTSP stream unavailable: ${validation.error}`, 400);
  //   }

  //   // Already streaming? Check freshness
  //   const streamKey = cameraId;
  //   if (this.activeStreams.has(streamKey)) {
  //     const existing = this.activeStreams.get(streamKey);
  //     const now = Date.now();
  //     const isHealthy =
  //       existing.lastFrameTimestamp &&
  //       now - existing.lastFrameTimestamp < 15000;

  //     if (isHealthy) {
  //       return { success: true, hlsUrl: existing.hlsUrl, cameraId };
  //     } else {
  //       await this.stopHLSStream(cameraId, "system");
  //     }
  //   }

  //   // Create HLS directory - clean start
  //   const hlsDir = path.join(this.hlsBasePath, cameraId);
  //   if (fs.existsSync(hlsDir)) {
  //     const files = fs.readdirSync(hlsDir);
  //     for (const file of files) {
  //       try {
  //         fs.unlinkSync(path.join(hlsDir, file));
  //       } catch (e) {}
  //     }
  //   } else {
  //     fs.mkdirSync(hlsDir, { recursive: true });
  //   }

  //   const outputPath = path.join(hlsDir, "index.m3u8");
  //   const timestamp = Date.now();
  //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

  //   // ✅ FIX 2: Properly escape URL with quotes
  //   const rtspUrl = camera.rtspUrl;

  //   // ✅ FIX 3: Clean URL - remove problematic characters
  //   // Some RTSP URLs have query params that FFmpeg doesn't like
  //   let cleanUrl = rtspUrl;
  //   // If URL has query params, FFmpeg might need them escaped
  //   // But sometimes the camera needs them as-is

  //   console.log(`🎥 Starting stream for ${cameraId}`);
  //   console.log(`📡 RTSP URL: ${rtspUrl}`);

  //   // ✅ FIX 4: FFmpeg with proper URL handling
  //   const command = ffmpeg(rtspUrl)
  //     .inputOptions([
  //       "-rtsp_transport",
  //       "tcp",
  //       "-rtsp_flags",
  //       "prefer_tcp",
  //       // ✅ FIX 5: Handle malformed URLs
  //       "-allowed_media_types",
  //       "video",
  //       "-user_agent",
  //       "FFmpeg/4.4",
  //       "-timeout",
  //       "5000000", // 5 second timeout
  //       "-stimeout",
  //       "5000000",
  //       // Buffer settings
  //       "-fflags",
  //       "nobuffer+discardcorrupt+fastseek",
  //       "-analyzeduration",
  //       "1000000",
  //       "-probesize",
  //       "5000000",
  //       "-buffer_size",
  //       "1024000",
  //       "-max_delay",
  //       "500000",
  //       "-reorder_queue_size",
  //       "4096",
  //       // ✅ FIX 6: Force reconnect on failure
  //       "-reconnect",
  //       "1",
  //       "-reconnect_at_eof",
  //       "1",
  //       "-reconnect_streamed",
  //       "1",
  //       "-reconnect_delay_max",
  //       "5",
  //     ])
  //     .outputOptions([
  //       "-c:v",
  //       "libx264",
  //       "-preset",
  //       "veryfast",
  //       "-tune",
  //       "zerolatency",
  //       "-crf",
  //       "23",
  //       "-maxrate",
  //       "2000k",
  //       "-bufsize",
  //       "4000k",
  //       "-pix_fmt",
  //       "yuv420p",
  //       "-g",
  //       "60",
  //       "-keyint_min",
  //       "60",
  //       "-c:a",
  //       "aac",
  //       "-b:a",
  //       "128k",
  //       "-ar",
  //       "44100",
  //       "-ac",
  //       "1",
  //       // HLS settings
  //       "-hls_time",
  //       "3",
  //       "-hls_list_size",
  //       "4",
  //       "-hls_flags",
  //       "delete_segments+program_date_time+discont_start",
  //       "-hls_allow_cache",
  //       "0",
  //       "-hls_start_number_source",
  //       "datetime",
  //       "-hls_segment_filename",
  //       path.join(hlsDir, `segment_%03d.ts`),
  //       "-f",
  //       "hls",
  //       // ✅ FIX 7: Don't exit on first error
  //       "-xerror",
  //       "0",
  //     ])
  //     .output(outputPath);

  //   // Track frame timestamps
  //   let frameCount = 0;
  //   let hasReceivedFrame = false;
  //   let startError = null;

  //   command.on("start", (cmd) => {
  //     console.log(`✅ FFmpeg started for ${cameraId}`);
  //     Camera.findByIdAndUpdate(cameraId, {
  //       streamStatus: "connecting",
  //       lastPingAt: new Date(),
  //     }).catch(() => {});
  //   });

  //   command.on("progress", (progress) => {
  //     if (progress.frames > 0) {
  //       hasReceivedFrame = true;
  //       const now = Date.now();
  //       const streamInfo = this.activeStreams.get(streamKey);
  //       if (streamInfo) {
  //         streamInfo.lastFrameTimestamp = now;
  //         streamInfo.framesReceived = (streamInfo.framesReceived || 0) + 1;
  //       }

  //       frameCount++;
  //       if (frameCount % 30 === 0) {
  //         console.log(
  //           `📊 ${cameraId}: ${progress.frames} frames, ${progress.currentFps} fps`,
  //         );
  //       }

  //       Camera.findByIdAndUpdate(cameraId, {
  //         streamStatus: "streaming",
  //         lastPingAt: new Date(),
  //         lastHealthyAt: new Date(now),
  //       }).catch(() => {});
  //     }
  //   });

  //   command.on("stderr", (line) => {
  //     // ✅ FIX 8: Handle specific errors
  //     if (line.includes("404 Not Found")) {
  //       console.error(`❌ ${cameraId}: RTSP URL 404 - Camera may be offline`);
  //       startError = "RTSP 404 - Camera offline";
  //     }

  //     if (line.includes("Connection refused")) {
  //       console.error(
  //         `❌ ${cameraId}: Connection refused - Check camera network`,
  //       );
  //       startError = "Connection refused";
  //     }

  //     if (line.includes("Invalid data found")) {
  //       console.error(`❌ ${cameraId}: Invalid data - Trying UDP fallback`);
  //       // Try UDP transport
  //       setTimeout(() => {
  //         this.startHLSStreamWithUDP(cameraId, userId);
  //       }, 2000);
  //     }

  //     // Log only important lines
  //     if (
  //       line.includes("Error") ||
  //       line.includes("Invalid") ||
  //       line.includes("failed") ||
  //       line.includes("Could not")
  //     ) {
  //       console.log(`FFmpeg ${cameraId}:`, line);
  //     }
  //   });

  //   command.on("error", async (err) => {
  //     console.error(`❌ ${cameraId} error:`, err.message);

  //     const streamInfo = this.activeStreams.get(streamKey);
  //     if (streamInfo) {
  //       streamInfo.error = err.message;
  //       streamInfo.errorCount = (streamInfo.errorCount || 0) + 1;
  //     }

  //     this.activeStreams.delete(streamKey);

  //     await Camera.findByIdAndUpdate(cameraId, {
  //       streamStatus: "error",
  //       lastError: err.message,
  //       lastErrorAt: new Date(),
  //     });

  //     // ✅ FIX 9: Auto-retry with different settings
  //     const errorMsg = err.message.toLowerCase();

  //     if (errorMsg.includes("404") || errorMsg.includes("not found")) {
  //       console.log(
  //         `🔄 ${cameraId}: RTSP 404 - Marking as offline, will retry in 30s`,
  //       );
  //       await Camera.findByIdAndUpdate(cameraId, {
  //         streamStatus: "offline",
  //       });
  //       // Retry after 30 seconds
  //       setTimeout(() => {
  //         this.startHLSStream(cameraId, userId, true).catch(() => {});
  //       }, 30000);
  //     } else if (
  //       errorMsg.includes("connection refused") ||
  //       errorMsg.includes("timeout")
  //     ) {
  //       console.log(`🔄 ${cameraId}: Connection issue, retrying in 10s...`);
  //       setTimeout(() => {
  //         this.startHLSStream(cameraId, userId, true).catch(() => {});
  //       }, 10000);
  //     } else if (errorMsg.includes("invalid data")) {
  //       console.log(`🔄 ${cameraId}: Invalid data, trying UDP...`);
  //       this.startHLSStreamWithUDP(cameraId, userId).catch(() => {});
  //     }
  //   });

  //   command.on("end", async () => {
  //     console.log(`⏹️ ${cameraId} ended`);

  //     // Only clear if this is the same stream
  //     if (this.activeStreams.get(streamKey)?.command === command) {
  //       this.activeStreams.delete(streamKey);
  //     }

  //     // If no frames received, mark as offline
  //     if (!hasReceivedFrame) {
  //       await Camera.findByIdAndUpdate(cameraId, {
  //         streamStatus: "offline",
  //         lastError: "No frames received",
  //         lastErrorAt: new Date(),
  //       });
  //     } else {
  //       await Camera.findByIdAndUpdate(cameraId, {
  //         streamStatus: "stopped",
  //       });
  //     }
  //   });

  //   // Start the stream
  //   command.run();

  //   // Store stream info
  //   this.activeStreams.set(streamKey, {
  //     command,
  //     hlsUrl,
  //     hlsDir,
  //     outputPath,
  //     startTime: new Date(),
  //     clients: 0,
  //     cameraId,
  //     lastFrameTimestamp: null,
  //     framesReceived: 0,
  //     healthStatus: "starting",
  //     lastHealthCheck: Date.now(),
  //     errorCount: 0,
  //   });

  //   await Camera.findByIdAndUpdate(cameraId, {
  //     streamStatus: "connecting",
  //     hlsUrl,
  //     streamingEnabled: true,
  //   });

  //   return {
  //     success: true,
  //     message: "Stream started",
  //     hlsUrl,
  //     cameraId,
  //   };
  // }



  // backend/services/camera.service.js

// backend/services/camera.service.js

// backend/services/camera.service.js

// async startHLSStream(cameraId, userId, isAutoRecovery = false) {
//   const camera = await Camera.findById(cameraId);
//   if (!camera) throw new AppError("Camera not found", 404);

//   // Permission check
//   if (!isAutoRecovery && userId) {
//     if (camera.createdBy.toString() !== userId.toString()) {
//       throw new AppError("Permission denied", 403);
//     }
//   }

//   if (camera.status !== "active") {
//     throw new AppError(`Camera is ${camera.status}`, 400);
//   }

//   const streamKey = cameraId;
  
//   // Already streaming?
//   if (this.activeStreams.has(streamKey)) {
//     const existing = this.activeStreams.get(streamKey);
//     const now = Date.now();
//     const isHealthy = existing.lastFrameTimestamp && 
//       (now - existing.lastFrameTimestamp) < 15000;
    
//     if (isHealthy) {
//       return { success: true, hlsUrl: existing.hlsUrl, cameraId };
//     } else {
//       await this.stopHLSStream(cameraId, "system");
//     }
//   }

//   // Clean HLS directory
//   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   if (fs.existsSync(hlsDir)) {
//     const files = fs.readdirSync(hlsDir);
//     for (const file of files) {
//       try { fs.unlinkSync(path.join(hlsDir, file)); } catch(e) {}
//     }
//   } else {
//     fs.mkdirSync(hlsDir, { recursive: true });
//   }

//   const outputPath = path.join(hlsDir, "index.m3u8");
//   const timestamp = Date.now();
//   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;

//   const rtspUrl = camera.rtspUrl;
//   console.log(`🎥 Starting stream for ${cameraId}`);
//   console.log(`📡 RTSP URL: ${rtspUrl}`);

//   // ✅ FINAL FIXED COMMAND - SIRF BASIC OPTIONS
//   const command = ffmpeg(rtspUrl)
//     .inputOptions([
//       "-rtsp_transport", "udp",
//       "-rtsp_flags", "prefer_tcp",
//       "-fflags", "nobuffer",
//       "-flags", "low_delay",
//       "-analyzeduration", "1000000",
//       "-probesize", "5000000",
//       "-buffer_size", "1024000",
//       "-max_delay", "500000",
//       // ❌ Sabhi reconnect options HATAO
//       // ❌ stimeout HATAO
//       // ❌ reconnect HATAO
//     ])
//     .outputOptions([
//       "-c:v", "libx264",
//       "-preset", "veryfast",
//       "-tune", "zerolatency",
//       "-crf", "23",
//       "-maxrate", "2000k",
//       "-bufsize", "4000k",
//       "-pix_fmt", "yuv420p",
//       "-g", "60",
//       "-keyint_min", "60",
//       "-c:a", "aac",
//       "-b:a", "128k",
//       "-ar", "44100",
//       "-ac", "1",
//       "-hls_time", "3",
//       "-hls_list_size", "4",
//       "-hls_flags", "delete_segments+program_date_time+discont_start",
//       "-hls_allow_cache", "0",
//       "-hls_start_number_source", "datetime",
//       "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
//       "-f", "hls",
//     ])
//     .output(outputPath);

//   // Track frames
//   let frameCount = 0;
//   let hasReceivedFrame = false;

//   command.on("start", (cmd) => {
//     console.log(`✅ FFmpeg started for ${cameraId} with UDP transport`);
//     Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "connecting",
//       lastPingAt: new Date(),
//     }).catch(() => {});
//   });

//   command.on("progress", (progress) => {
//     if (progress.frames > 0) {
//       hasReceivedFrame = true;
//       const now = Date.now();
//       const streamInfo = this.activeStreams.get(streamKey);
//       if (streamInfo) {
//         streamInfo.lastFrameTimestamp = now;
//         streamInfo.framesReceived = (streamInfo.framesReceived || 0) + 1;
//       }
      
//       frameCount++;
//       if (frameCount % 30 === 0) {
//         console.log(`📊 ${cameraId}: ${progress.frames} frames, ${progress.currentFps} fps`);
//       }

//       Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: "streaming",
//         lastPingAt: new Date(),
//         lastHealthyAt: new Date(now),
//       }).catch(() => {});
//     }
//   });

//   command.on("stderr", (line) => {
//     // Log important lines
//     if (line.includes("Error") || line.includes("Invalid") || 
//         line.includes("failed") || line.includes("Could not") ||
//         line.includes("404") || line.includes("Nonmatching") ||
//         line.includes("frame=")) {
//       console.log(`FFmpeg ${cameraId}:`, line);
//     }
//   });

//   command.on("error", async (err) => {
//     console.error(`❌ ${cameraId} error:`, err.message);
    
//     this.activeStreams.delete(streamKey);
    
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "error",
//       lastError: err.message,
//       lastErrorAt: new Date(),
//     });
    
//     // ✅ Auto-retry
//     const errorMsg = err.message.toLowerCase();
    
//     if (errorMsg.includes("nonmatching") || errorMsg.includes("invalid data")) {
//       console.log(`🔄 ${cameraId}: UDP failed, trying TCP...`);
//       setTimeout(() => {
//         this.startHLSStreamWithTCP(cameraId, userId).catch(() => {});
//       }, 3000);
//     } else if (errorMsg.includes("404") || errorMsg.includes("not found")) {
//       console.log(`🔄 ${cameraId}: RTSP 404 - Retrying in 30s`);
//       setTimeout(() => {
//         this.startHLSStream(cameraId, userId, true).catch(() => {});
//       }, 30000);
//     } else {
//       console.log(`🔄 ${cameraId}: Retrying in 10s...`);
//       setTimeout(() => {
//         this.startHLSStream(cameraId, userId, true).catch(() => {});
//       }, 10000);
//     }
//   });

//   command.on("end", async () => {
//     console.log(`⏹️ ${cameraId} ended`);
    
//     if (this.activeStreams.get(streamKey)?.command === command) {
//       this.activeStreams.delete(streamKey);
//     }
    
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: hasReceivedFrame ? "stopped" : "offline",
//     });
//   });

//   // Start the stream
//   command.run();

//   // Store stream info
//   this.activeStreams.set(streamKey, {
//     command,
//     hlsUrl,
//     hlsDir,
//     outputPath,
//     startTime: new Date(),
//     clients: 0,
//     cameraId,
//     lastFrameTimestamp: null,
//     framesReceived: 0,
//     healthStatus: "starting",
//     lastHealthCheck: Date.now(),
//     transport: "udp",
//   });

//   await Camera.findByIdAndUpdate(cameraId, {
//     streamStatus: "connecting",
//     hlsUrl,
//     streamingEnabled: true,
//   });

//   return {
//     success: true,
//     message: "Stream started with UDP",
//     hlsUrl,
//     cameraId,
//   };
// }



startHealthMonitor() {
    setInterval(async () => {
      try {
        // ✅ Check if activeStreams exists
        if (!this.activeStreams) {
          console.error("❌ activeStreams is undefined in health monitor");
          return;
        }

        const now = Date.now();
        let restartedCount = 0;
        
        for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
          let needsRestart = false;
          let reason = "";
          
          // Check 1: No frames received recently
          const lastFrame = streamInfo?.lastFrameTimestamp || 0;
          if (now - lastFrame > 20000) {
            needsRestart = true;
            reason = "No frames for 20+ seconds";
          }
          
          // Check 2: FFmpeg process dead
          if (streamInfo?.command && streamInfo.command.exitCode !== null) {
            needsRestart = true;
            reason = `FFmpeg exited with code ${streamInfo.command.exitCode}`;
          }
          
          // Check 3: Stream started but no frames ever received
          if (streamInfo?.startTime && !streamInfo?.lastFrameTimestamp) {
            const elapsed = now - streamInfo.startTime.getTime();
            if (elapsed > 30000) {
              needsRestart = true;
              reason = "No frames received after 30 seconds";
            }
          }
          
          if (needsRestart) {
            console.log(`🔄 Auto-recovery: ${cameraId} - ${reason}`);
            restartedCount++;
            
            try {
              await this.stopHLSStream(cameraId, "system");
              await new Promise(resolve => setTimeout(resolve, 1000));
              await this.startHLSStream(cameraId, null, true);
              console.log(`✅ Auto-recovery successful for ${cameraId}`);
            } catch (error) {
              console.error(`❌ Auto-recovery failed for ${cameraId}:`, error.message);
            }
          }
        }
        
        if (restartedCount > 0) {
          console.log(`🔄 Health Monitor: Restarted ${restartedCount} stale streams`);
        }
      } catch (error) {
        console.error("❌ Health monitor error:", error);
      }
    }, 30000);
  }

  // ✅ FIX 3: Safe getter for activeStreams
  getActiveStreamsMap() {
    if (!this.activeStreams) {
      console.warn("⚠️ activeStreams was undefined, reinitializing...");
      this.activeStreams = new Map();
    }
    return this.activeStreams;
  }

  // ✅ FIX 4: Safe getter for streamClients
  getStreamClientsMap() {
    if (!this.streamClients) {
      console.warn("⚠️ streamClients was undefined, reinitializing...");
      this.streamClients = new Map();
    }
    return this.streamClients;
  }

  /**
   * Get stream status for dashboard
   */
  async getStreamDashboardStats(userId, userRole) {
    // ✅ FIX: Safely access activeStreams
    const activeStreamsMap = this.getActiveStreamsMap();
    const streamClientsMap = this.getStreamClientsMap();
    
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    const [totalCameras, streamingCameras, activeStreamsCount] = await Promise.all([
      Camera.countDocuments(filter),
      Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
      Promise.resolve(activeStreamsMap.size),
    ]);

    // ✅ FIX: Safely get total clients
    let totalClients = 0;
    try {
      totalClients = streamClientsMap.size || 0;
    } catch (error) {
      console.error("Error getting stream clients size:", error);
      totalClients = 0;
    }

    return {
      totalCameras,
      streamingCameras,
      activeStreams: activeStreamsCount,
      totalClients,
      streamingPercentage:
        totalCameras > 0
          ? Math.round((streamingCameras / totalCameras) * 100)
          : 0,
    };
  }







  /**
   * Create placeholder stream when RTSP fails
   */
  async createPlaceholderStream(cameraId, hlsUrl) {
    const hlsDir = path.join(this.hlsBasePath, cameraId);
    const outputPath = path.join(hlsDir, "index.m3u8");

    // Create a simple HLS file
    const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:2.0,
segment_000.ts
#EXTINF:2.0,
segment_001.ts
#EXT-X-ENDLIST`;

    fs.writeFileSync(outputPath, m3u8Content);

    // Create dummy segment files
    for (let i = 0; i < 2; i++) {
      const segmentPath = path.join(
        hlsDir,
        `segment_${String(i).padStart(3, "0")}.ts`,
      );
      if (!fs.existsSync(segmentPath)) {
        fs.writeFileSync(segmentPath, Buffer.from([0x00, 0x00, 0x00, 0x00]));
      }
    }

    console.log("✅ Placeholder stream created at:", hlsUrl);

    // Update camera
    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "streaming",
      hlsUrl,
    });

    // Store in active streams
    const streamKey = cameraId;
    this.activeStreams.set(streamKey, {
      hlsUrl,
      hlsDir,
      startTime: new Date(),
      clients: 0,
      cameraId,
      isPlaceholder: true,
    });

    return { success: true, hlsUrl };
  }
  /**
   * Stop HLS stream for a camera
   */
  async stopHLSStream(cameraId, userId) {
    const streamKey = cameraId;

    if (!this.activeStreams.has(streamKey)) {
      return { success: true, message: "Already stopped", cameraId };
    }

    const streamInfo = this.activeStreams.get(streamKey);

    // Kill FFmpeg
    try {
      if (
        streamInfo?.command &&
        typeof streamInfo.command.kill === "function"
      ) {
        streamInfo.command.kill("SIGTERM");
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (streamInfo.command.exitCode === null) {
          streamInfo.command.kill("SIGKILL");
        }
      }
    } catch (error) {
      console.error("Error killing FFmpeg:", error);
    }

    this.activeStreams.delete(streamKey);

    // Clean HLS directory
    try {
      const hlsDir = path.join(this.hlsBasePath, cameraId);
      if (fs.existsSync(hlsDir)) {
        const files = fs.readdirSync(hlsDir);
        for (const file of files) {
          fs.unlinkSync(path.join(hlsDir, file));
        }
      }
    } catch (e) {}

    await Camera.findByIdAndUpdate(cameraId, {
      streamStatus: "stopped",
      streamingEnabled: false,
    });

    return { success: true, message: "Stopped", cameraId };
  }
  /**
   * Restart HLS stream
   */
  async restartHLSStream(cameraId, userId) {
    await this.stopHLSStream(cameraId, userId);
    return await this.startHLSStream(cameraId, userId);
  }

  /**
   * Delete HLS files for a camera
   */
  async deleteHLSFiles(cameraId) {
    const hlsDir = path.join(this.hlsBasePath, cameraId);

    if (fs.existsSync(hlsDir)) {
      try {
        // Delete all files in the directory
        const files = await fs.promises.readdir(hlsDir);
        for (const file of files) {
          await fs.promises.unlink(path.join(hlsDir, file));
        }
        // Delete the directory
        await fs.promises.rmdir(hlsDir);
        return { success: true, message: "HLS files deleted" };
      } catch (error) {
        console.error("Error deleting HLS files:", error);
        return { success: false, message: error.message };
      }
    }

    return { success: true, message: "No HLS files to delete" };
  }

  /**
   * Get stream info
   */
  async getStreamInfo(cameraId, userId, userRole) {
    const camera = await Camera.findById(cameraId);
    if (!camera) {
      throw new AppError("Camera not found", 404);
    }

    // Check access
    if (
      userRole !== "admin" &&
      camera.createdBy.toString() !== userId.toString()
    ) {
      throw new AppError("You do not have permission to view this stream", 403);
    }

    const streamKey = cameraId;
    const streamInfo = this.activeStreams.get(streamKey);

    return {
      cameraId,
      cameraName: camera.name,
      isStreaming: !!streamInfo,
      hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
      streamStatus: camera.streamStatus,
      startTime: streamInfo?.startTime || null,
      clients: streamInfo?.clients || 0,
      status: camera.status,
    };
  }

  /**
   * Get all active streams
   */
  async getActiveStreams(userId, userRole) {
    const activeStreams = [];

    for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
      const camera = await Camera.findById(cameraId);
      if (!camera) continue;

      // Check access
      if (
        userRole !== "admin" &&
        camera.createdBy.toString() !== userId.toString()
      ) {
        continue;
      }

      activeStreams.push({
        cameraId,
        cameraName: camera.name,
        hlsUrl: streamInfo.hlsUrl,
        startTime: streamInfo.startTime,
        clients: streamInfo.clients,
        status: camera.status,
      });
    }

    return activeStreams;
  }

  /**
   * Get stream URL for client (with client tracking)
   */
  async getStreamUrl(cameraId, userId, userRole, clientId) {
    const streamInfo = await this.getStreamInfo(cameraId, userId, userRole);

    if (!streamInfo.isStreaming) {
      // Try to start stream if camera is active
      const camera = await Camera.findById(cameraId);
      if (camera && camera.status === "active") {
        await this.startHLSStream(cameraId, camera.createdBy.toString());
        // Get updated stream info
        return await this.getStreamInfo(cameraId, userId, userRole);
      } else {
        throw new AppError("Stream is not available", 404);
      }
    }

    // Track client connection
    const streamKey = cameraId;
    if (this.activeStreams.has(streamKey)) {
      const stream = this.activeStreams.get(streamKey);
      if (clientId) {
        if (!this.streamClients.has(clientId)) {
          this.streamClients.set(clientId, {
            cameraId,
            connectedAt: new Date(),
          });
        }
        stream.clients = this.streamClients.size;
      }
    }

    return streamInfo;
  }

  /**
   * Client disconnected from stream
   */
  async clientDisconnected(clientId) {
    if (this.streamClients.has(clientId)) {
      const client = this.streamClients.get(clientId);
      this.streamClients.delete(clientId);

      // Update client count for the camera
      const streamKey = client.cameraId;
      if (this.activeStreams.has(streamKey)) {
        const stream = this.activeStreams.get(streamKey);
        stream.clients = Math.max(0, stream.clients - 1);

        // If no clients, we could stop the stream after a timeout
        // But we'll keep it running for better experience
        // You can implement a timeout if needed
      }
    }
  }

  /**
   * Clean up inactive streams (call periodically)
   */
  async cleanupInactiveStreams() {
    // This could be called by a cron job to clean up streams
    // that have been inactive for too long
    const now = Date.now();
    const MAX_STREAM_IDLE_TIME = 5 * 60 * 1000; // 5 minutes

    for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
      // If no clients and stream has been running for more than MAX_STREAM_IDLE_TIME
      if (streamInfo.clients === 0) {
        const uptime = now - streamInfo.startTime.getTime();
        if (uptime > MAX_STREAM_IDLE_TIME) {
          console.log(`Cleaning up idle stream for camera ${cameraId}`);
          await this.stopHLSStream(cameraId, "system");
        }
      }
    }
  }

  /**
   * Get stream status for dashboard
   */
  async getStreamDashboardStats(userId, userRole) {
    const filter = userRole === "admin" ? {} : { createdBy: userId };

    const [totalCameras, streamingCameras, activeStreams, totalClients] =
      await Promise.all([
        Camera.countDocuments(filter),
        Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
        this.getActiveStreams(userId, userRole).then(
          (streams) => streams.length,
        ),
        Promise.resolve(this.streamClients.size),
      ]);

    return {
      totalCameras,
      streamingCameras,
      activeStreams,
      totalClients,
      streamingPercentage:
        totalCameras > 0
          ? Math.round((streamingCameras / totalCameras) * 100)
          : 0,
    };
  }
}

export const cameraService = new CameraService();























// import Camera from "../models/camera.model.js";
// import Category from "../models/category.model.js";
// import SubCategory from "../models/subCategory.model.js";
// import NestedSubCategory from "../models/nestedSubCategory.model.js";
// import AppError from "../utils/AppError.js";
// import { exec } from "child_process";
// import mongoose from "mongoose";
// import ffmpeg from "fluent-ffmpeg";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ==================== FFMPEG INITIALIZATION ====================
// // Use system FFmpeg instead of ffmpeg-static
// const SYSTEM_FFMPEG_PATHS = [
//   '/usr/local/bin/ffmpeg',      // Intel Mac
//   '/opt/homebrew/bin/ffmpeg',   // Apple Silicon Mac
//   '/usr/bin/ffmpeg',            // Linux
//   '/usr/local/bin/ffmpeg',      // Linux fallback
// ];

// let ffmpegInitialized = false;

// const initializeFFmpeg = async() => {
//   try {
//     // Try system FFmpeg first
//     let ffmpegPath = null;
    
//     for (const sysPath of SYSTEM_FFMPEG_PATHS) {
//       if (fs.existsSync(sysPath)) {
//         ffmpegPath = sysPath;
//         break;
//       }
//     }
    
//     // Try which command
//     if (!ffmpegPath) {
//       try {
//         const whichPath = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
//         if (whichPath && fs.existsSync(whichPath)) {
//           ffmpegPath = whichPath;
//         }
//       } catch (_) {}
//     }
    
//     if (ffmpegPath) {
//       ffmpeg.setFfmpegPath(ffmpegPath);
//       console.log(`✅ FFmpeg initialized: ${ffmpegPath}`);
//       ffmpegInitialized = true;
//       return true;
//     }
    
//     // Try ffmpeg-static as last resort
//     try {
//       const ffmpegStatic = await import('ffmpeg-static');
//       const staticPath = ffmpegStatic.default || ffmpegStatic;
//       if (fs.existsSync(staticPath)) {
//         ffmpeg.setFfmpegPath(staticPath);
//         console.log(`⚠️ Using ffmpeg-static fallback: ${staticPath}`);
//         ffmpegInitialized = true;
//         return true;
//       }
//     } catch (_) {}
    
//     console.error('❌ FFmpeg not found! Please install FFmpeg.');
//     console.error('   macOS: brew install ffmpeg');
//     console.error('   Linux: sudo apt install ffmpeg');
//     ffmpegInitialized = false;
//     return false;
    
//   } catch (error) {
//     console.error('❌ FFmpeg initialization failed:', error.message);
//     ffmpegInitialized = false;
//     return false;
//   }
// };

// // Initialize FFmpeg
// initializeFFmpeg();

// // ==================== CAMERA SERVICE CLASS ====================
// class CameraService {
//   constructor() {
//     this.activeStreams = new Map();
//     this.streamClients = new Map();
//     this.streamingEnabled = process.env.STREAMING_ENABLED !== "false";
//     this.hlsBasePath = process.env.HLS_BASE_PATH || path.join(process.cwd(), "streams");
//     this.hlsPublicPath = process.env.HLS_PUBLIC_PATH || "/streams";
//     this.isInitialized = false;
//     this.healthMonitorInterval = null;

//     console.log("🔧 CameraService constructor called");
//     console.log(`📊 Streaming enabled: ${this.streamingEnabled}`);
//     console.log(`📁 HLS Base Path: ${this.hlsBasePath}`);
//     console.log(`🎬 FFmpeg available: ${ffmpegInitialized}`);

//     if (this.streamingEnabled) {
//       this.ensureHlsDirectory();
//       this.startHealthMonitor();
//     }
//   }

//   // ==================== UTILITY METHODS ====================
  
//   ensureHlsDirectory() {
//     try {
//       if (!fs.existsSync(this.hlsBasePath)) {
//         fs.mkdirSync(this.hlsBasePath, { recursive: true });
//         console.log(`✅ HLS directory created: ${this.hlsBasePath}`);
//       }
//     } catch (error) {
//       console.error("❌ Failed to create HLS directory:", error);
//     }
//   }

//   detectRTSPType(url) {
//     const types = [];
//     if (url.includes('?')) types.push('Query Params');
//     if (url.includes('@')) types.push('Auth Credentials');
//     if (url.match(/:\d+/)) types.push('Custom Port');
//     if (url.match(/\/\d+\/\d+/)) types.push('Channel/Stream Path');
//     if (url.includes('rtsp://')) types.push('Standard RTSP');
//     if (url.includes('rtsps://')) types.push('Secure RTSP');
//     return types.length > 0 ? types.join(' + ') : 'Standard RTSP';
//   }

//   async cleanupHLSFiles(cameraId) {
//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     if (!fs.existsSync(hlsDir)) return { success: true };

//     try {
//       const files = fs.readdirSync(hlsDir);
//       const now = Date.now();
//       let deletedCount = 0;

//       for (const file of files) {
//         const filePath = path.join(hlsDir, file);
//         const stats = fs.statSync(filePath);
//         const age = now - stats.mtimeMs;
//         if (age > 5 * 60 * 1000) {
//           fs.unlinkSync(filePath);
//           deletedCount++;
//         }
//       }

//       console.log(`🧹 Cleaned ${deletedCount} old HLS files for ${cameraId}`);
//       return { success: true, deletedCount };
//     } catch (error) {
//       console.error(`Cleanup error for ${cameraId}:`, error);
//       return { success: false, error: error.message };
//     }
//   }

//   async deleteHLSFiles(cameraId) {
//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     if (!fs.existsSync(hlsDir)) return { success: true };

//     try {
//       const files = await fs.promises.readdir(hlsDir);
//       for (const file of files) {
//         await fs.promises.unlink(path.join(hlsDir, file));
//       }
//       await fs.promises.rmdir(hlsDir);
//       return { success: true, message: "HLS files deleted" };
//     } catch (error) {
//       console.error("Error deleting HLS files:", error);
//       return { success: false, message: error.message };
//     }
//   }

//   async validateRTSPStream(rtspUrl) {
//     return new Promise((resolve) => {
//       const probeCommand = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of default=noprint_wrappers=1 "${rtspUrl}"`;

//       exec(probeCommand, { timeout: 10000 }, (error, stdout, stderr) => {
//         if (error) {
//           resolve({ isValid: false, error: error.message, stderr });
//           return;
//         }

//         if (stdout.includes("video")) {
//           resolve({ isValid: true, info: stdout });
//         } else {
//           resolve({ isValid: false, error: "No video stream found", stderr });
//         }
//       });
//     });
//   }

//   // ==================== HEALTH MONITOR ====================
  
//   startHealthMonitor() {
//     if (this.healthMonitorInterval) {
//       clearInterval(this.healthMonitorInterval);
//     }

//     this.healthMonitorInterval = setInterval(async () => {
//       try {
//         if (!this.activeStreams) return;

//         const now = Date.now();
//         let restartedCount = 0;

//         for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
//           let needsRestart = false;
//           let reason = "";

//           // Check: No frames received recently
//           const lastFrame = streamInfo?.lastFrameTimestamp || 0;
//           if (now - lastFrame > 20000) {
//             needsRestart = true;
//             reason = "No frames for 20+ seconds";
//           }

//           // Check: FFmpeg process dead
//           if (streamInfo?.command && streamInfo.command.exitCode !== null) {
//             needsRestart = true;
//             reason = `FFmpeg exited with code ${streamInfo.command.exitCode}`;
//           }

//           // Check: Started but no frames ever
//           if (streamInfo?.startTime && !streamInfo?.lastFrameTimestamp) {
//             const elapsed = now - streamInfo.startTime.getTime();
//             if (elapsed > 30000) {
//               needsRestart = true;
//               reason = "No frames received after 30 seconds";
//             }
//           }

//           if (needsRestart) {
//             console.log(`🔄 Auto-recovery: ${cameraId} - ${reason}`);
//             restartedCount++;

//             try {
//               await this.stopHLSStream(cameraId, "system");
//               await new Promise(resolve => setTimeout(resolve, 1000));
//               await this.startHLSStream(cameraId, null, true);
//               console.log(`✅ Auto-recovery successful for ${cameraId}`);
//             } catch (error) {
//               console.error(`❌ Auto-recovery failed for ${cameraId}:`, error.message);
//             }
//           }
//         }

//         if (restartedCount > 0) {
//           console.log(`🔄 Health Monitor: Restarted ${restartedCount} stale streams`);
//         }
//       } catch (error) {
//         console.error("❌ Health monitor error:", error);
//       }
//     }, 30000);
//   }

//   stopHealthMonitor() {
//     if (this.healthMonitorInterval) {
//       clearInterval(this.healthMonitorInterval);
//       this.healthMonitorInterval = null;
//     }
//   }

//   // ==================== STREAM MANAGEMENT ====================

// // ==================== STREAM MANAGEMENT ====================

// async startHLSStream(cameraId, userId, isAutoRecovery = false) {
//   if (!ffmpegInitialized) {
//     throw new AppError("FFmpeg is not available. Please install FFmpeg.", 503);
//   }

//   const camera = await Camera.findById(cameraId);
//   if (!camera) throw new AppError("Camera not found", 404);

//   // Permission check
//   if (!isAutoRecovery && userId) {
//     if (camera.createdBy.toString() !== userId.toString()) {
//       throw new AppError("Permission denied", 403);
//     }
//   }

//   if (camera.status !== "active") {
//     throw new AppError(`Camera is ${camera.status}`, 400);
//   }

//   const streamKey = cameraId;

//   // Already streaming? Check freshness
//   if (this.activeStreams.has(streamKey)) {
//     const existing = this.activeStreams.get(streamKey);
//     const now = Date.now();
//     const isHealthy = existing.lastFrameTimestamp &&
//       (now - existing.lastFrameTimestamp) < 15000;

//     if (isHealthy) {
//       return { success: true, hlsUrl: existing.hlsUrl, cameraId };
//     } else {
//       await this.stopHLSStream(cameraId, "system");
//     }
//   }

//   // Clean HLS directory
//   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   if (fs.existsSync(hlsDir)) {
//     const files = fs.readdirSync(hlsDir);
//     for (const file of files) {
//       try { fs.unlinkSync(path.join(hlsDir, file)); } catch (_) {}
//     }
//   } else {
//     fs.mkdirSync(hlsDir, { recursive: true });
//   }

//   const timestamp = Date.now();
//   const outputPath = path.join(hlsDir, "index.m3u8");
//   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;
  
//   // ✅ FIX: URL ko properly escape karo
//   const rtspUrl = camera.rtspUrl;
//   // URL mein special characters ko escape karo
//   const escapedUrl = rtspUrl.replace(/'/g, "'\\''").replace(/"/g, '\\"');

//   console.log(`🎥 Starting stream for ${cameraId}`);
//   console.log(`📡 RTSP URL: ${rtspUrl}`);
//   console.log(`🔍 URL Type: ${this.detectRTSPType(rtspUrl)}`);

//   // ✅ FIX: Input options - reconnect options sahi se pass karo
//   const inputOptions = [
//     '-rtsp_transport', 'tcp',
//     '-rtsp_flags', 'prefer_tcp',
//     '-user_agent', 'FFmpeg/5.0',
//     '-fflags', 'nobuffer+discardcorrupt+fastseek',
//     '-flags', 'low_delay',
//     '-analyzeduration', '0',
//     '-probesize', '32',
//     '-buffer_size', '1024000',
//     '-max_delay', '500000',
//     '-reorder_queue_size', '4096',
//     '-err_detect', 'ignore_err',
//     '-strict', 'unofficial',
//     // ✅ RECONNECT OPTIONS - Directly as strings
//     '-reconnect', '1',
//     '-reconnect_at_eof', '1',
//     '-reconnect_streamed', '1',
//     '-reconnect_delay_max', '5',
//     '-timeout', '10000000',
//     '-allowed_media_types', 'video+audio',
//   ];

//   // ✅ Output options
//   const outputOptions = [
//     '-c:v', 'libx264',
//     '-preset', 'veryfast',
//     '-tune', 'zerolatency',
//     '-crf', '23',
//     '-maxrate', '2000k',
//     '-bufsize', '4000k',
//     '-pix_fmt', 'yuv420p',
//     '-vf', 'format=yuv420p',
//     '-g', '60',
//     '-keyint_min', '60',
//     '-c:a', 'aac',
//     '-b:a', '128k',
//     '-ar', '44100',
//     '-ac', '1',
//     '-hls_time', '2',
//     '-hls_list_size', '4',
//     '-hls_flags', 'delete_segments+discont_start+program_date_time',
//     '-hls_allow_cache', '0',
//     '-hls_start_number_source', 'epoch',
//     '-hls_segment_filename', path.join(hlsDir, `segment_%03d.ts`),
//     '-f', 'hls',
//     '-xerror', '0',
//   ];

//   // ✅ Build command with escaped URL
//   const command = ffmpeg(escapedUrl)
//     .inputOptions(inputOptions)
//     .outputOptions(outputOptions)
//     .output(outputPath);

//   let frameCount = 0;
//   let hasReceivedFrame = false;
//   let firstFrameTime = null;

//   command.on('start', (cmd) => {
//     console.log(`✅ FFmpeg started for ${cameraId}`);
//     // Log first 200 chars of command for debugging
//     console.log(`📝 Command: ${cmd.substring(0, 200)}...`);
    
//     Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: 'connecting',
//       lastPingAt: new Date(),
//     }).catch(() => {});
//   });

//   command.on('progress', (progress) => {
//     if (progress.frames > 0) {
//       hasReceivedFrame = true;
//       const now = Date.now();
//       if (!firstFrameTime) firstFrameTime = now;

//       const streamInfo = this.activeStreams.get(streamKey);
//       if (streamInfo) {
//         streamInfo.lastFrameTimestamp = now;
//       }

//       frameCount++;
//       if (frameCount % 30 === 0) {
//         const fps = frameCount / ((now - firstFrameTime) / 1000);
//         console.log(`📊 ${cameraId}: ${progress.frames} frames, ${fps.toFixed(1)} fps`);
//       }

//       Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: 'streaming',
//         lastPingAt: new Date(),
//         lastHealthyAt: new Date(now),
//       }).catch(() => {});
//     }
//   });

//   command.on('stderr', (line) => {
//     // ✅ Only log important lines
//     if (line.includes('Error') || line.includes('Invalid') ||
//         line.includes('failed') || line.includes('Could not') ||
//         line.includes('reconnect')) {
//       console.log(`FFmpeg ${cameraId} stderr:`, line);
//     }
//   });

//   command.on('error', async (err) => {
//     console.error(`❌ ${cameraId} error:`, err.message);

//     this.activeStreams.delete(streamKey);

//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: 'error',
//       lastError: err.message,
//       lastErrorAt: new Date(),
//     });

//     // ✅ Auto-retry without reconnect options
//     const errorMsg = err.message.toLowerCase();
    
//     if (errorMsg.includes('reconnect')) {
//       console.log(`🔄 ${cameraId}: Reconnect error, trying without reconnect options...`);
//       setTimeout(() => {
//         this.startHLSStreamWithoutReconnect(cameraId, userId).catch(() => {});
//       }, 3000);
//     } else if (errorMsg.includes('tcp') || errorMsg.includes('connection')) {
//       console.log(`🔄 ${cameraId}: Trying UDP transport...`);
//       setTimeout(() => {
//         this.startHLSStreamWithTransport(cameraId, userId, 'udp').catch(() => {});
//       }, 3000);
//     } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
//       console.log(`🔄 ${cameraId}: RTSP 404 - Retrying in 30s`);
//       setTimeout(() => {
//         this.startHLSStream(cameraId, userId, true).catch(() => {});
//       }, 30000);
//     } else {
//       console.log(`🔄 ${cameraId}: Retrying in 10s...`);
//       setTimeout(() => {
//         this.startHLSStream(cameraId, userId, true).catch(() => {});
//       }, 10000);
//     }
//   });

//   command.on('end', async () => {
//     console.log(`⏹️ ${cameraId} ended`);

//     if (this.activeStreams.get(streamKey)?.command === command) {
//       this.activeStreams.delete(streamKey);
//     }

//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: hasReceivedFrame ? 'stopped' : 'offline',
//     });
//   });

//   // ✅ Start the stream
//   command.run();

//   // Store stream info
//   this.activeStreams.set(streamKey, {
//     command,
//     hlsUrl,
//     hlsDir,
//     outputPath,
//     startTime: new Date(),
//     clients: 0,
//     cameraId,
//     lastFrameTimestamp: null,
//     transport: 'tcp',
//   });

//   await Camera.findByIdAndUpdate(cameraId, {
//     streamStatus: 'connecting',
//     hlsUrl,
//     streamingEnabled: true,
//   });

//   return {
//     success: true,
//     message: 'Stream started',
//     hlsUrl,
//     cameraId,
//   };
// }

// // ✅ NEW: Start stream without reconnect options
// async startHLSStreamWithoutReconnect(cameraId, userId) {
//   console.log(`🔄 Starting stream without reconnect for ${cameraId}`);
  
//   const camera = await Camera.findById(cameraId);
//   if (!camera) return;

//   const streamKey = cameraId;
//   if (this.activeStreams.has(streamKey)) {
//     await this.stopHLSStream(cameraId, "system");
//   }

//   const hlsDir = path.join(this.hlsBasePath, cameraId);
//   if (!fs.existsSync(hlsDir)) {
//     fs.mkdirSync(hlsDir, { recursive: true });
//   }

//   const outputPath = path.join(hlsDir, "index.m3u8");
//   const timestamp = Date.now();
//   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;
  
//   // ✅ WITHOUT RECONNECT OPTIONS
//   const inputOptions = [
//     '-rtsp_transport', 'tcp',
//     '-rtsp_flags', 'prefer_tcp',
//     '-user_agent', 'FFmpeg/5.0',
//     '-fflags', 'nobuffer+discardcorrupt',
//     '-flags', 'low_delay',
//     '-analyzeduration', '0',
//     '-probesize', '32',
//     '-buffer_size', '1024000',
//     '-max_delay', '500000',
//     '-err_detect', 'ignore_err',
//     '-strict', 'unofficial',
//     '-timeout', '10000000',
//     '-allowed_media_types', 'video+audio',
//   ];

//   const outputOptions = [
//     '-c:v', 'libx264',
//     '-preset', 'veryfast',
//     '-tune', 'zerolatency',
//     '-crf', '23',
//     '-maxrate', '2000k',
//     '-bufsize', '4000k',
//     '-pix_fmt', 'yuv420p',
//     '-vf', 'format=yuv420p',
//     '-g', '60',
//     '-keyint_min', '60',
//     '-c:a', 'aac',
//     '-b:a', '128k',
//     '-ar', '44100',
//     '-ac', '1',
//     '-hls_time', '2',
//     '-hls_list_size', '4',
//     '-hls_flags', 'delete_segments+discont_start',
//     '-hls_allow_cache', '0',
//     '-hls_start_number_source', 'epoch',
//     '-hls_segment_filename', path.join(hlsDir, `segment_%03d.ts`),
//     '-f', 'hls',
//     '-xerror', '0',
//   ];

//   const command = ffmpeg(camera.rtspUrl)
//     .inputOptions(inputOptions)
//     .outputOptions(outputOptions)
//     .output(outputPath);

//   let hasReceivedFrame = false;

//   command.on('start', () => {
//     console.log(`✅ FFmpeg started for ${cameraId} (without reconnect)`);
//   });

//   command.on('progress', (progress) => {
//     if (progress.frames > 0) {
//       hasReceivedFrame = true;
//       const streamInfo = this.activeStreams.get(streamKey);
//       if (streamInfo) {
//         streamInfo.lastFrameTimestamp = Date.now();
//       }
//       Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: 'streaming',
//         lastPingAt: new Date(),
//         lastHealthyAt: new Date(),
//       }).catch(() => {});
//     }
//   });

//   command.on('error', async (err) => {
//     console.error(`❌ ${cameraId} error (without reconnect):`, err.message);
//     this.activeStreams.delete(streamKey);
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: 'error',
//       lastError: err.message,
//       lastErrorAt: new Date(),
//     });
//   });

//   command.on('end', async () => {
//     this.activeStreams.delete(streamKey);
//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: hasReceivedFrame ? 'stopped' : 'offline',
//     });
//   });

//   command.run();

//   this.activeStreams.set(streamKey, {
//     command,
//     hlsUrl,
//     hlsDir,
//     startTime: new Date(),
//     clients: 0,
//     cameraId,
//     transport: 'tcp-no-reconnect',
//   });

//   return { success: true, hlsUrl, cameraId };
// }

//   async startHLSStreamWithTransport(cameraId, userId, transport) {
//     console.log(`🔄 Starting ${transport} transport for ${cameraId}`);

//     const camera = await Camera.findById(cameraId);
//     if (!camera) return;

//     const streamKey = cameraId;
//     if (this.activeStreams.has(streamKey)) {
//       await this.stopHLSStream(cameraId, "system");
//     }

//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     if (!fs.existsSync(hlsDir)) {
//       fs.mkdirSync(hlsDir, { recursive: true });
//     }

//     const outputPath = path.join(hlsDir, "index.m3u8");
//     const timestamp = Date.now();
//     const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8?t=${timestamp}`;
//     const rtspUrl = camera.rtspUrl;

//     // Transport-specific options
//     let inputOptions = [
//       "-rtsp_transport", transport,
//       "-rtsp_flags", "prefer_tcp",
//       "-fflags", "nobuffer+discardcorrupt",
//       "-flags", "low_delay",
//       "-analyzeduration", "0",
//       "-probesize", "32",
//       "-err_detect", "ignore_err",
//       "-strict", "unofficial",
//     ];

//     if (transport === "http") {
//       inputOptions = [
//         "-rtsp_transport", "http",
//         "-rtsp_flags", "prefer_tcp",
//         "-fflags", "nobuffer",
//         "-flags", "low_delay",
//         "-analyzeduration", "0",
//         "-probesize", "32",
//         "-err_detect", "ignore_err",
//       ];
//     }

//     const command = ffmpeg(rtspUrl)
//       .inputOptions(inputOptions)
//       .outputOptions([
//         "-c:v", "libx264",
//         "-preset", "veryfast",
//         "-tune", "zerolatency",
//         "-crf", "23",
//         "-pix_fmt", "yuv420p",
//         "-c:a", "aac",
//         "-b:a", "128k",
//         "-hls_time", "2",
//         "-hls_list_size", "4",
//         "-hls_flags", "delete_segments+discont_start",
//         "-hls_allow_cache", "0",
//         "-hls_start_number_source", "epoch",
//         "-hls_segment_filename", path.join(hlsDir, `segment_%03d.ts`),
//         "-f", "hls",
//         "-xerror", "0",
//       ])
//       .output(outputPath);

//     let hasReceivedFrame = false;

//     command.on("start", () => {
//       console.log(`✅ ${transport.toUpperCase()} stream started for ${cameraId}`);
//     });

//     command.on("progress", (progress) => {
//       if (progress.frames > 0) {
//         hasReceivedFrame = true;
//         const streamInfo = this.activeStreams.get(streamKey);
//         if (streamInfo) {
//           streamInfo.lastFrameTimestamp = Date.now();
//         }
//         Camera.findByIdAndUpdate(cameraId, {
//           streamStatus: "streaming",
//           lastPingAt: new Date(),
//           lastHealthyAt: new Date(),
//         }).catch(() => {});
//       }
//     });

//     command.on("error", async (err) => {
//       console.error(`❌ ${transport} failed for ${cameraId}:`, err.message);
//       this.activeStreams.delete(streamKey);
//       await Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: "error",
//         lastError: err.message,
//         lastErrorAt: new Date(),
//       });
//     });

//     command.on("end", async () => {
//       this.activeStreams.delete(streamKey);
//       await Camera.findByIdAndUpdate(cameraId, {
//         streamStatus: hasReceivedFrame ? "stopped" : "offline",
//       });
//     });

//     command.run();

//     this.activeStreams.set(streamKey, {
//       command,
//       hlsUrl,
//       hlsDir,
//       startTime: new Date(),
//       clients: 0,
//       cameraId,
//       transport: transport,
//     });

//     return { success: true, hlsUrl, cameraId };
//   }

//   async stopHLSStream(cameraId, userId) {
//     const streamKey = cameraId;

//     if (!this.activeStreams.has(streamKey)) {
//       return { success: true, message: "Already stopped", cameraId };
//     }

//     const streamInfo = this.activeStreams.get(streamKey);

//     try {
//       if (streamInfo?.command && typeof streamInfo.command.kill === "function") {
//         streamInfo.command.kill("SIGTERM");
//         await new Promise((resolve) => setTimeout(resolve, 200));
//         if (streamInfo.command.exitCode === null) {
//           streamInfo.command.kill("SIGKILL");
//         }
//       }
//     } catch (error) {
//       console.error("Error killing FFmpeg:", error);
//     }

//     this.activeStreams.delete(streamKey);

//     // Clean HLS directory
//     try {
//       const hlsDir = path.join(this.hlsBasePath, cameraId);
//       if (fs.existsSync(hlsDir)) {
//         const files = fs.readdirSync(hlsDir);
//         for (const file of files) {
//           fs.unlinkSync(path.join(hlsDir, file));
//         }
//       }
//     } catch (_) {}

//     await Camera.findByIdAndUpdate(cameraId, {
//       streamStatus: "stopped",
//       streamingEnabled: false,
//     });

//     return { success: true, message: "Stopped", cameraId };
//   }

//   async restartHLSStream(cameraId, userId) {
//     await this.stopHLSStream(cameraId, userId);
//     return await this.startHLSStream(cameraId, userId);
//   }

//   // ==================== STREAM INFO METHODS ====================

//   async getStreamInfo(cameraId, userId, userRole) {
//     const camera = await Camera.findById(cameraId);
//     if (!camera) throw new AppError("Camera not found", 404);

//     if (userRole !== "admin" && camera.createdBy.toString() !== userId.toString()) {
//       throw new AppError("You do not have permission to view this stream", 403);
//     }

//     const streamKey = cameraId;
//     const streamInfo = this.activeStreams.get(streamKey);

//     return {
//       cameraId,
//       cameraName: camera.name,
//       isStreaming: !!streamInfo,
//       hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//       streamStatus: camera.streamStatus,
//       startTime: streamInfo?.startTime || null,
//       clients: streamInfo?.clients || 0,
//       status: camera.status,
//     };
//   }

//   async getActiveStreams(userId, userRole) {
//     const activeStreams = [];

//     for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
//       const camera = await Camera.findById(cameraId);
//       if (!camera) continue;

//       if (userRole !== "admin" && camera.createdBy.toString() !== userId.toString()) {
//         continue;
//       }

//       activeStreams.push({
//         cameraId,
//         cameraName: camera.name,
//         hlsUrl: streamInfo.hlsUrl,
//         startTime: streamInfo.startTime,
//         clients: streamInfo.clients,
//         status: camera.status,
//       });
//     }

//     return activeStreams;
//   }

//   async getStreamUrl(cameraId, userId, userRole, clientId) {
//     const streamInfo = await this.getStreamInfo(cameraId, userId, userRole);

//     if (!streamInfo.isStreaming) {
//       const camera = await Camera.findById(cameraId);
//       if (camera && camera.status === "active") {
//         await this.startHLSStream(cameraId, camera.createdBy.toString());
//         return await this.getStreamInfo(cameraId, userId, userRole);
//       } else {
//         throw new AppError("Stream is not available", 404);
//       }
//     }

//     const streamKey = cameraId;
//     if (this.activeStreams.has(streamKey)) {
//       const stream = this.activeStreams.get(streamKey);
//       if (clientId) {
//         if (!this.streamClients.has(clientId)) {
//           this.streamClients.set(clientId, {
//             cameraId,
//             connectedAt: new Date(),
//           });
//         }
//         stream.clients = this.streamClients.size;
//       }
//     }

//     return streamInfo;
//   }

//   async clientDisconnected(clientId) {
//     if (this.streamClients.has(clientId)) {
//       const client = this.streamClients.get(clientId);
//       this.streamClients.delete(clientId);

//       const streamKey = client.cameraId;
//       if (this.activeStreams.has(streamKey)) {
//         const stream = this.activeStreams.get(streamKey);
//         stream.clients = Math.max(0, stream.clients - 1);
//       }
//     }
//   }

//   async getStreamDashboardStats(userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const [totalCameras, streamingCameras, activeStreamsCount] = await Promise.all([
//       Camera.countDocuments(filter),
//       Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
//       Promise.resolve(this.activeStreams.size),
//     ]);

//     let totalClients = 0;
//     try {
//       totalClients = this.streamClients.size || 0;
//     } catch (_) {
//       totalClients = 0;
//     }

//     return {
//       totalCameras,
//       streamingCameras,
//       activeStreams: activeStreamsCount,
//       totalClients,
//       streamingPercentage: totalCameras > 0 ? Math.round((streamingCameras / totalCameras) * 100) : 0,
//     };
//   }

//   // ==================== CRUD OPERATIONS ====================

//   async createCamera(data, userId) {
//     // Verify main category exists
//     const mainCategory = await Category.findById(data.mainCategoryId);
//     if (!mainCategory) {
//       throw new AppError("Main category not found", 404);
//     }

//     if (mainCategory.createdBy.toString() !== userId.toString()) {
//       throw new AppError("You do not have permission to use this main category", 403);
//     }

//     // If sub category provided, verify it
//     if (data.subCategoryId) {
//       const subCategory = await SubCategory.findById(data.subCategoryId);
//       if (!subCategory) {
//         throw new AppError("Sub category not found", 404);
//       }
//       if (subCategory.mainCategoryId.toString() !== data.mainCategoryId) {
//         throw new AppError("Sub category does not belong to the selected main category", 400);
//       }
//       if (subCategory.createdBy.toString() !== userId.toString()) {
//         throw new AppError("You do not have permission to use this sub category", 403);
//       }
//     }

//     // If nested sub category provided, verify it
//     if (data.subSubCategoryId) {
//       if (!data.subCategoryId) {
//         throw new AppError("Sub category is required when selecting nested sub category", 400);
//       }
//       const nestedSubCategory = await NestedSubCategory.findById(data.subSubCategoryId);
//       if (!nestedSubCategory) {
//         throw new AppError("Nested sub category not found", 404);
//       }
//       if (nestedSubCategory.subCategoryId.toString() !== data.subCategoryId) {
//         throw new AppError("Nested sub category does not belong to the selected sub category", 400);
//       }
//       if (nestedSubCategory.mainCategoryId.toString() !== data.mainCategoryId) {
//         throw new AppError("Nested sub category does not belong to the selected main category", 400);
//       }
//       if (nestedSubCategory.createdBy.toString() !== userId.toString()) {
//         throw new AppError("You do not have permission to use this nested sub category", 403);
//       }
//     }

//     // Check for duplicate camera name
//     const existingCamera = await Camera.findOne({
//       name: data.name,
//       createdBy: userId,
//     });
//     if (existingCamera) {
//       throw new AppError("You already have a camera with this name", 400);
//     }

//     // Create camera
//     const camera = await Camera.create({
//       name: data.name,
//       rtspUrl: data.rtspUrl,
//       mainCategoryId: data.mainCategoryId,
//       subCategoryId: data.subCategoryId || null,
//       subSubCategoryId: data.subSubCategoryId || null,
//       status: data.status || "active",
//       location: data.location || "",
//       description: data.description || "",
//       thumbnail: data.thumbnail || "",
//       streamSettings: data.streamSettings || {
//         protocol: "rtsp",
//         port: 554,
//         transport: "tcp",
//         latency: 200,
//         fps: 25,
//         resolution: "1920x1080",
//       },
//       createdBy: userId,
//       updatedBy: userId,
//       streamingEnabled: data.streamingEnabled !== undefined ? data.streamingEnabled : true,
//       hlsUrl: null,
//       streamStatus: "online",
//     });

//     await camera.populate([
//       { path: "mainCategoryId", select: "name" },
//       { path: "subCategoryId", select: "name" },
//       { path: "subSubCategoryId", select: "name" },
//       { path: "createdBy", select: "fullName email" },
//       { path: "updatedBy", select: "fullName email" },
//     ]);

//     // Start HLS stream if enabled
//     if (this.streamingEnabled && data.autoStartStream !== false) {
//       try {
//         await this.startHLSStream(camera._id.toString(), userId);
//       } catch (error) {
//         console.log("Failed to auto-start stream:", error.message);
//       }
//     }

//     return camera;
//   }

//   async getAllCameras(query, userId, userRole) {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       status,
//       streamStatus,
//       mainCategoryId,
//       subCategoryId,
//       subSubCategoryId,
//       search,
//       fromDate,
//       toDate,
//     } = query;

//     const filter = {};

//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     if (status && status !== "all") {
//       filter.status = status;
//     }

//     if (streamStatus && streamStatus !== "all") {
//       filter.streamStatus = streamStatus;
//     }

//     if (mainCategoryId) {
//       filter.mainCategoryId = mainCategoryId;
//     }

//     if (subCategoryId) {
//       filter.subCategoryId = subCategoryId;
//     }

//     if (subSubCategoryId) {
//       filter.subSubCategoryId = subSubCategoryId;
//     }

//     if (fromDate || toDate) {
//       filter.createdAt = {};
//       if (fromDate) filter.createdAt.$gte = new Date(fromDate);
//       if (toDate) filter.createdAt.$lte = new Date(toDate);
//     }

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { location: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     const sort = {};
//     sort[sortBy] = sortOrder === "desc" ? -1 : 1;

//     const skip = (page - 1) * limit;
//     const limitNum = parseInt(limit);
//     const pageNum = parseInt(page);

//     const [cameras, total] = await Promise.all([
//       Camera.find(filter)
//         .populate("mainCategoryId", "name")
//         .populate("subCategoryId", "name")
//         .populate("subSubCategoryId", "name")
//         .populate("createdBy", "fullName email")
//         .populate("updatedBy", "fullName email")
//         .sort(sort)
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Camera.countDocuments(filter),
//     ]);

//     const camerasWithPath = await Promise.all(
//       cameras.map(async (camera) => {
//         const path = await this.getFullPath(camera._id);
//         const streamInfo = this.activeStreams.get(camera._id.toString());
//         return {
//           ...camera,
//           fullPath: path,
//           isStreaming: !!streamInfo,
//           hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//           streamClients: streamInfo?.clients || 0,
//         };
//       }),
//     );

//     return {
//       cameras: camerasWithPath,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum),
//       },
//     };
//   }

//   async getCameraById(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id)
//       .populate("mainCategoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("subSubCategoryId", "name")
//       .populate("createdBy", "fullName email")
//       .populate("updatedBy", "fullName email");

//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     if (userRole !== "admin" && camera.createdBy._id.toString() !== userId.toString()) {
//       throw new AppError("You do not have permission to view this camera", 403);
//     }

//     const fullPath = await this.getFullPath(id);
//     const streamInfo = this.activeStreams.get(id);

//     return {
//       ...camera.toObject(),
//       fullPath,
//       isStreaming: !!streamInfo,
//       hlsUrl: streamInfo?.hlsUrl || camera.hlsUrl || null,
//       streamClients: streamInfo?.clients || 0,
//     };
//   }

//   async getFullPath(id) {
//     const camera = await Camera.findById(id);
//     if (!camera) return [];

//     const path = [];

//     const mainCategory = await Category.findById(camera.mainCategoryId);
//     if (mainCategory) {
//       path.push({
//         type: "category",
//         id: mainCategory._id,
//         name: mainCategory.name,
//       });
//     }

//     if (camera.subCategoryId) {
//       const subCategory = await SubCategory.findById(camera.subCategoryId);
//       if (subCategory) {
//         path.push({
//           type: "subCategory",
//           id: subCategory._id,
//           name: subCategory.name,
//         });
//       }
//     }

//     if (camera.subSubCategoryId) {
//       const nestedSubCategory = await NestedSubCategory.findById(camera.subSubCategoryId);
//       if (nestedSubCategory) {
//         path.push({
//           type: "nested",
//           id: nestedSubCategory._id,
//           name: nestedSubCategory.name,
//         });
//       }
//     }

//     path.push({
//       type: "camera",
//       id: camera._id,
//       name: camera.name,
//     });

//     return path;
//   }

//   async updateCamera(id, updateData, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);
//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError("You do not have permission to update this camera", 403);
//     }

//     // Check duplicate name
//     if (updateData.name && updateData.name !== camera.name) {
//       const existingCamera = await Camera.findOne({
//         name: updateData.name,
//         createdBy: userId,
//         _id: { $ne: id },
//       });
//       if (existingCamera) {
//         throw new AppError("You already have a camera with this name", 400);
//       }
//     }

//     // If streaming disabled, stop the stream
//     if (updateData.streamingEnabled === false && camera.streamingEnabled === true) {
//       await this.stopHLSStream(id, userId);
//     }

//     Object.assign(camera, updateData);
//     camera.updatedBy = userId;
//     await camera.save();

//     // Restart stream if RTSP URL changed
//     if (updateData.rtspUrl && updateData.rtspUrl !== camera.rtspUrl) {
//       if (camera.streamingEnabled) {
//         await this.restartHLSStream(id, userId);
//       }
//     }

//     await camera.populate([
//       { path: "mainCategoryId", select: "name" },
//       { path: "subCategoryId", select: "name" },
//       { path: "subSubCategoryId", select: "name" },
//       { path: "createdBy", select: "fullName email" },
//       { path: "updatedBy", select: "fullName email" },
//     ]);

//     return camera;
//   }

//   async deleteCamera(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);
//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError("You do not have permission to delete this camera", 403);
//     }

//     await this.stopHLSStream(id, userId);
//     await this.deleteHLSFiles(id);

//     await camera.deleteOne();

//     return {
//       message: "Camera deleted successfully",
//       deletedItem: {
//         id: camera._id,
//         name: camera.name,
//       },
//     };
//   }

//   async toggleStatus(id, userId, userRole) {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw new AppError("Invalid camera ID format", 400);
//     }

//     const camera = await Camera.findById(id);
//     if (!camera) {
//       throw new AppError("Camera not found", 404);
//     }

//     if (!camera.canModify(userId, userRole)) {
//       throw new AppError("You do not have permission to modify this camera", 403);
//     }

//     camera.status = camera.status === "inactive" ? "active" : "inactive";
//     camera.updatedBy = userId;
//     await camera.save();

//     if (camera.status === "inactive") {
//       camera.streamStatus = "stopped";
//       await this.stopHLSStream(id, userId);
//     }

//     return camera;
//   }

//   async bulkDelete(ids, userId, userRole) {
//     const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
//     if (invalidIds.length > 0) {
//       throw new AppError(`Invalid IDs: ${invalidIds.join(", ")}`, 400);
//     }

//     const filter = { _id: { $in: ids } };
//     if (userRole !== "admin") {
//       filter.createdBy = userId;
//     }

//     const items = await Camera.find(filter);
//     if (items.length === 0) {
//       throw new AppError("No cameras found", 404);
//     }

//     for (const item of items) {
//       if (!item.canModify(userId, userRole)) {
//         throw new AppError(`You do not have permission to delete "${item.name}"`, 403);
//       }
//     }

//     for (const item of items) {
//       await this.stopHLSStream(item._id.toString(), userId);
//       await this.deleteHLSFiles(item._id.toString());
//     }

//     const result = await Camera.deleteMany({ _id: { $in: ids } });

//     return {
//       deletedCount: result.deletedCount,
//       message: `${result.deletedCount} cameras deleted successfully`,
//     };
//   }

//   async getStats(userId, userRole) {
//     const filter = userRole === "admin" ? {} : { createdBy: userId };

//     const [
//       total,
//       active,
//       inactive,
//       maintenance,
//       online,
//       offline,
//       connecting,
//       unknown,
//       streaming,
//       byStatus,
//       byStreamStatus,
//       byMainCategory,
//     ] = await Promise.all([
//       Camera.countDocuments(filter),
//       Camera.countDocuments({ ...filter, status: "active" }),
//       Camera.countDocuments({ ...filter, status: "inactive" }),
//       Camera.countDocuments({ ...filter, status: "maintenance" }),
//       Camera.countDocuments({ ...filter, streamStatus: "online" }),
//       Camera.countDocuments({ ...filter, streamStatus: "offline" }),
//       Camera.countDocuments({ ...filter, streamStatus: "connecting" }),
//       Camera.countDocuments({ ...filter, streamStatus: "unknown" }),
//       Camera.countDocuments({ ...filter, streamStatus: "streaming" }),
//       Camera.aggregate([
//         { $match: filter },
//         { $group: { _id: "$status", count: { $sum: 1 } } },
//       ]),
//       Camera.aggregate([
//         { $match: filter },
//         { $group: { _id: "$streamStatus", count: { $sum: 1 } } },
//       ]),
//       Camera.aggregate([
//         { $match: filter },
//         { $group: { _id: "$mainCategoryId", count: { $sum: 1 } } },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "_id",
//             foreignField: "_id",
//             as: "category",
//           },
//         },
//         {
//           $project: {
//             categoryName: { $arrayElemAt: ["$category.name", 0] },
//             count: 1,
//           },
//         },
//         { $sort: { count: -1 } },
//         { $limit: 10 },
//       ]),
//     ]);

//     const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     const recentActivity = await Camera.countDocuments({
//       ...filter,
//       lastPingAt: { $gte: last24Hours },
//     });

//     return {
//       total,
//       active,
//       inactive,
//       maintenance,
//       online,
//       offline,
//       connecting,
//       unknown,
//       streaming,
//       activeStreams: this.activeStreams.size,
//       byStatus: byStatus.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
//       byStreamStatus: byStreamStatus.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
//       topCategories: byMainCategory,
//       recentActivity,
//     };
//   }

//   // ==================== CLEANUP ====================

//   async cleanup() {
//     console.log('🧹 Cleaning up all streams...');
//     this.stopHealthMonitor();
    
//     const promises = [];
//     for (const [cameraId] of this.activeStreams) {
//       promises.push(this.stopHLSStream(cameraId, "system"));
//     }
//     await Promise.all(promises);
//     console.log('✅ All streams cleaned up');
//   }
// }

// // ==================== EXPORT ====================
// export const cameraService = new CameraService();