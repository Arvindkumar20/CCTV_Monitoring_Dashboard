// // src/models/user.model.js
// import mongoose from "mongoose";
// import crypto from "crypto";
// import { env } from "../config/env.js";

// // ==================== SUB-SCHEMAS ====================

// /**
//  * ✅ Active session schema (ek device = ek active token)
//  * Login pe create, logout/expiry pe remove
//  */

// const refreshTokenSchema = new mongoose.Schema(
//   {
//     token: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     deviceId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     device: String, // "Windows", "iOS", "Android"
//     os: String,
//     browser: String,
//     ipAddress: String,
//     userAgent: String,
//     lastUsed: {
//       type: Date,
//       default: Date.now,
//     },
//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },

//     // ✅ NEW
//     isRevoked: { type: Boolean, default: false },
//     revokedAt: { type: Date, default: null },
//     revokedReason: { type: String, default: null }, // "logout", "relogin", "expired", "password_change"
//   },
//   { _id: true },
// );

// /**
//  * ✅ Lifetime device login history (NEVER auto-deleted)
//  * Har unique device ka permanent record
//  */
// const deviceHistorySchema = new mongoose.Schema(
//   {
//     deviceId: {
//       type: String,
//       required: true,
//     },
//     device: String,
//     os: String,
//     browser: String,
//     ipAddress: String,
//     userAgent: String,
//     loginAt: {
//       type: Date,
//       default: Date.now,
//     },
//     logoutAt: {
//       type: Date,
//       default: null,
//     },
//     lastSeenAt: {
//       type: Date,
//       default: Date.now,
//     },
//     loginCount: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//   },
//   { _id: true },
// );

// // ==================== MAIN USER SCHEMA ====================

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: [true, "Full name is required"],
//       trim: true,
//       minlength: [3, "Full name must be at least 3 characters"],
//       maxlength: [50, "Full name cannot exceed 50 characters"],
//       index: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//       match: [
//         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//         "Please enter a valid email",
//       ],
//     },
//     mobile: {
//       type: String,
//       required: [true, "Mobile number is required"],
//       unique: true,
//       index: true,
//       match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [8, "Password must be at least 8 characters"],
//       select: false,
//     },
//     userType: {
//       type: String,
//       default: "school",
//     },
//     role: {
//       type: String,
//       enum: {
//         values: ["admin", "principal", "teacher", "security"],
//         message: "{VALUE} is not a valid role",
//       },
//       default: "principal",
//       index: true,
//     },
//     schoolName: String,
//     userProfilePic: String,
//     schoolLogo: String,

//     // ───── Alert contacts (per-user overrides) ─────
//     whatsapp: { type: String },
//     callPhone: { type: String },
//     alertEmail: { type: String },

//     // ───── Alert preferences ─────
//     alertPreferences: {
//       email: { type: Boolean, default: true },
//       sms: { type: Boolean, default: true },
//       whatsapp: { type: Boolean, default: true },
//       call: { type: Boolean, default: false },
//       alertEmail: { type: String, lowercase: true, trim: true },
//       alertMobile: { type: String, trim: true },
//       alertWhatsApp: { type: String, trim: true },
//     },

//     notificationsEnabled: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },
//     lastLogin: {
//       type: Date,
//       default: null,
//     },
//     loginAttempts: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     lockUntil: {
//       type: Date,
//       default: null,
//     },

//     // ✅ Active sessions (ek device = ek entry, multiple devices allowed)
//     refreshTokens: [refreshTokenSchema],

//     // ✅ Lifetime device login history (kabhi delete nahi hoga)
//     deviceHistory: [deviceHistorySchema],

//     passwordChangedAt: Date,
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     emailVerificationToken: String,
//     emailVerificationExpires: Date,
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// // ==================== INDEXES ====================
// // ❌ NO TTL INDEX - lifetime records chahiye
// // userSchema.index({ "refreshTokens.expiresAt": 1 }, { expireAfterSeconds: 0 });

// userSchema.index({ email: 1, mobile: 1 });
// userSchema.index({ role: 1, isActive: 1 });
// userSchema.index({ _id: 1, "refreshTokens.token": 1 });
// userSchema.index({ _id: 1, "refreshTokens.deviceId": 1 });
// userSchema.index({ _id: 1, "deviceHistory.deviceId": 1 });

