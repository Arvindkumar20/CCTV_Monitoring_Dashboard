



// backend/services/socket.service.js
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";


let ioInstance = null;
// userId -> Set of socketIds
const userSockets = new Map();

export function initializeSocket(io) {
  ioInstance = io;

  // ✅ Auth middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId || decoded.id;
      socket.userRole = decoded.role || "user";
      socket.userType = decoded.type || "user";

      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    logger.info(`🔌 Socket connected: ${socket.id} (user=${userId})`);

    // Track
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // Personal room
    socket.join(`user:${userId}`);

    // Admin room
    if (socket.userRole === "admin") socket.join("admins");

    // Camera subscribe
    socket.on("subscribe:cameras", (cameraIds) => {
      if (Array.isArray(cameraIds)) {
        cameraIds.forEach((id) => socket.join(`camera:${id}`));
        logger.debug(`📌 ${socket.id} subscribed to ${cameraIds.length} cameras`);
      }
    });

    socket.on("unsubscribe:cameras", (cameraIds) => {
      if (Array.isArray(cameraIds)) {
        cameraIds.forEach((id) => socket.leave(`camera:${id}`));
      }
    });

    // Ack alert
    socket.on("alert:ack", (alertId) => {
      logger.info(`Alert ${alertId} acknowledged by ${userId}`);
      io.to(`user:${userId}`).emit("alert:acknowledged", { alertId });
    });

    socket.on("disconnect", (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} (${reason})`);
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(userId);
      }
    });
  });

  logger.info("✅ Socket.IO initialized");
  return io;
}

export function getIO() {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
}

/**
 * ✅ Emit to specific user
 */
export function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

/**
 * ✅ Emit to all admins
 */
export function emitToAdmins(event, payload) {
  if (!ioInstance) return;
  ioInstance.to("admins").emit(event, payload);
}

/**
 * ✅ Emit to camera subscribers
 */
export function emitToCamera(cameraId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`camera:${cameraId}`).emit(event, payload);
}

/**
 * ✅ Broadcast to all
 */
export function broadcast(event, payload) {
  if (!ioInstance) return;
  ioInstance.emit(event, payload);
}

/**
 * ✅ Check online
 */
export function isUserOnline(userId) {
  return userSockets.has(userId);
}

/**
 * ✅ Online count
 */
export function getOnlineCount() {
  return userSockets.size;
}