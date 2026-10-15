import { AlertLog } from "../../models/AlertLog.js";
import mongoose from "mongoose";
export const AlertLogService = {
  /**
   * ✅ List alerts — user ke hisaab se filter
   */
  async list({ page = 1, limit = 20, type, status, cameraId, search, from, to, userId, userRole } = {}) {
    const q = {};

    // ✅ Non-admin users sirf apne alerts dekhein
    if (userRole !== "admin" && userId) {
      q.user = userId;
    }

    if (type) q.type = type;
    if (status) q.overallStatus = status;
    if (cameraId) q.cameraId = cameraId;

    if (from || to) {
      q.timestamp = {};
      if (from) q.timestamp.$gte = new Date(from);
      if (to) q.timestamp.$lte = new Date(to);
    }

    if (search) {
      q.$or = [
        { cameraName: { $regex: search, $options: "i" } },
        { cameraId: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      AlertLog.find(q)
        .populate("user", "fullName email mobile")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AlertLog.countDocuments(q),
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getById(id, userId, userRole) {
    const q = { _id: id };
    if (userRole !== "admin" && userId) q.user = userId;

    return AlertLog.findOne(q).populate("user", "fullName email mobile").lean();
  },

  /**
   * ✅ Stats — user-specific
   */
  async stats({ days = 7, userId, userRole } = {}) {
    const since = new Date(Date.now() - days * 86400 * 1000);
    const match = { timestamp: { $gte: since } };

    if (userRole !== "admin" && userId) {
      match.user = new mongoose.Types.ObjectId(userId);
    }

    const [byType, byStatus, dailyTrend, total, failedCount] = await Promise.all([
      AlertLog.aggregate([
        { $match: match },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      AlertLog.aggregate([
        { $match: match },
        { $group: { _id: "$overallStatus", count: { $sum: 1 } } },
      ]),
      AlertLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AlertLog.countDocuments(match),
      AlertLog.countDocuments({
        ...match,
        overallStatus: { $in: ["failed", "partial"] },
      }),
    ]);

    const typeMap = Object.fromEntries(byType.map((r) => [r._id, r.count]));
    const statusMap = Object.fromEntries(byStatus.map((r) => [r._id, r.count]));

    return {
      rangeDays: days,
      total,
      failedCount,
      successRate: total ? (((statusMap.success || 0) / total) * 100).toFixed(1) : "0.0",
      byType: {
        person: typeMap.person || 0,
        fire: typeMap.fire || 0,
        smoke: typeMap.smoke || 0,
      },
      byStatus: {
        success: statusMap.success || 0,
        partial: statusMap.partial || 0,
        failed: statusMap.failed || 0,
        pending: statusMap.pending || 0,
        skipped: statusMap.skipped || 0,
      },
      dailyTrend: dailyTrend.map((r) => ({ date: r._id, count: r.count })),
    };
  },

  async failed({ hours = 24, userId, userRole } = {}) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    const q = {
      timestamp: { $gte: since },
      overallStatus: { $in: ["failed", "partial"] },
    };
    if (userRole !== "admin" && userId) q.user = userId;

    return AlertLog.find(q)
      .populate("user", "fullName email mobile")
      .sort({ timestamp: -1 })
      .lean();
  },

  async acknowledge(id, by = "admin", notes = "", userId, userRole) {
    const q = { _id: id };
    if (userRole !== "admin" && userId) q.user = userId;

    return AlertLog.findOneAndUpdate(
      q,
      {
        acknowledged: true,
        acknowledgedBy: by,
        acknowledgedAt: new Date(),
        notes,
      },
      { new: true }
    ).lean();
  },

  async remove(id, userId, userRole) {
    const q = { _id: id };
    if (userRole !== "admin" && userId) q.user = userId;
    return AlertLog.findOneAndDelete(q);
  },
};