// // ==================== VIRTUALS ====================

// userSchema.virtual("isLocked").get(function () {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// userSchema.virtual("profile").get(function () {
//   return {
//     id: this._id,
//     fullName: this.fullName,
//     email: this.email,
//     mobile: this.mobile,
//     role: this.role,
//     userType: this.userType,
//     schoolName: this.schoolName,
//     userProfilePic: this.userProfilePic,
//     schoolLogo: this.schoolLogo,
//     isActive: this.isActive,
//     isEmailVerified: this.isEmailVerified,
//     lastLogin: this.lastLogin,
//     createdAt: this.createdAt,
//     updatedAt: this.updatedAt,
//     alertPreferences: this.alertPreferences,
//     notificationsEnabled: this.notificationsEnabled,
//   };
// });

// // Active sessions count
// userSchema.virtual("activeSessionsCount").get(function () {
//   return this.refreshTokens?.length || 0;
// });

// // ==================== METHODS ====================

// userSchema.methods = {
//   /**
//    * Check if password was changed after JWT was issued
//    */
//   isPasswordChangedAfter: function (JWTTimestamp) {
//     if (this.passwordChangedAt) {
//       const changedTimestamp = parseInt(
//         this.passwordChangedAt.getTime() / 1000,
//         10,
//       );
//       return JWTTimestamp < changedTimestamp;
//     }
//     return false;
//   },

//   /**
//    * Create password reset token
//    */
//   createPasswordResetToken: function () {
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     this.passwordResetToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//     return resetToken;
//   },

//   /**
//    * Create email verification token
//    */
//   createEmailVerificationToken: function () {
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     this.emailVerificationToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");
//     this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
//     return verificationToken;
//   },

//   /**
//    * Increment failed login attempts
//    */
//   incrementLoginAttempts: function () {
//     this.loginAttempts += 1;
//     if (this.loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
//       this.lockUntil = Date.now() + env.LOCK_TIME * 60 * 1000;
//     }
//     return this.save();
//   },

//   /**
//    * Reset login attempts on successful login
//    */
//   resetLoginAttempts: function () {
//     this.loginAttempts = 0;
//     this.lockUntil = null;
//     return this.save();
//   },

//   /**
//    * ✅ Add or update a device session
//    * - Same device re-login → purana active token replace
//    * - New device → naya active token
//    * - History me lifetime record update/create
//    */
//   addDeviceSession: async function (tokenData) {
//     if (!tokenData?.token || !tokenData?.deviceId) {
//       throw new Error("token and deviceId are required to add device session");
//     }

//     // 1. Same device ka purana active token hatao (ek device = ek active session)
//     // this.refreshTokens = this.refreshTokens.filter(
//     //   (t) => t.deviceId !== tokenData.deviceId
//     // );
//     const now = new Date();
//     this.refreshTokens.forEach((t) => {
//       if (t.deviceId === tokenData.deviceId && !t.isRevoked) {
//         t.isRevoked = true;
//         t.revokedAt = now;
//         t.revokedReason = "relogin";
//         t.expiresAt = now; // turant expire
//       }
//     });

//     // 2. Naya active token push karo
//     this.refreshTokens.push({
//       token: tokenData.token,
//       deviceId: tokenData.deviceId,
//       device: tokenData.device || "unknown",
//       os: tokenData.os || "unknown",
//       browser: tokenData.browser || "unknown",
//       ipAddress: tokenData.ipAddress || "unknown",
//       userAgent: tokenData.userAgent || null,
//       expiresAt: tokenData.expiresAt,
//       lastUsed: new Date(),
//       createdAt: new Date(),
//     });

//     // 3. Lifetime history update
//     const existing = this.deviceHistory.find(
//       (d) => d.deviceId === tokenData.deviceId,
//     );

//     if (existing) {
//       existing.loginAt = new Date();
//       existing.lastSeenAt = new Date();
//       existing.ipAddress = tokenData.ipAddress || existing.ipAddress;
//       existing.userAgent = tokenData.userAgent || existing.userAgent;
//       existing.device = tokenData.device || existing.device;
//       existing.os = tokenData.os || existing.os;
//       existing.browser = tokenData.browser || existing.browser;
//       existing.logoutAt = null; // re-login → active again
//       existing.loginCount = (existing.loginCount || 0) + 1;
//     } else {
//       this.deviceHistory.push({
//         deviceId: tokenData.deviceId,
//         device: tokenData.device || "unknown",
//         os: tokenData.os || "unknown",
//         browser: tokenData.browser || "unknown",
//         ipAddress: tokenData.ipAddress || "unknown",
//         userAgent: tokenData.userAgent || null,
//         loginAt: new Date(),
//         lastSeenAt: new Date(),
//         loginCount: 1,
//       });
//     }

