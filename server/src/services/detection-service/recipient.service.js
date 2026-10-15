import Camera from "../../models/camera.model.js";
import { User } from "../../models/user.model.js";


/**
 * ⭐ KISKO JAANI CHAHIYE NOTIFICATION — FULL LOGIC
 *
 * Recipients = Owner + Admins + Watchers (unique)
 *
 * @param {Object} camera  - Camera document
 * @returns {Promise<ObjectId[]>}  - unique user IDs
 */
export async function getCameraRecipients(camera) {
  if (!camera) throw new Error("Camera required");

  const recipientSet = new Set();

  // ───── 1. Camera Owner ─────
  if (camera.createdBy) {
    recipientSet.add(String(camera.createdBy));
  }

  // ───── 2. All Admins (always included) ─────
  const admins = await User.find({
    role: "admin",
    isActive: true,
  }).select("_id");

  admins.forEach((a) => recipientSet.add(String(a._id)));

  // ───── 3. Watchers (jinhone camera dekha) ─────
  if (Array.isArray(camera.watchers)) {
    camera.watchers.forEach((w) => {
      if (w.userId) recipientSet.add(String(w.userId));
    });
  }

  // ───── 4. Agar owner bhi kisi aur role ka hai to bhi include (already done) ─────

  // ───── 5. Filter: inactive users ko hatao ─────
  const ids = [...recipientSet];
  if (!ids.length) return [];

  const activeUsers = await User.find({
    _id: { $in: ids },
    isActive: true,
  }).select("_id");

  return activeUsers.map((u) => u._id);
}

/**
 * Camera ko "watched" mark karo — jab user camera open kare
 * Isse future me us camera ki alerts usko milengi
 */
export async function addCameraWatcher(cameraId, userId) {
  await Camera.updateOne(
    { _id: cameraId },
    { $pull: { watchers: { userId } } } // pehle hatao (duplicate na ho)
  );

  await Camera.updateOne(
    { _id: cameraId },
    {
      $push: {
        watchers: {
          userId,
          addedAt: new Date(),
          lastSeenAt: new Date(),
        },
      },
    }
  );
}

/**
 * Watcher hatao
 */
export async function removeCameraWatcher(cameraId, userId) {
  await Camera.updateOne(
    { _id: cameraId },
    { $pull: { watchers: { userId } } }
  );
}

/**
 * User ke saare watched cameras
 */
export async function getUserWatchedCameras(userId) {
  return Camera.find({ "watchers.userId": userId }).select("_id name location");
}