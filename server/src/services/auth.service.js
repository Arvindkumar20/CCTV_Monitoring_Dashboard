
// // src/services/auth.service.js
// import { User } from "../models/user.model.js";
// import { hashPassword, comparePassword } from "../utils/bcrypt.utils.js";
// import { generateTokens, verifyToken } from "../utils/jwt.utils.js";
// import AppError from "../utils/AppError.js";
// import logger from "../config/logger.js";
// import { env } from "../config/env.js";
// import crypto from "crypto";

// class AuthService {
//   // ==================== REGISTER ====================

//   /**
//    * Register new user
//    */
//   async register(userData, ipAddress = null) {
//     try {
//       const existingUser = await User.findOne({
//         $or: [
//           { email: userData.email.toLowerCase() },
//           { mobile: userData.mobile },
//         ],
//       }).select("+password");

//       if (existingUser) {
//         if (existingUser.email === userData.email.toLowerCase()) {
//           throw new AppError("Email already registered", 409);
//         }
//         if (existingUser.mobile === userData.mobile) {
//           throw new AppError("Mobile number already registered", 409);
//         }
//       }

//       const hashedPassword = await hashPassword(userData.password);
//       const emailVerificationToken = crypto.randomBytes(32).toString("hex");

//       const user = await User.create({
//         fullName: userData.fullName,
//         email: userData.email.toLowerCase(),
//         mobile: userData.mobile,
//         password: hashedPassword,
//         role: "principal",
//         emailVerificationToken: crypto
//           .createHash("sha256")
//           .update(emailVerificationToken)
//           .digest("hex"),
//         emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
//         createdBy: userData.createdBy,
//       });

//       logger.info(`User registered: ${user.email}`, {
//         userId: user._id,
//         ip: ipAddress,
//       });

//       return user.profile;
//     } catch (error) {
//       logger.error("Registration error", {
//         error: error.message,
//         body: userData,
//       });
//       throw error;
//     }
//   }

//   // ==================== LOGIN ====================

//   /**
//    * ✅ Login user - multiple devices allowed, lifetime history maintained
//    * @param {string} mobile
//    * @param {string} password
//    * @param {string} ipAddress
//    * @param {Object} parsedUA - contains platform, os, browser, deviceId, userAgentString
//    */
//   async login(mobile, password, ipAddress = null, parsedUA = null) {
//     try {
//       const user = await User.findOne({ mobile }).select(
//         "+password +loginAttempts +lockUntil +isActive +isEmailVerified"
//       );

//       if (!user) {
//         throw new AppError("Invalid credentials", 401);
//       }

//       if (!user.isActive) {
//         throw new AppError("Account deactivated. Contact admin", 403);
//       }

//       if (env.NODE_ENV === "production" && !user.isEmailVerified) {
//         throw new AppError("Please verify your email first", 403);
//       }

//       if (user.isLocked) {
//         const lockTime = Math.ceil(
//           (user.lockUntil - Date.now()) / (60 * 1000)
//         );
//         throw new AppError(`Account locked. Try after ${lockTime} minutes`, 423);
//       }

//       const isPasswordValid = await comparePassword(password, user.password);

//       if (!isPasswordValid) {
//         await user.incrementLoginAttempts();
//         const remainingAttempts = env.MAX_LOGIN_ATTEMPTS - user.loginAttempts;
//         const message =
//           remainingAttempts > 0
//             ? `Invalid credentials. ${remainingAttempts} attempts left`
//             : "Too many attempts. Account locked for 30 minutes";
//         throw new AppError(message, 401);
//       }

//       await user.resetLoginAttempts();
//       user.lastLogin = new Date();
//       await user.save();

//       // ✅ Generate tokens
//       const tokens = generateTokens(user._id, user.role);

//       if (!tokens?.refreshToken || !tokens?.accessToken) {
//         throw new AppError("Failed to generate tokens", 500);
//       }

//       // ✅ Decode to get expiry
//       const decoded = verifyToken(tokens.refreshToken, env.JWT_REFRESH_SECRET);

//       if (!decoded?.exp) {
//         throw new AppError("Failed to decode refresh token", 500);
//       }

//       // ✅ Compute stable deviceId (from controller if provided, else hash)
//       const deviceId =
//         parsedUA?.deviceId ||
//         crypto
//           .createHash("sha256")
//           .update(
//             `${parsedUA?.platform || "unknown"}-${
//               parsedUA?.os || "unknown"
//             }-${parsedUA?.browser || "unknown"}-${ipAddress || "unknown"}`
//           )
//           .digest("hex")
//           .slice(0, 16);