//     return this.save();
//   },

//   /**
//    * ✅ Legacy alias (backward compatibility)
//    */
//   addRefreshToken: function (tokenData) {
//     return this.addDeviceSession(tokenData);
//   },

//   /**
//    * ✅ Update lastUsed on token refresh
//    */
//   touchRefreshToken: async function (token) {
//     const entry = this.refreshTokens.find((t) => t.token === token);
//     if (!entry) return this;

//     entry.lastUsed = new Date();

//     const deviceEntry = this.deviceHistory.find(
//       (d) => d.deviceId === entry.deviceId,
//     );
//     if (deviceEntry) {
//       deviceEntry.lastSeenAt = new Date();
//     }

//     return this.save();
//   },

//   /**
//    * ✅ Remove specific device session (logout)
//    * Active token remove, history me logoutAt set (entry safe rahegi)
//    */
//   removeDeviceSession: async function (token) {
//     const now = new Date();
//     const entry = this.refreshTokens.find((t) => t.token === token);

//     if (entry) {
//       entry.isRevoked = true;
//       entry.revokedAt = now;
//       entry.revokedReason = "logout";
//       entry.expiresAt = now;

//       const deviceEntry = this.deviceHistory.find(
//         (d) => d.deviceId === entry.deviceId,
//       );
//       if (deviceEntry) {
//         deviceEntry.logoutAt = now;
//         deviceEntry.lastSeenAt = now;
//       }
//     }
//     return this.save();
//   },
//   /**
//    * ✅ Legacy alias
//    */
//   removeRefreshToken: function (token) {
//     return this.removeDeviceSession(token);
//   },

//   /**
//    * ✅ Logout a specific device by deviceId
//    */
//   removeDeviceSessionById: async function (deviceId) {
//     const entry = this.refreshTokens.find((t) => t.deviceId === deviceId);

//     if (entry) {
//       const deviceEntry = this.deviceHistory.find(
//         (d) => d.deviceId === deviceId,
//       );
//       if (deviceEntry) {
//         deviceEntry.logoutAt = new Date();
//         deviceEntry.lastSeenAt = new Date();
//       }
//     }

//     this.refreshTokens = this.refreshTokens.filter(
//       (t) => t.deviceId !== deviceId,
//     );
//     return this.save();
//   },

//   /**
//    * ✅ Logout all devices - active tokens clear, history intact
//    */
//   removeAllDeviceSessions: async function () {
//     const now = new Date();
//     this.deviceHistory.forEach((d) => {
//       if (!d.logoutAt) d.logoutAt = now;
//     });
//     this.refreshTokens.forEach((t) => {
//       if (!t.isRevoked) {
//         t.isRevoked = true;
//         t.revokedAt = now;
//         t.revokedReason = "logout_all";
//         t.expiresAt = now;
//       }
//     });
//     return this.save();
//   },

//   /**
//    * ✅ Legacy alias
//    */
//   removeAllRefreshTokens: function () {
//     return this.removeAllDeviceSessions();
//   },

//   /**
//    * ✅ Get all active sessions (for "Manage Devices" UI)
//    */
//   getActiveSessions: function () {
//     const now = new Date();
//     return (this.refreshTokens || [])
//       .filter((t) => !t.isRevoked && t.expiresAt > now)
//       .map((t) => ({
//         /* same fields */
//       }));
//   },

//   /**
//    * ✅ Get complete lifetime login history (sorted latest first)
//    */
//   getDeviceHistory: function () {
//     return [...(this.deviceHistory || [])].sort(
//       (a, b) => new Date(b.loginAt) - new Date(a.loginAt),
//     );
//   },

