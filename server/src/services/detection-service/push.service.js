// import webpush from "web-push";
// import { PushSubscription } from "../../models/PushSubscription.js";
// // import PushSubscription from "../models/PushSubscription.js";

// // VAPID setup (server start hote hi ek baar)
// webpush.setVapidDetails(
//   process.env.VAPID_SUBJECT,
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// /**
//  * Ek user ke saare devices pe push bhejo
//  * @param {string} userId
//  * @param {Object} payload  { title, body, icon, image, data, tag, ... }
//  */
// export async function sendPushToUser(userId, payload) {
//   const subs = await PushSubscription.find({ userId });
//   if (!subs.length) return { sent: 0, failed: 0 };

//   const results = await Promise.allSettled(
//     subs.map((s) =>
//       webpush
//         .sendNotification(
//           { endpoint: s.endpoint, keys: s.keys },
//           JSON.stringify(payload)
//         )
//         .catch(async (err) => {
//           // 410/404 = subscription expired → delete
//           if (err.statusCode === 410 || err.statusCode === 404) {
//             await PushSubscription.deleteOne({ _id: s._id });
//           }
//           throw err;
//         })
//     )
//   );

//   const sent = results.filter((r) => r.status === "fulfilled").length;
//   const failed = results.length - sent;

//   if (sent) console.log(`✅ Push sent to user ${userId} (${sent} devices)`);
//   if (failed) console.warn(`⚠️ Push failed for ${failed} devices`);

//   return { sent, failed };
// }

// /**
//  * Multiple users ko ek saath bhejo
//  */
// export async function sendPushToUsers(userIds, payload) {
//   const results = await Promise.allSettled(
//     userIds
//       .filter(Boolean)
//       .map((uid) => sendPushToUser(uid, payload))
//   );
//   return results;
// }







// backend/services/push.service.js
import webpush from "web-push";
import { PushSubscription } from "../../models/PushSubscription.js";
import logger from "../../config/logger.js";
// import { PushSubscription } from "../../models/PushSubscription.js";
// import logger from "../../config/logger.js";

// ✅ VAPID configure
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@yourschool.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * ✅ Detect device type from userAgent
 */
function detectDevice(ua) {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(lower)) return "mobile";
  if (/ipad|tablet/.test(lower)) return "tablet";
  if (/windows|mac|linux/.test(lower)) return "desktop";
  return "unknown";
}

/**
 * ✅ Save / update subscription
 */
export async function saveSubscription(userId, subscription, userAgent = null) {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Invalid subscription object");
  }

  const doc = await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      user: userId,
      endpoint,
      keys,
      userAgent,
      deviceType: detectDevice(userAgent),
      isActive: true,
      lastUsedAt: new Date(),
      failureCount: 0,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  logger.info(`✅ Push subscription saved for user ${userId}`);
  return doc;
}

/**
 * ✅ Remove subscription
 */
export async function removeSubscription(endpoint, userId = null) {
  const q = { endpoint };
  if (userId) q.user = userId;
  const result = await PushSubscription.findOneAndDelete(q);
  if (result) logger.info(`🗑️ Push subscription removed`);
  return result;
}

/**
 * ✅ Remove all subscriptions of user
 */
export async function removeAllForUser(userId) {
  const result = await PushSubscription.deleteMany({ user: userId });
  logger.info(`🗑️ Removed ${result.deletedCount} subscriptions for user ${userId}`);
  return result;
}

/**
 * ✅ Send push to single user (all devices)
 */
export async function sendPushToUser(userId, payload) {
  const subs = await PushSubscription.find({ user: userId, isActive: true });
  if (!subs.length) {
    logger.debug(`No push subscriptions for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify(payload),
          { TTL: 60 * 60, urgency: payload.urgency || "high" }
        )
        .catch(async (err) => {
          s.failureCount += 1;

          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.findByIdAndDelete(s._id);
            logger.warn(`🗑️ Removed invalid subscription ${s._id}`);
          } else if (s.failureCount >= 5) {
            s.isActive = false;
            await s.save();
            logger.warn(`⚠️ Deactivated sub ${s._id} after 5 failures`);
          } else {
            await s.save();
          }
          throw err;
        })
    )
  );

  let sent = 0, failed = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      sent++;
      subs[i].lastUsedAt = new Date();
      subs[i].failureCount = 0;
      await subs[i].save();
    } else {
      failed++;
    }
  }

  if (sent) logger.info(`✅ Push sent to user ${userId} (${sent}/${subs.length} devices)`);
  if (failed) logger.warn(`⚠️ Push failed for ${failed} devices`);

  return { sent, failed };
}

/**
 * ✅ Multiple users
 */
export async function sendPushToUsers(userIds, payload) {
  const results = await Promise.allSettled(
    userIds.filter(Boolean).map((uid) => sendPushToUser(uid, payload))
  );
  return results;
}

/**
 * ✅ Build alert payload from alert data
 */
export function buildAlertPayload(alert) {
  const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[alert.type] || "⚠️";
  const label = { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[alert.type] || "ALERT";

  return {
    title: `${emoji} ${label} DETECTED`,
    body: `${alert.cameraName} • ${new Date(alert.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    icon: "/icons/alert-icon.png",
    badge: "/icons/badge.png",
    tag: `alert-${alert._id || Date.now()}`,
    requireInteraction: alert.type === "fire",
    urgency: alert.type === "fire" ? "high" : "normal",
    data: {
      url: `/alerts/${alert._id || ""}`,
      alertId: alert._id?.toString(),
      type: alert.type,
      cameraId: alert.cameraId,
      cameraName: alert.cameraName,
      confidence: alert.confidence,
      timestamp: alert.timestamp,
      snapshot: alert.snapshotPath,
    },
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
}