//       // ✅ Save active session + lifetime history
//       await user.addDeviceSession({
//         token: tokens.refreshToken,
//         deviceId,
//         device: parsedUA?.platform || "unknown",
//         os: parsedUA?.os || "unknown",
//         browser: parsedUA?.browser || "unknown",
//         ipAddress: ipAddress || "unknown",
//         userAgent: parsedUA?.userAgentString || null,
//         expiresAt: new Date(decoded.exp * 1000),
//       });

//       logger.info(`User logged in: ${user.email}`, {
//         userId: user._id,
//         deviceId,
//         ip: ipAddress,
//       });

//       return {
//         user: user.profile,
//         tokens,
//         deviceId,
//       };
//     } catch (error) {
//       logger.error("Login error", {
//         error: error.message,
//         mobile,
//         ip: ipAddress,
//       });
//       throw error;
//     }
//   }

//   // ==================== REFRESH TOKEN ====================

//   /**
//    * ✅ Refresh access token with rotation (same deviceId preserved)
//    */
//   async refreshToken(refreshToken, ipAddress = null) {
//     try {
//       const decoded = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

//       if (!decoded) {
//         throw new AppError("Invalid refresh token", 401);
//       }

//       const user = await User.findOne({
//         _id: decoded.userId,
//         "refreshTokens.token": refreshToken,
//       }).select("+isActive");

//       if (!user || !user.isActive) {
//         throw new AppError("Invalid refresh token", 401);
//       }

//       const storedToken = user.refreshTokens.find(
//         (t) => t.token === refreshToken
//       );

//       if (!storedToken) {
//         throw new AppError("Invalid refresh token", 401);
//       }

//       // ✅ Expired → remove stale entry, mark history logout
//       if (storedToken.expiresAt < new Date()) {
//         await user.removeDeviceSession(refreshToken);
//         throw new AppError("Refresh token expired. Please login again", 401);
//       }

//       // ✅ Generate new tokens
//       const tokens = generateTokens(user._id, user.role);
//       const newDecoded = verifyToken(
//         tokens.refreshToken,
//         env.JWT_REFRESH_SECRET
//       );

//       if (!newDecoded?.exp) {
//         throw new AppError("Failed to decode new refresh token", 500);
//       }

//       // ✅ Rotate: replace old token with new for SAME device
//       // Remove old token from active list
//       user.refreshTokens = user.refreshTokens.filter(
//         (t) => t.token !== refreshToken
//       );

//       // Add new token with same deviceId
//       user.refreshTokens.push({
//         token: tokens.refreshToken,
//         deviceId: storedToken.deviceId,
//         device: storedToken.device,
//         os: storedToken.os,
//         browser: storedToken.browser,
//         ipAddress: ipAddress || storedToken.ipAddress,
//         userAgent: storedToken.userAgent,
//         expiresAt: new Date(newDecoded.exp * 1000),
//         lastUsed: new Date(),
//         createdAt: new Date(),
//       });

//       // Update lifetime history lastSeenAt
//       const deviceEntry = user.deviceHistory.find(
//         (d) => d.deviceId === storedToken.deviceId
//       );
//       if (deviceEntry) {
//         deviceEntry.lastSeenAt = new Date();
//         deviceEntry.logoutAt = null; // still active
//       }

//       await user.save();

//       logger.info(`Token refreshed`, {
//         userId: user._id,
//         deviceId: storedToken.deviceId,
//       });

//       return tokens;
//     } catch (error) {
//       logger.error("Refresh token error", { error: error.message });
//       throw error;
//     }
//   }

//   // ==================== LOGOUT ====================

//   /**
//    * ✅ Logout single device (history entry safe, only logoutAt set)
//    */
//   async logout(userId, refreshToken = null) {
//     try {
//       const user = await User.findById(userId);
//       if (!user) return;

//       if (refreshToken) {
//         await user.removeDeviceSession(refreshToken);
//       } else {
//         await user.removeAllDeviceSessions();
//       }

//       logger.info(`User logged out`, {
//         userId,
//         singleDevice: !!refreshToken,
//       });
//     } catch (error) {
//       logger.error("Logout error", { error: error.message, userId });
//       throw error;
//     }
//   }