//   /**
//    * ✅ Get effective alert contacts (fallback to main email/mobile)
//    */
//   getAlertContacts: function () {
//     return {
//       email: this.alertPreferences?.alertEmail || this.email,
//       mobile: this.alertPreferences?.alertMobile || this.mobile,
//       whatsapp:
//         this.alertPreferences?.alertWhatsApp ||
//         this.alertPreferences?.alertMobile ||
//         this.mobile,
//     };
//   },

//   /**
//    * ✅ Check if user wants this alert type on this channel
//    */
//   wantsAlert: function (type, channel) {
//     if (!this.notificationsEnabled) return false;
//     const prefs = this.alertPreferences || {};

//     const matrix = {
//       person: { email: true, sms: true, whatsapp: true, call: false },
//       fire: { email: true, sms: true, whatsapp: true, call: true },
//       smoke: { email: true, sms: true, whatsapp: true, call: true },
//     };

//     const typeAllows = matrix[type]?.[channel] ?? false;
//     if (!typeAllows) return false;

//     if (channel === "call") return prefs.call === true;
//     return prefs[channel] !== false;
//   },
// };
// userSchema.methods.isTokenActive = function (t) {
//   return !t.isRevoked && t.expiresAt > new Date();
// };

// // ==================== STATICS ====================

// userSchema.statics = {
//   async findByEmailOrMobile(identifier) {
//     return this.findOne({
//       $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
//     });
//   },

//   async getCountByRole(role) {
//     return this.countDocuments({ role, isActive: true });
//   },

//   async expireOldRefreshTokens() {
//     const now = new Date();
//     // jo already expiresAt nikal chuke hain unhe revoked mark karo (delete nahi)
//     return this.updateMany(
//       { "refreshTokens.expiresAt": { $lt: now } },
//       {
//         $set: {
//           "refreshTokens.$[t].isRevoked": true,
//           "refreshTokens.$[t].revokedAt": now,
//           "refreshTokens.$[t].revokedReason": "expired",
//         },
//       },
//       { arrayFilters: [{ "t.expiresAt": { $lt: now }, "t.isRevoked": false }] },
//     );
//   },
//   /**
//    * ✅ CLEANUP: Remove ONLY expired ACTIVE refresh tokens (history untouched)
//    * Lifetime device history kabhi delete nahi hogi
//    */
//   /**
//    * ✅ Expired tokens ko DELETE nahi karta, sirf revoked mark karta hai
//    */
//   async cleanupExpiredRefreshTokens() {
//     const now = new Date();
//     const result = await this.updateMany(
//       { "refreshTokens.expiresAt": { $lt: now } },
//       {
//         $set: {
//           "refreshTokens.$[t].isRevoked": true,
//           "refreshTokens.$[t].revokedAt": now,
//           "refreshTokens.$[t].revokedReason": "expired",
//         },
//       },
//       {
//         arrayFilters: [
//           { "t.expiresAt": { $lt: now }, "t.isRevoked": { $ne: true } },
//         ],
//       },
//     );

//     return {
//       matchedCount: result.matchedCount,
//       modifiedCount: result.modifiedCount,
//     };
//   },

//   /**
//    * ✅ Broken entries (token/deviceId missing) ko DELETE nahi karta,
//    * sirf expire + revoke karta hai aur missing required fields fill karta hai
//    * taaki save() validation fail na ho
//    */
//   async cleanupBrokenTokens() {
//     const now = new Date();

//     const brokenFilter = {
//       $or: [
//         { "t.token": { $exists: false } },
//         { "t.token": null },
//         { "t.token": "" },
//         { "t.deviceId": { $exists: false } },
//         { "t.deviceId": null },
//         { "t.deviceId": "" },
//       ],
//     };

//     // Pehle un users ko dhundo jinke paas broken entries hain
//     const users = await this.find({
//       refreshTokens: {
//         $elemMatch: {
//           $or: [
//             { token: { $exists: false } },
//             { token: null },
//             { token: "" },
//             { deviceId: { $exists: false } },
//             { deviceId: null },
//             { deviceId: "" },
//           ],
//         },
//       },
//     }).select("_id refreshTokens");

//     let modifiedCount = 0;

//     for (const user of users) {
//       let changed = false;

//       user.refreshTokens.forEach((t, i) => {
//         const broken = !t.token || !t.deviceId;
//         if (broken) {
//           if (!t.token) t.token = `legacy-${user._id}-${i}-${Date.now()}`;
//           if (!t.deviceId) t.deviceId = "legacy";
//           t.isRevoked = true;
//           t.revokedAt = now;
//           t.revokedReason = "broken";
//           t.expiresAt = now;
//           changed = true;
//         }
//       });

