// import express from "express";
// import Notification from "../models/Notification.js";
// import { authenticate } from "../middlewares/auth.middleware.js";
// // import Notification from "../models/Notification.js";
// // import { authenticate } from "../middleware/auth.js";

// const router = express.Router();

// // GET /api/notifications?page=1&limit=20
// router.get("/", authenticate, async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 20;
//   const filter = { userId: req.user.userId  };

//   const [items, total, unread] = await Promise.all([
//     Notification.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit),
//     Notification.countDocuments(filter),
//     Notification.countDocuments({ ...filter, isRead: false }),
//   ]);

//   res.json({ items, total, unread, page, pages: Math.ceil(total / limit) });
// });

// // PATCH /api/notifications/:id/read
// router.patch("/:id/read", authenticate, async (req, res) => {
//   const doc = await Notification.findOneAndUpdate(
//     { _id: req.params.id, userId: req.user._id },
//     { isRead: true },
//     { new: true }
//   );
//   if (!doc) return res.status(404).json({ message: "Not found" });
//   res.json(doc);
// });

// // PATCH /api/notifications/read-all
// router.patch("/read-all", authenticate, async (req, res) => {
//   await Notification.updateMany(
//     { userId: req.user._id, isRead: false },
//     { isRead: true }
//   );
//   res.json({ ok: true });
// });

// // DELETE /api/notifications/:id
// router.delete("/:id", authenticate, async (req, res) => {
//   await Notification.deleteOne({ _id: req.params.id, userId: req.user._id });
//   res.json({ ok: true });
// });

// export const notificationRouter= router;





import express from "express";
import Notification from "../models/Notification.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ JWT me jo bhi field ho (userId / _id / id), consistent pick karo
const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

// ═══ GET list (paginated) ═══
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const filter = { userId };

    if (req.query.unread === "true") filter.isRead = false;
    if (req.query.type) filter.type = req.query.type;

    const [items, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.json({ items, total, unread, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ═══ Unread count (bell badge) ═══
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ⚠️ IMPORTANT: specific routes pehle, param routes baad me
router.patch("/read-all", authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    const r = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ ok: true, updated: r.modifiedCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ═══ Mark one read ═══
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ═══ Delete one ═══
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    const r = await Notification.deleteOne({ _id: req.params.id, userId });
    if (!r.deletedCount) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export const notificationRouter = router;