//   /**
//    * ✅ Logout all devices (history intact, all sessions cleared)
//    */
//   async logoutAll(userId) {
//     try {
//       const user = await User.findById(userId);
//       if (!user) return;

//       await user.removeAllDeviceSessions();
//       logger.info(`User logged out from all devices`, { userId });
//     } catch (error) {
//       logger.error("Logout all error", { error: error.message, userId });
//       throw error;
//     }
//   }

//   // ==================== PROFILE ====================

//   async getProfile(userId) {
//     const user = await User.findById(userId);
//     if (!user) throw new AppError("User not found", 404);
//     return user.profile;
//   }

//   async updateProfile(userId, updateData) {
//     const restrictedFields = [
//       "password",
//       "role",
//       "isActive",
//       "loginAttempts",
//       "lockUntil",
//       "refreshTokens",
//       "deviceHistory",
//       "emailVerificationToken",
//       "passwordResetToken",
//     ];

//     restrictedFields.forEach((field) => delete updateData[field]);

//     if (updateData.email || updateData.mobile) {
//       const existingUser = await User.findOne({
//         _id: { $ne: userId },
//         $or: [
//           ...(updateData.email
//             ? [{ email: updateData.email.toLowerCase() }]
//             : []),
//           ...(updateData.mobile ? [{ mobile: updateData.mobile }] : []),
//         ],
//       });

//       if (existingUser) {
//         if (existingUser.email === updateData.email?.toLowerCase()) {
//           throw new AppError("Email already in use", 409);
//         }
//         if (existingUser.mobile === updateData.mobile) {
//           throw new AppError("Mobile already in use", 409);
//         }
//       }
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { ...updateData, updatedBy: userId },
//       { new: true, runValidators: true }
//     );

//     if (!user) throw new AppError("User not found", 404);

//     logger.info(`Profile updated`, { userId });
//     return user.profile;
//   }

//   // ==================== PASSWORD ====================

//   /**
//    * ✅ Change password → all active sessions cleared (history intact)
//    */
//   async changePassword(userId, currentPassword, newPassword) {
//     const user = await User.findById(userId).select("+password");
//     if (!user) throw new AppError("User not found", 404);

//     const isValid = await comparePassword(currentPassword, user.password);
//     if (!isValid) throw new AppError("Current password is incorrect", 401);

//     user.password = await hashPassword(newPassword);
//     user.passwordChangedAt = new Date();

//     await user.removeAllDeviceSessions(); // clears active, marks history

//     logger.info(`Password changed`, { userId });
//   }

//   async forgotPassword(email) {
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) return;

//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false });

//     // TODO: Send email with resetToken
//     logger.info(`Password reset requested`, { userId: user._id });
//   }

//   async resetPassword(token, newPassword) {
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!user) throw new AppError("Invalid or expired reset token", 400);

//     user.password = await hashPassword(newPassword);
//     user.passwordChangedAt = new Date();
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.removeAllDeviceSessions(); // logout everywhere

//     logger.info(`Password reset successful`, { userId: user._id });
//   }

//   // ==================== EMAIL VERIFICATION ====================