//       if (changed) {
//         await user.save();
//         modifiedCount++;
//       }
//     }

//     return { matchedCount: users.length, modifiedCount };
//   },
// };

// export const User = mongoose.model("User", userSchema);





// src/models/user.model.js
import mongoose from "mongoose";
import crypto from "crypto";
import { env } from "../config/env.js";

// ==================== SUB-SCHEMAS ====================

/**
 * Active/revoked session schema.
 * Tokens KABHI delete nahi hote, sirf isRevoked = true + expiresAt = now hota hai.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    device: String,
    os: String,
    browser: String,
    ipAddress: String,
    userAgent: String,
    lastUsed: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },

    // Revoke info (delete ki jagah)
    isRevoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    // "relogin" | "rotated" | "logout" | "logout_all" | "device_logout" | "expired" | "broken"
    revokedReason: { type: String, default: null },
  },
  { _id: true }
);

/**
 * Lifetime device history (kabhi delete nahi hoti)
 */
const deviceHistorySchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    device: String,
    os: String,
    browser: String,
    ipAddress: String,
    userAgent: String,
    loginAt: { type: Date, default: Date.now },
    logoutAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 1, min: 1 },
  },
  { _id: true }
);

// ==================== MAIN USER SCHEMA ====================

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      index: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    userType: { type: String, default: "school" },
    role: {
      type: String,
      enum: {
        values: ["admin", "principal", "teacher", "security"],
        message: "{VALUE} is not a valid role",
      },
      default: "principal",
      index: true,
    },
    schoolName: String,
    userProfilePic: String,
    schoolLogo: String,

    // Alert contacts
    whatsapp: { type: String },
    callPhone: { type: String },
    alertEmail: { type: String },

    // Alert preferences
    alertPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      call: { type: Boolean, default: false },
      alertEmail: { type: String, lowercase: true, trim: true },
      alertMobile: { type: String, trim: true },
      alertWhatsApp: { type: String, trim: true },
    },

    notificationsEnabled: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0, min: 0 },
    lockUntil: { type: Date, default: null },

    // Sessions (revoked entries bhi yahin rehti hain)
    refreshTokens: [refreshTokenSchema],

    // Lifetime device history
    deviceHistory: [deviceHistorySchema],

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// NO TTL INDEX - kuch bhi auto-delete nahi hona chahiye

userSchema.index({ email: 1, mobile: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ _id: 1, "refreshTokens.token": 1 });
userSchema.index({ _id: 1, "refreshTokens.deviceId": 1 });
userSchema.index({ _id: 1, "deviceHistory.deviceId": 1 });

// ==================== VIRTUALS ====================

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("profile").get(function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    mobile: this.mobile,
    role: this.role,
    userType: this.userType,
    schoolName: this.schoolName,
    userProfilePic: this.userProfilePic,
    schoolLogo: this.schoolLogo,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    alertPreferences: this.alertPreferences,
    notificationsEnabled: this.notificationsEnabled,
  };
});

// Sirf active (non-revoked, non-expired) sessions
userSchema.virtual("activeSessionsCount").get(function () {
  const now = new Date();
  return (this.refreshTokens || []).filter(
    (t) => !t.isRevoked && t.expiresAt > now
  ).length;
});

// ==================== METHODS ====================

