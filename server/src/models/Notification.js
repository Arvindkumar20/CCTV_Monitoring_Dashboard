// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
//     type: { type: String, enum: ["person", "fire", "smoke", "info"], required: true },
//     title: { type: String, required: true },
//     message: { type: String, required: true },

//     // ───── Camera / Location Details ─────
//     cameraId: String,
//     cameraName: String,
//     location: String,          // "Gate 1, Sector 5, Noida"
//     zone: String,              // "Zone-A", "Parking", etc.
//     latitude: Number,
//     longitude: Number,
//     floor: String,

//     // ───── Detection details ─────
//     confidence: Number,
//     snapshotUrl: String,
//     severity: { type: String, enum: ["critical", "warning", "info"], default: "info" },

//     // ───── Delivery status ─────
//     channels: {
//       inApp:  { sent: { type: Boolean, default: true }, at: Date },
//       push:   { sent: { type: Boolean, default: true }, at: Date },
//       sms:    { sent: { type: Boolean, default: true }, at: Date },
//       call:   { sent: { type: Boolean, default: false }, at: Date },
//     },

//     isRead: { type: Boolean, default: false },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// notificationSchema.index({ userId: 1, createdAt: -1 });
// notificationSchema.index({ severity: 1, createdAt: -1 });

// export default mongoose.model("Notification", notificationSchema);



import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    alertLogId: { type: mongoose.Schema.Types.ObjectId, ref: "AlertLog", default: null }, // 🆕
    type: { type: String, enum: ["person", "fire", "smoke", "info"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },

    // ───── Camera / Location Details ─────
    cameraId: String,
    cameraName: String,
    location: String,          // "Gate 1, Sector 5, Noida"
    zone: String,              // "Zone-A", "Parking", etc.
    latitude: Number,
    longitude: Number,
    floor: String,

    // ───── Detection details ─────
    confidence: Number,
    snapshotUrl: String,
    severity: { type: String, enum: ["critical", "warning", "info"], default: "info" },

    // ───── Delivery status ─────
    channels: {
      inApp:  { sent: { type: Boolean, default: true }, at: Date },
      push:   { sent: { type: Boolean, default: true }, at: Date },
      sms:    { sent: { type: Boolean, default: true }, at: Date },
      call:   { sent: { type: Boolean, default: false }, at: Date },
    },

    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ severity: 1, createdAt: -1 });
notificationSchema.index({ alertLogId: 1 }); // 🆕 fast lookup

export default mongoose.model("Notification", notificationSchema);