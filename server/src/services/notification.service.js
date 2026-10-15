// // import Notification from "../models/Notification.js";
// // import { emitToUser, emitToAdmins } from "./socket.service.js";
// // import logger from "../config/logger.js";

// import logger from "../config/logger.js";
// import Notification from "../models/Notification.js";
// import { emitToAdmins, emitToUser } from "./socket.service.js";

// class NotificationService {
//   /**
//    * In-app notification create karo aur Socket.IO se emit karo.
//    */
//   async createAndEmit({
//     userId,
//     alertLogId,
//     cameraId,
//     cameraName,
//     type,
//     confidence,
//     snapshotPath,
//     timestamp,
//     location,
//     zone,
//     floor,
//     latitude,
//     longitude,
//   }) {
//     if (!userId) {
//       logger.warn("⚠️ createAndEmit: no userId, skipping in-app notification");
//       return null;
//     }

//     const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
//     const label =
//       { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";

//     const title = `${emoji} ${label} DETECTED`;
//     const message = `${label} detected at "${cameraName}" with ${(confidence * 100).toFixed(1)}% confidence`;

//     const severity =
//       type === "fire"
//         ? "critical"
//         : type === "smoke"
//           ? "warning"
//           : (confidence || 0) > 0.8
//             ? "warning"
//             : "info";

//     const doc = await Notification.create({
//       userId,
//       alertLogId,
//       type,
//       title,
//       message,
//       cameraId: cameraId?.toString(),
//       cameraName,
//       location,
//       zone,
//       floor,
//       latitude,
//       longitude,
//       confidence,
//       snapshotUrl: snapshotPath,
//       severity,
//       timestamp: timestamp || new Date(),
//       isRead: false,
//       channels: { inApp: { sent: true, at: new Date() } },
//     });

//     // ── Real-time emit ──
//     const payload = {
//       _id: doc._id,
//       alertLogId,
//       cameraId,
//       cameraName,
//       type,
//       title,
//       message,
//       snapshotUrl: doc.snapshotUrl,
//       confidence,
//       severity,
//       location,
//       zone,
//       isRead: false,
//       createdAt: doc.createdAt,
//       timestamp: doc.timestamp,
//     };

//     try {
//       emitToUser(userId.toString(), "alert:new", payload); // 🆕
//       emitToAdmins("alert:new", payload); // 🆕
//       console.log(`🔔 alert:new emitted → user:${userId}`);
//       logger.info(`🔔 alert:new emitted → user:${userId}`);
//       // emitToAdmins("notification:new", payload);
//       console.log(`🔔 In-app notification emitted → user:${userId}`);
//       logger.info(`🔔 In-app notification emitted → user:${userId}`);
//     } catch (e) {
//       logger.warn(
//         `⚠️ Socket emit failed (notification saved in DB): ${e.message}`,
//       );
//     }

//     return doc;
//   }
// }

// export const notificationService = new NotificationService();




import logger from "../config/logger.js";
import Notification from "../models/Notification.js";
import { emitToAdmins, emitToUser } from "./socket.service.js";

class NotificationService {
  /**
   * In-app notification create karo aur Socket.IO se emit karo.
   */
  async createAndEmit({
    userId,
    alertLogId,
    cameraId,
    cameraName,
    type,
    confidence,
    snapshotPath,
    timestamp,
    location,
    zone,
    floor,
    latitude,
    longitude,
  }) {
    if (!userId) {
      logger.warn("⚠️ createAndEmit: no userId, skipping in-app notification");
      return null;
    }

    const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
    const label =
      { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";

    const title = `${emoji} ${label} DETECTED`;
    const message = `${label} detected at "${cameraName}" with ${(confidence * 100).toFixed(1)}% confidence`;

    const severity =
      type === "fire"
        ? "critical"
        : type === "smoke"
          ? "warning"
          : (confidence || 0) > 0.8
            ? "warning"
            : "info";

    const doc = await Notification.create({
      userId,
      alertLogId: alertLogId || null, // 🆕 null allowed
      type,
      title,
      message,
      cameraId: cameraId?.toString(),
      cameraName,
      location,
      zone,
      floor,
      latitude,
      longitude,
      confidence,
      snapshotUrl: snapshotPath,
      severity,
      timestamp: timestamp || new Date(),
      isRead: false,
      channels: { inApp: { sent: true, at: new Date() } },
    });

    // ── Real-time emit ──
    const payload = {
      _id: doc._id,
      alertLogId: doc.alertLogId,
      cameraId,
      cameraName,
      type,
      title,
      message,
      snapshotUrl: doc.snapshotUrl,
      confidence,
      severity,
      location,
      zone,
      isRead: false,
      createdAt: doc.createdAt,
      timestamp: doc.timestamp,
    };

    try {
      emitToUser(userId.toString(), "alert:new", payload); // 🆕
      emitToAdmins("alert:new", payload); // 🆕
      logger.info(`🔔 alert:new emitted → user:${userId}`);
    } catch (e) {
      logger.warn(
        `⚠️ Socket emit failed (notification saved in DB): ${e.message}`,
      );
    }

    return doc;
  }

  /**
   * 🆕 AlertLog create hone ke baad notification ko alertLogId se link karo.
   * (Optional — agar tum chaho ki in-app notification DB me bhi alertLogId store kare)
   */
  async linkAlertLog(notificationId, alertLogId) {
    if (!notificationId || !alertLogId) return null;
    try {
      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        { alertLogId },
        { new: true },
      );
      return updated;
    } catch (e) {
      logger.warn(`⚠️ linkAlertLog failed: ${e.message}`);
      return null;
    }
  }
}

export const notificationService = new NotificationService();