userSchema.methods = {
  isPasswordChangedAfter: function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  },

  createPasswordResetToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
  },

  createEmailVerificationToken: function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    return verificationToken;
  },

  incrementLoginAttempts: function () {
    this.loginAttempts += 1;
    if (this.loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = Date.now() + env.LOCK_TIME * 60 * 1000;
    }
    return this.save();
  },

  resetLoginAttempts: function () {
    this.loginAttempts = 0;
    this.lockUntil = null;
    return this.save();
  },

  /**
   * Token valid hai ya nahi
   */
  isTokenActive: function (t) {
    return !!t && !t.isRevoked && t.expiresAt > new Date();
  },

  /**
   * Add/update device session.
   * Same device ke purane active tokens REVOKE hote hain (delete nahi).
   */
  addDeviceSession: async function (tokenData) {
    if (!tokenData?.token || !tokenData?.deviceId) {
      throw new Error("token and deviceId are required to add device session");
    }

    const now = new Date();

    // 1. Same device ke purane active tokens revoke karo
    this.refreshTokens.forEach((t) => {
      if (t.deviceId === tokenData.deviceId && !t.isRevoked) {
        t.isRevoked = true;
        t.revokedAt = now;
        t.revokedReason = "relogin";
        t.expiresAt = now;
      }
    });

    // 2. Naya token push
    this.refreshTokens.push({
      token: tokenData.token,
      deviceId: tokenData.deviceId,
      device: tokenData.device || "unknown",
      os: tokenData.os || "unknown",
      browser: tokenData.browser || "unknown",
      ipAddress: tokenData.ipAddress || "unknown",
      userAgent: tokenData.userAgent || null,
      expiresAt: tokenData.expiresAt,
      lastUsed: now,
      createdAt: now,
      isRevoked: false,
    });

    // 3. Lifetime history
    const existing = this.deviceHistory.find(
      (d) => d.deviceId === tokenData.deviceId
    );

    if (existing) {
      existing.loginAt = now;
      existing.lastSeenAt = now;
      existing.ipAddress = tokenData.ipAddress || existing.ipAddress;
      existing.userAgent = tokenData.userAgent || existing.userAgent;
      existing.device = tokenData.device || existing.device;
      existing.os = tokenData.os || existing.os;
      existing.browser = tokenData.browser || existing.browser;
      existing.logoutAt = null;
      existing.loginCount = (existing.loginCount || 0) + 1;
    } else {
      this.deviceHistory.push({
        deviceId: tokenData.deviceId,
        device: tokenData.device || "unknown",
        os: tokenData.os || "unknown",
        browser: tokenData.browser || "unknown",
        ipAddress: tokenData.ipAddress || "unknown",
        userAgent: tokenData.userAgent || null,
        loginAt: now,
        lastSeenAt: now,
        loginCount: 1,
      });
    }

    return this.save();
  },

  /** Legacy alias */
  addRefreshToken: function (tokenData) {
    return this.addDeviceSession(tokenData);
  },

  /**
   * lastUsed update
   */
  touchRefreshToken: async function (token) {
    const entry = this.refreshTokens.find(
      (t) => t.token === token && !t.isRevoked
    );
    if (!entry) return this;

    const now = new Date();
    entry.lastUsed = now;

    const deviceEntry = this.deviceHistory.find(
      (d) => d.deviceId === entry.deviceId
    );
    if (deviceEntry) deviceEntry.lastSeenAt = now;

    return this.save();
  },

  /**
   * Logout / expire ek token (DELETE nahi, REVOKE)
   */
  removeDeviceSession: async function (token, reason = "logout") {
    const now = new Date();
    const entry = this.refreshTokens.find((t) => t.token === token);

    if (entry) {
      if (!entry.isRevoked) {
        entry.isRevoked = true;
        entry.revokedAt = now;
        entry.revokedReason = reason;
      }
      entry.expiresAt = now;

      const deviceEntry = this.deviceHistory.find(
        (d) => d.deviceId === entry.deviceId
      );
      if (deviceEntry) {
        deviceEntry.logoutAt = now;
        deviceEntry.lastSeenAt = now;
      }
    }

    return this.save();
  },

  /** Legacy alias */
  removeRefreshToken: function (token) {
    return this.removeDeviceSession(token);
  },

  /**
   * Ek device ke saare active tokens revoke
   */
  removeDeviceSessionById: async function (deviceId) {
    const now = new Date();

    this.refreshTokens.forEach((t) => {
      if (t.deviceId === deviceId && !t.isRevoked) {
        t.isRevoked = true;
        t.revokedAt = now;
        t.revokedReason = "device_logout";
        t.expiresAt = now;
      }
    });

    const deviceEntry = this.deviceHistory.find((d) => d.deviceId === deviceId);
    if (deviceEntry) {
      deviceEntry.logoutAt = now;
      deviceEntry.lastSeenAt = now;
    }

    return this.save();
  },

  /**
   * Saare devices logout: sab tokens revoke, history intact
   */
  removeAllDeviceSessions: async function () {
    const now = new Date();

    this.deviceHistory.forEach((d) => {
      if (!d.logoutAt) d.logoutAt = now;
    });

    this.refreshTokens.forEach((t) => {
      if (!t.isRevoked) {
        t.isRevoked = true;
        t.revokedAt = now;
        t.revokedReason = "logout_all";
        t.expiresAt = now;
      }
    });

    return this.save();
  },

  /** Legacy alias */
  removeAllRefreshTokens: function () {
    return this.removeAllDeviceSessions();
  },

  /**
   * Sirf active sessions ("Manage Devices" UI)
   */
  getActiveSessions: function () {
    const now = new Date();
    return (this.refreshTokens || [])
      .filter((t) => !t.isRevoked && t.expiresAt > now)
      .map((t) => ({
        deviceId: t.deviceId,
        device: t.device,
        os: t.os,
        browser: t.browser,
        ipAddress: t.ipAddress,
        lastUsed: t.lastUsed,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
      }));
  },

  /**
   * Lifetime login history (latest first)
   */
  getDeviceHistory: function () {
    return [...(this.deviceHistory || [])].sort(
      (a, b) => new Date(b.loginAt) - new Date(a.loginAt)
    );
  },

  getAlertContacts: function () {
    return {
      email: this.alertPreferences?.alertEmail || this.email,
      mobile: this.alertPreferences?.alertMobile || this.mobile,
      whatsapp:
        this.alertPreferences?.alertWhatsApp ||
        this.alertPreferences?.alertMobile ||
        this.mobile,
    };
  },

  wantsAlert: function (type, channel) {
    if (!this.notificationsEnabled) return false;
    const prefs = this.alertPreferences || {};

    const matrix = {
      person: { email: true, sms: true, whatsapp: true, call: false },
      fire: { email: true, sms: true, whatsapp: true, call: true },
      smoke: { email: true, sms: true, whatsapp: true, call: true },
    };

    const typeAllows = matrix[type]?.[channel] ?? false;
    if (!typeAllows) return false;

    if (channel === "call") return prefs.call === true;
    return prefs[channel] !== false;
  },
};

