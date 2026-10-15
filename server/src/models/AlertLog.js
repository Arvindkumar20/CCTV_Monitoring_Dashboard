// backend/models/AlertLog.js
import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      default: "skipped",
    },
    error: { type: String, default: null },
    sentAt: { type: Date, default: null },
    recipients: { type: [String], default: [] },
    attempts: { type: Number, default: 0 },
  },
  { _id: false },
);

const alertLogSchema = new mongoose.Schema(
  {
    // ✅ User association
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, default: null },
    userEmail: { type: String, default: null },

    type: {
      type: String,
      enum: ["person", "fire", "smoke"],
      required: true,
      index: true,
    },
    cameraId: { type: String, required: true, index: true },
    cameraName: { type: String, required: true },
    rtspUrl: { type: String, default: null },
    confidence: { type: Number, default: 0 },
    snapshotPath: { type: String, default: null },
    timestamp: { type: Date, required: true, index: true },

    channels: {
      email: { type: channelSchema, default: () => ({}) },
      sms: { type: channelSchema, default: () => ({}) },
      whatsapp: { type: channelSchema, default: () => ({}) },
      call: { type: channelSchema, default: () => ({}) },
    },

    overallStatus: {
      type: String,
      enum: ["success", "partial", "failed", "pending", "skipped"],
      default: "pending",
      index: true,
    },

    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String, default: null },
    acknowledgedAt: { type: Date, default: null },
    notes: { type: String, default: "" },

    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ✅ Indexes
alertLogSchema.index({ user: 1, timestamp: -1 });
alertLogSchema.index({ type: 1, timestamp: -1 });
alertLogSchema.index({ overallStatus: 1, timestamp: -1 });
alertLogSchema.index({ cameraId: 1, timestamp: -1 });

export const AlertLog = mongoose.model("AlertLog", alertLogSchema);