//   async verifyEmail(token) {
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     const user = await User.findOne({
//       emailVerificationToken: hashedToken,
//       emailVerificationExpires: { $gt: Date.now() },
//     });

//     if (!user)
//       throw new AppError("Invalid or expired verification token", 400);

//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save();

//     logger.info(`Email verified`, { userId: user._id });
//   }

//   async resendVerificationEmail(email) {
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user || user.isEmailVerified) return;

//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     user.emailVerificationToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");
//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
//     await user.save();

//     logger.info(`Verification email resent`, { userId: user._id });
//   }

//   // ==================== DEVICE / SESSION MANAGEMENT ====================

//   /**
//    * ✅ Get all active sessions
//    */
//   async getActiveSessions(userId) {
//     const user = await User.findById(userId);
//     if (!user) throw new AppError("User not found", 404);
//     return user.getActiveSessions();
//   }

//   /**
//    * ✅ Get lifetime device login history
//    */
//   async getDeviceHistory(userId) {
//     const user = await User.findById(userId);
//     if (!user) throw new AppError("User not found", 404);
//     return user.getDeviceHistory();
//   }

//   /**
//    * ✅ Logout a specific device by deviceId
//    */
//   async logoutDevice(userId, deviceId) {
//     const user = await User.findById(userId);
//     if (!user) throw new AppError("User not found", 404);

//     const exists = user.refreshTokens.some((t) => t.deviceId === deviceId);
//     if (!exists) throw new AppError("Session not found for this device", 404);

//     await user.removeDeviceSessionById(deviceId);

//     logger.info(`Device logged out`, { userId, deviceId });
//     return { deviceId };
//   }

//   // ==================== ADMIN ====================

//   async getAllUsers(options = {}) {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       sortOrder = -1,
//       role,
//       isActive,
//       search,
//     } = options;

//     const filter = {};
//     if (role) filter.role = role;
//     if (isActive !== undefined) filter.isActive = isActive;

//     if (search) {
//       filter.$or = [
//         { fullName: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ];
//     }

//     const sort = { [sortBy]: sortOrder };
//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
//       User.countDocuments(filter),
//     ]);

//     return {
//       users,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1,
//       },
//     };
//   }

//   async adminUpdateUser(userId, updateData, adminId) {
//     const allowedUpdates = ["role", "isActive", "isEmailVerified"];
//     const updates = {};

//     allowedUpdates.forEach((field) => {
//       if (updateData[field] !== undefined) {
//         updates[field] = updateData[field];
//       }
//     });

//     updates.updatedBy = adminId;

//     const user = await User.findByIdAndUpdate(userId, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!user) throw new AppError("User not found", 404);

//     // Agar admin ne user ko deactivate kiya → sab sessions clear
//     if (updates.isActive === false) {
//       await user.removeAllDeviceSessions();
//     }

//     logger.info(`Admin updated user`, {
//       adminId,
//       targetUserId: userId,
//       updates,
//     });
//     return user.profile;
//   }

//   async deleteUser(userId, adminId) {
//     const user = await User.findById(userId);
//     if (!user) throw new AppError("User not found", 404);

//     user.isActive = false;
//     user.updatedBy = adminId;

//     await user.removeAllDeviceSessions();

//     logger.info(`User deactivated`, { adminId, targetUserId: userId });
//     return { message: "User deactivated successfully" };
//   }

//   // ==================== STATS ====================

//   async getUserStats() {
//     const [total, active, byRole] = await Promise.all([
//       User.countDocuments(),
//       User.countDocuments({ isActive: true }),
//       User.aggregate([
//         { $match: { isActive: true } },
//         { $group: { _id: "$role", count: { $sum: 1 } } },
//       ]),
//     ]);

//     return {
//       total,
//       active,
//       inactive: total - active,
//       byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
//     };
//   }
// }

// export const authService = new AuthService();

// src/services/auth.service.js
import { User } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.utils.js";
import { generateTokens, verifyToken } from "../utils/jwt.utils.js";
import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";
import { env } from "../config/env.js";
import crypto from "crypto";

class AuthService {
  // ==================== REGISTER ====================

  async register(userData, ipAddress = null) {
    try {
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { mobile: userData.mobile },
        ],
      }).select("+password");

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw new AppError("Email already registered", 409);
        }
        if (existingUser.mobile === userData.mobile) {
          throw new AppError("Mobile number already registered", 409);
        }
      }

      const hashedPassword = await hashPassword(userData.password);
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");

      const user = await User.create({
        fullName: userData.fullName,
        email: userData.email.toLowerCase(),
        mobile: userData.mobile,
        password: hashedPassword,
        role: "principal",
        emailVerificationToken: crypto
          .createHash("sha256")
          .update(emailVerificationToken)
          .digest("hex"),
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        createdBy: userData.createdBy,
      });

      logger.info(`User registered: ${user.email}`, {
        userId: user._id,
        ip: ipAddress,
      });

      return user.profile;
    } catch (error) {
      logger.error("Registration error", {
        error: error.message,
        body: userData,
      });
      throw error;
    }
  }

  // ==================== LOGIN ====================

  /**
   * Login - multiple devices allowed, lifetime history maintained.
   * Purane tokens delete nahi hote, sirf revoke hote hain.
   */
  async login(mobile, password, ipAddress = null, parsedUA = null) {

    try {
      const user = await User.findOne({ mobile }).select(
        "+password +loginAttempts +lockUntil +isActive +isEmailVerified"
      );

      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }

      if (!user.isActive) {
        throw new AppError("Account deactivated. Contact admin", 403);
      }

      if (env.NODE_ENV === "production" && !user.isEmailVerified) {
        throw new AppError("Please verify your email first", 403);
      }

      if (user.isLocked) {
        const lockTime = Math.ceil(
          (user.lockUntil - Date.now()) / (60 * 1000)
        );
        throw new AppError(`Account locked. Try after ${lockTime} minutes`, 423);
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        const remainingAttempts = env.MAX_LOGIN_ATTEMPTS - user.loginAttempts;
        const message =
          remainingAttempts > 0
            ? `Invalid credentials. ${remainingAttempts} attempts left`
            : "Too many attempts. Account locked for 30 minutes";
        throw new AppError(message, 401);
      }

      // Login attempts reset + lastLogin ek hi save me
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLogin = new Date();

      // Tokens generate
      const tokens = generateTokens(user._id, user.role);

      if (!tokens?.refreshToken || !tokens?.accessToken) {
        throw new AppError("Failed to generate tokens", 500);
      }

      const decoded = verifyToken(tokens.refreshToken, env.JWT_REFRESH_SECRET);

      if (!decoded?.exp) {
        throw new AppError("Failed to decode refresh token", 500);
      }

      // Stable deviceId (controller se, warna hash)
      const deviceId =
        parsedUA?.deviceId ||
        crypto
          .createHash("sha256")
          .update(
            `${parsedUA?.platform || "unknown"}-${
              parsedUA?.os || "unknown"
            }-${parsedUA?.browser || "unknown"}-${ipAddress || "unknown"}`
          )
          .digest("hex")
          .slice(0, 16);

      // Session save (addDeviceSession khud save() karta hai)
      await user.addDeviceSession({
        token: tokens.refreshToken,
        deviceId,
        device: parsedUA?.platform || "unknown",
        os: parsedUA?.os || "unknown",
        browser: parsedUA?.browser || "unknown",
        ipAddress: ipAddress || "unknown",
        userAgent: parsedUA?.userAgentString || null,
        expiresAt: new Date(decoded.exp * 1000),
      });

      logger.info(`User logged in: ${user.email}`, {
        userId: user._id,
        deviceId,
        ip: ipAddress,
      });

      return {
        user: user.profile,
        tokens,
        deviceId,
      };
    } catch (error) {
      logger.error("Login error", {
        error: error.message,
        mobile,
        ip: ipAddress,
      });
      throw error;
    }
  }

  // ==================== REFRESH TOKEN ====================

  /**
   * Refresh with rotation. Purana token DELETE nahi hota, revoke hota hai.
   */
  async refreshToken(refreshToken, ipAddress = null) {
    try {
      const decoded = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

      if (!decoded) {
        throw new AppError("Invalid refresh token", 401);
      }

      const user = await User.findOne({
        _id: decoded.userId,
        "refreshTokens.token": refreshToken,
      }).select("+isActive");

      if (!user || !user.isActive) {
        throw new AppError("Invalid refresh token", 401);
      }

      const storedToken = user.refreshTokens.find(
        (t) => t.token === refreshToken
      );

      if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Revoked token reuse -> reject
      if (storedToken.isRevoked) {
        throw new AppError("Refresh token revoked. Please login again", 401);
      }

      // Expired -> revoke mark (delete nahi)
      if (storedToken.expiresAt < new Date()) {
        await user.removeDeviceSession(refreshToken, "expired");
        throw new AppError("Refresh token expired. Please login again", 401);
      }

      // New tokens
      const tokens = generateTokens(user._id, user.role);
      const newDecoded = verifyToken(
        tokens.refreshToken,
        env.JWT_REFRESH_SECRET
      );

      if (!newDecoded?.exp) {
        throw new AppError("Failed to decode new refresh token", 500);
      }

      const now = new Date();

      // Rotate: purana revoke (delete nahi)
      storedToken.isRevoked = true;
      storedToken.revokedAt = now;
      storedToken.revokedReason = "rotated";
      storedToken.expiresAt = now;

      // Naya token same deviceId ke saath
      user.refreshTokens.push({
        token: tokens.refreshToken,
        deviceId: storedToken.deviceId,
        device: storedToken.device,
        os: storedToken.os,
        browser: storedToken.browser,
        ipAddress: ipAddress || storedToken.ipAddress,
        userAgent: storedToken.userAgent,
        expiresAt: new Date(newDecoded.exp * 1000),
        lastUsed: now,
        createdAt: now,
        isRevoked: false,
      });

      // Lifetime history update
      const deviceEntry = user.deviceHistory.find(
        (d) => d.deviceId === storedToken.deviceId
      );
      if (deviceEntry) {
        deviceEntry.lastSeenAt = now;
        deviceEntry.logoutAt = null;
      }

      await user.save();

      logger.info(`Token refreshed`, {
        userId: user._id,
        deviceId: storedToken.deviceId,
      });

      return tokens;
    } catch (error) {
      logger.error("Refresh token error", { error: error.message });
      throw error;
    }
  }

  // ==================== LOGOUT ====================

  async logout(userId, refreshToken = null) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      if (refreshToken) {
        await user.removeDeviceSession(refreshToken);
      } else {
        await user.removeAllDeviceSessions();
      }

      logger.info(`User logged out`, {
        userId,
        singleDevice: !!refreshToken,
      });
    } catch (error) {
      logger.error("Logout error", { error: error.message, userId });
      throw error;
    }
  }

  async logoutAll(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await user.removeAllDeviceSessions();
      logger.info(`User logged out from all devices`, { userId });
    } catch (error) {
      logger.error("Logout all error", { error: error.message, userId });
      throw error;
    }
  }

  // ==================== PROFILE ====================

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user.profile;
  }

  async updateProfile(userId, updateData) {
    const restrictedFields = [
      "password",
      "role",
      "isActive",
      "loginAttempts",
      "lockUntil",
      "refreshTokens",
      "deviceHistory",
      "emailVerificationToken",
      "passwordResetToken",
    ];

    restrictedFields.forEach((field) => delete updateData[field]);

    if (updateData.email || updateData.mobile) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(updateData.email
            ? [{ email: updateData.email.toLowerCase() }]
            : []),
          ...(updateData.mobile ? [{ mobile: updateData.mobile }] : []),
        ],
      });

      if (existingUser) {
        if (existingUser.email === updateData.email?.toLowerCase()) {
          throw new AppError("Email already in use", 409);
        }
        if (existingUser.mobile === updateData.mobile) {
          throw new AppError("Mobile already in use", 409);
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedBy: userId },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError("User not found", 404);

    logger.info(`Profile updated`, { userId });
    return user.profile;
  }

  // ==================== PASSWORD ====================

  /**
   * Change password -> saare active sessions revoke (history intact)
   * removeAllDeviceSessions() khud save() karta hai, to password bhi save hoga
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new AppError("User not found", 404);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new AppError("Current password is incorrect", 401);

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();

    await user.removeAllDeviceSessions();

    logger.info(`Password changed`, { userId });
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return;

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with resetToken
    logger.info(`Password reset requested`, { userId: user._id });
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.removeAllDeviceSessions(); // logout everywhere (revoke)

    logger.info(`Password reset successful`, { userId: user._id });
  }

  // ==================== EMAIL VERIFICATION ====================

  async verifyEmail(token) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      throw new AppError("Invalid or expired verification token", 400);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified`, { userId: user._id });
  }

  async resendVerificationEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.isEmailVerified) return;

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    logger.info(`Verification email resent`, { userId: user._id });
  }

  // ==================== DEVICE / SESSION MANAGEMENT ====================

  async getActiveSessions(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user.getActiveSessions();
  }

  async getDeviceHistory(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user.getDeviceHistory();
  }

  async logoutDevice(userId, deviceId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // Sirf active (non-revoked) session count karo
    const exists = user.refreshTokens.some(
      (t) => t.deviceId === deviceId && !t.isRevoked
    );
    if (!exists) throw new AppError("Session not found for this device", 404);

    await user.removeDeviceSessionById(deviceId);

    logger.info(`Device logged out`, { userId, deviceId });
    return { deviceId };
  }

  // ==================== ADMIN ====================

  async getAllUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = -1,
      role,
      isActive,
      search,
    } = options;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async adminUpdateUser(userId, updateData, adminId) {
    const allowedUpdates = ["role", "isActive", "isEmailVerified"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    updates.updatedBy = adminId;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new AppError("User not found", 404);

    // Deactivate -> saare sessions revoke
    if (updates.isActive === false) {
      await user.removeAllDeviceSessions();
    }

    logger.info(`Admin updated user`, {
      adminId,
      targetUserId: userId,
      updates,
    });
    return user.profile;
  }

  async deleteUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.isActive = false;
    user.updatedBy = adminId;

    await user.removeAllDeviceSessions();

    logger.info(`User deactivated`, { adminId, targetUserId: userId });
    return { message: "User deactivated successfully" };
  }

  // ==================== STATS ====================

  async getUserStats() {
    const [total, active, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    };
  }
}

export const authService = new AuthService();