// ==================== STATICS ====================

userSchema.statics = {
  async findByEmailOrMobile(identifier) {
    return this.findOne({
      $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
    });
  },

  async getCountByRole(role) {
    return this.countDocuments({ role, isActive: true });
  },

  /**
   * Expired tokens ko DELETE nahi karta, sirf revoked mark karta hai.
   * Cron se call kar sakte ho.
   */
  async cleanupExpiredRefreshTokens() {
    const now = new Date();
    const result = await this.updateMany(
      { "refreshTokens.expiresAt": { $lt: now } },
      {
        $set: {
          "refreshTokens.$[t].isRevoked": true,
          "refreshTokens.$[t].revokedAt": now,
          "refreshTokens.$[t].revokedReason": "expired",
        },
      },
      {
        arrayFilters: [
          { "t.expiresAt": { $lt: now }, "t.isRevoked": { $ne: true } },
        ],
      }
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  },

  /**
   * ONE-TIME FIX: broken entries (token/deviceId/expiresAt missing) ko delete
   * nahi karta. Missing fields fill karke revoke karta hai taaki save()
   * validation pass ho.
   */
  async cleanupBrokenTokens() {
    const now = new Date();

    const users = await this.find({
      refreshTokens: {
        $elemMatch: {
          $or: [
            { token: { $exists: false } },
            { token: null },
            { token: "" },
            { deviceId: { $exists: false } },
            { deviceId: null },
            { deviceId: "" },
            { expiresAt: { $exists: false } },
            { expiresAt: null },
          ],
        },
      },
    }).select("_id refreshTokens");

    let modifiedCount = 0;

    for (const user of users) {
      let changed = false;

      user.refreshTokens.forEach((t, i) => {
        if (!t.token || !t.deviceId || !t.expiresAt) {
          if (!t.token) t.token = `legacy-${user._id}-${i}-${Date.now()}`;
          if (!t.deviceId) t.deviceId = "legacy";
          t.isRevoked = true;
          t.revokedAt = now;
          t.revokedReason = "broken";
          t.expiresAt = now;
          changed = true;
        }
      });

      if (changed) {
        await user.save();
        modifiedCount++;
      }
    }

    return { matchedCount: users.length, modifiedCount };
  },
};

export const User = mongoose.model("User", userSchema);