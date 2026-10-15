// import { authService } from '../services/auth.service.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import { successResponse } from '../utils/response.js';
// import AppError from '../utils/AppError.js';
// // import logger from '../config/logger.js';
// import { validateUserAccess } from '../utils/auth.utils.js';
// import { clearTokenCookies, setTokenCookies } from '../utils/jwt.utils.js';
// import userAgent from 'express-useragent';
// import { User } from '../models/user.model.js';

// /**
//  * @desc    Register new user
//  * @route   POST /api/auth/register
//  * @access  Public
//  */
// export const register = asyncHandler(async (req, res) => {
//   const ipAddress = req.ip || req.connection.remoteAddress;
  
//   const user = await authService.register(req.body, ipAddress);
  
//   return successResponse(res, 'Registration successful. Please verify your email.', user, 201);
// });

// /**
//  * @desc    Login user
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// export const login = asyncHandler(async (req, res) => {
//   const { mobile, password } = req.body;
//   const ipAddress = req.ip || req.connection.remoteAddress;

//   const userAgentString = req.headers['user-agent'];
//   const parsedUserAgent = userAgent.parse(userAgentString);
// // console.log(parsedUserAgent ,"controller me")

//   const { user, tokens } = await authService.login(
//     mobile, 
//     password, 
//     ipAddress, 
//     parsedUserAgent
//   );

//   // Set cookies
//   setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

//   return successResponse(res, 'Login successful', {
//     user,
//     accessToken: tokens.accessToken, // Also return in response for mobile apps
//   });
// });

// /**
//  * @desc    Get current user profile
//  * @route   GET /api/auth/profile
//  * @access  Private
//  */
// export const getProfile = asyncHandler(async (req, res) => {
//   const user = await authService.getProfile(req.user.userId);
  
//   return successResponse(res, 'Profile fetched successfully', user);
// });

// /**
//  * @desc    Update profile
//  * @route   PUT /api/auth/profile
//  * @access  Private
//  */
// export const updateProfile = asyncHandler(async (req, res) => {
//   const user = await authService.updateProfile(req.user.userId, req.body);
  
//   return successResponse(res, 'Profile updated successfully', user);
// });

// /**
//  * @desc    Change password
//  * @route   POST /api/auth/change-password
//  * @access  Private
//  */
// export const changePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
  
//   await authService.changePassword(req.user.userId, currentPassword, newPassword);
  
//   // Clear all cookies after password change
//   clearTokenCookies(res);
  
//   return successResponse(res, 'Password changed successfully. Please login again.');
// });

// /**
//  * @desc    Refresh access token
//  * @route   POST /api/auth/refresh-token
//  * @access  Public (with refresh token)
//  */
// export const refreshToken = asyncHandler(async (req, res) => {
//   const { refreshToken: token } = req.cookies;
//   console.log(token);
  
//   const ipAddress = req.ip || req.connection.remoteAddress;
//   if (!token) {
//     throw new AppError('Refresh token not found', 401);
//   }

//   const tokens = await authService.refreshToken(token, ipAddress);
  
//   setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

//   return successResponse(res, 'Token refreshed successfully', {
//     accessToken: tokens.accessToken,
//   });
// });

// /**
//  * @desc    Logout user
//  * @route   POST /api/auth/logout
//  * @access  Private
//  */
// export const logout = asyncHandler(async (req, res) => {
//   const refreshToken = req.cookies?.refreshToken;
  
//   await authService.logout(req.user.userId, refreshToken);
  
//   clearTokenCookies(res);
  
//   return successResponse(res, 'Logged out successfully');
// });

// /**
//  * @desc    Logout from all devices
//  * @route   POST /api/auth/logout-all
//  * @access  Private
//  */
// export const logoutAll = asyncHandler(async (req, res) => {
//   await authService.logoutAll(req.user.userId);
  
//   clearTokenCookies(res);
  
//   return successResponse(res, 'Logged out from all devices successfully');
// });

// /**
//  * @desc    Forgot password
//  * @route   POST /api/auth/forgot-password
//  * @access  Public
//  */
// export const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
  
//   await authService.forgotPassword(email);
  
//   return successResponse(
//     res, 
//     'If your email is registered, you will receive a password reset link'
//   );
// });

// /**
//  * @desc    Reset password
//  * @route   POST /api/auth/reset-password/:token
//  * @access  Public
//  */
// export const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;
  
//   await authService.resetPassword(token, password);
  
//   return successResponse(res, 'Password reset successful. Please login with new password');
// });

// /**
//  * @desc    Verify email
//  * @route   GET /api/auth/verify-email/:token
//  * @access  Public
//  */
// export const verifyEmail = asyncHandler(async (req, res) => {
//   const { token } = req.params;
  
//   await authService.verifyEmail(token);
  
//   return successResponse(res, 'Email verified successfully');
// });

// /**
//  * @desc    Resend verification email
//  * @route   POST /api/auth/resend-verification
//  * @access  Public
//  */
// export const resendVerification = asyncHandler(async (req, res) => {
//   const { email } = req.body;
  
//   await authService.resendVerificationEmail(email);
  
//   return successResponse(
//     res,
//     'If your email is registered and not verified, you will receive a verification link'
//   );
// });

// // ==================== ADMIN CONTROLLERS ====================

// /**
//  * @desc    Get all users (Admin only)
//  * @route   GET /api/auth/admin/users
//  * @access  Private/Admin
//  */
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const result = await authService.getAllUsers(req.query);
  
//   return successResponse(res, 'Users fetched successfully', result);
// });

// /**
//  * @desc    Get user by ID (Admin only)
//  * @route   GET /api/auth/admin/users/:id
//  * @access  Private/Admin
//  */
// export const getUserById = asyncHandler(async (req, res) => {
//   const user = await authService.getProfile(req.params.id);
  
//   return successResponse(res, 'User fetched successfully', user);
// });

// /**
//  * @desc    Update user (Admin only)
//  * @route   PUT /api/auth/admin/users/:id
//  * @access  Private/Admin
//  */
// export const adminUpdateUser = asyncHandler(async (req, res) => {
//   const user = await authService.adminUpdateUser(
//     req.params.id, 
//     req.body,
//     req.user.userId
//   );
  
//   return successResponse(res, 'User updated successfully', user);
// });

// /**
//  * @desc    Delete user (Admin only)
//  * @route   DELETE /api/auth/admin/users/:id
//  * @access  Private/Admin
//  */
// export const deleteUser = asyncHandler(async (req, res) => {
//   const result = await authService.deleteUser(req.params.id, req.user.userId);
  
//   return successResponse(res, 'User deactivated successfully', result);
// });

// /**
//  * @desc    Get user statistics (Admin only)
//  * @route   GET /api/auth/admin/stats
//  * @access  Private/Admin
//  */
// export const getUserStats = asyncHandler(async (req, res) => {
//   const stats = await authService.getUserStats();
  
//   return successResponse(res, 'Statistics fetched successfully', stats);
// });


// /**
//  * @desc    Update alert preferences
//  * @route   PATCH /api/auth/alert-preferences
//  * @access  Private
//  */
// export const updateAlertPreferences = asyncHandler(async (req, res) => {
//   const {
//     email, sms, whatsapp, call,
//     alertEmail, alertMobile, alertWhatsApp,
//     notificationsEnabled,
//   } = req.body;

//   const user = await User.findById(req.user.userId);
//   if (!user) throw new AppError("User not found", 404);

//   user.alertPreferences = {
//     email: email ?? user.alertPreferences?.email ?? true,
//     sms: sms ?? user.alertPreferences?.sms ?? true,
//     whatsapp: whatsapp ?? user.alertPreferences?.whatsapp ?? true,
//     call: call ?? user.alertPreferences?.call ?? false,
//     alertEmail: alertEmail ?? user.alertPreferences?.alertEmail,
//     alertMobile: alertMobile ?? user.alertPreferences?.alertMobile,
//     alertWhatsApp: alertWhatsApp ?? user.alertPreferences?.alertWhatsApp,
//   };

//   if (notificationsEnabled !== undefined) {
//     user.notificationsEnabled = notificationsEnabled;
//   }

//   await user.save();

//   return successResponse(res, "Alert preferences updated", {
//     alertPreferences: user.alertPreferences,
//     notificationsEnabled: user.notificationsEnabled,
//   });
// });


// // backend/controllers/auth.controller.js

// /**
//  * @desc    Get socket token (short-lived)
//  * @route   GET /api/auth/socket-token
//  * @access  Private
//  */
// export const getSocketToken = asyncHandler(async (req, res) => {
//   // ✅ Just return the current access token from cookie
//   const accessToken = req.cookies?.accessToken || req.cookies?.token;

//   if (!accessToken) {
//     throw new AppError("No access token found", 401);
//   }

//   return successResponse(res, "Socket token", { token: accessToken });
// });




// src/controllers/auth.controller.js
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import AppError from '../utils/AppError.js';
import { clearTokenCookies, setTokenCookies } from '../utils/jwt.utils.js';
import userAgent from 'express-useragent';
import { User } from '../models/user.model.js';
import crypto from 'crypto';

// ==================== HELPER ====================

/**
 * ✅ Build a stable deviceId from request
 * Priority: 1) req.body.deviceId  2) x-device-id header  3) hash of UA+IP
 */
const buildDeviceId = (req) => {
  if (req.body?.deviceId) return String(req.body.deviceId);
  if (req.headers['x-device-id']) return String(req.headers['x-device-id']);

  const ua = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';

  return crypto
    .createHash('sha256')
    .update(`${ua}-${ip}`)
    .digest('hex')
    .slice(0, 16);
};

/**
 * ✅ Extract parsed user-agent info safely
 */
const parseUA = (req) => {
  try {
    return userAgent.parse(req.headers['user-agent']) || {};
  } catch {
    return {};
  }
};

// ==================== PUBLIC ====================

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  const user = await authService.register(req.body, ipAddress);

  return successResponse(
    res,
    'Registration successful. Please verify your email.',
    user,
    201
  );
});

/**
 * @desc    Login user (multiple devices allowed)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const parsedUA = parseUA(req);
  const deviceId = buildDeviceId(req);

  // Attach computed fields to parsedUA (authService expects them)
  parsedUA.deviceId = deviceId;
  parsedUA.ipAddress = ipAddress;
  parsedUA.userAgentString = req.headers['user-agent'] || null;

  const { user, tokens, deviceId: returnedDeviceId } = await authService.login(
    mobile,
    password,
    ipAddress,
    parsedUA
  );

  // Set cookies (access + refresh)
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return successResponse(res, 'Login successful', {
    user,
    accessToken: tokens.accessToken, // for mobile apps
    deviceId: returnedDeviceId,      // frontend can persist this
  });
});

// ==================== PROFILE ====================

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.userId);
  return successResponse(res, 'Profile fetched successfully', user);
});

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.userId, req.body);
  return successResponse(res, 'Profile updated successfully', user);
});

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(
    req.user.userId,
    currentPassword,
    newPassword
  );

  // Password change → sabhi devices logout
  clearTokenCookies(res);

  return successResponse(
    res,
    'Password changed successfully. Please login again.'
  );
});

// ==================== TOKEN ====================

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (with refresh token cookie)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError('Refresh token not found', 401);
  }

  const ipAddress = req.ip || req.connection.remoteAddress;

  const tokens = await authService.refreshToken(token, ipAddress);

  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return successResponse(res, 'Token refreshed successfully', {
    accessToken: tokens.accessToken,
  });
});

// ==================== LOGOUT ====================

/**
 * @desc    Logout current device
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout(req.user.userId, refreshToken);

  clearTokenCookies(res);

  return successResponse(res, 'Logged out successfully');
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.userId);

  clearTokenCookies(res);

  return successResponse(res, 'Logged out from all devices successfully');
});

// ==================== DEVICE / SESSION MANAGEMENT ====================

/**
 * @desc    Get all active sessions (for Manage Devices UI)
 * @route   GET /api/auth/sessions
 * @access  Private
 */
export const getActiveSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const sessions = user.getActiveSessions();

  return successResponse(res, 'Active sessions fetched successfully', {
    count: sessions.length,
    sessions,
  });
});

/**
 * @desc    Get lifetime device login history
 * @route   GET /api/auth/device-history
 * @access  Private
 */
export const getDeviceHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const history = user.getDeviceHistory();

  return successResponse(res, 'Device history fetched successfully', {
    count: history.length,
    history,
  });
});

/**
 * @desc    Logout a specific device by deviceId
 * @route   DELETE /api/auth/sessions/:deviceId
 * @access  Private
 */
export const logoutDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  if (!deviceId) {
    throw new AppError('deviceId is required', 400);
  }

  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  const session = user.refreshTokens.find((t) => t.deviceId === deviceId);

  if (!session) {
    throw new AppError('Session not found for this device', 404);
  }

  await user.removeDeviceSessionById(deviceId);

  return successResponse(res, 'Device logged out successfully', { deviceId });
});

// ==================== PASSWORD RESET ====================

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  return successResponse(
    res,
    'If your email is registered, you will receive a password reset link'
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await authService.resetPassword(token, password);

  return successResponse(
    res,
    'Password reset successful. Please login with new password'
  );
});

// ==================== EMAIL VERIFICATION ====================

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  await authService.verifyEmail(token);

  return successResponse(res, 'Email verified successfully');
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.resendVerificationEmail(email);

  return successResponse(
    res,
    'If your email is registered and not verified, you will receive a verification link'
  );
});

// ==================== ADMIN ====================

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await authService.getAllUsers(req.query);
  return successResponse(res, 'Users fetched successfully', result);
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/auth/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.params.id);
  return successResponse(res, 'User fetched successfully', user);
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/auth/admin/users/:id
 * @access  Private/Admin
 */
export const adminUpdateUser = asyncHandler(async (req, res) => {
  const user = await authService.adminUpdateUser(
    req.params.id,
    req.body,
    req.user.userId
  );

  return successResponse(res, 'User updated successfully', user);
});

/**
 * @desc    Deactivate user (Admin only)
 * @route   DELETE /api/auth/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const result = await authService.deleteUser(req.params.id, req.user.userId);
  return successResponse(res, 'User deactivated successfully', result);
});

/**
 * @desc    Get user statistics (Admin only)
 * @route   GET /api/auth/admin/stats
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await authService.getUserStats();
  return successResponse(res, 'Statistics fetched successfully', stats);
});

// ==================== ALERT PREFERENCES ====================

/**
 * @desc    Update alert preferences
 * @route   PATCH /api/auth/alert-preferences
 * @access  Private
 */
export const updateAlertPreferences = asyncHandler(async (req, res) => {
  const {
    email,
    sms,
    whatsapp,
    call,
    alertEmail,
    alertMobile,
    alertWhatsApp,
    notificationsEnabled,
  } = req.body;

  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError('User not found', 404);

  user.alertPreferences = {
    email: email ?? user.alertPreferences?.email ?? true,
    sms: sms ?? user.alertPreferences?.sms ?? true,
    whatsapp: whatsapp ?? user.alertPreferences?.whatsapp ?? true,
    call: call ?? user.alertPreferences?.call ?? false,
    alertEmail: alertEmail ?? user.alertPreferences?.alertEmail,
    alertMobile: alertMobile ?? user.alertPreferences?.alertMobile,
    alertWhatsApp: alertWhatsApp ?? user.alertPreferences?.alertWhatsApp,
  };

  if (notificationsEnabled !== undefined) {
    user.notificationsEnabled = notificationsEnabled;
  }

  await user.save();

  return successResponse(res, 'Alert preferences updated', {
    alertPreferences: user.alertPreferences,
    notificationsEnabled: user.notificationsEnabled,
  });
});

// ==================== SOCKET ====================

/**
 * @desc    Get socket token (short-lived)
 * @route   GET /api/auth/socket-token
 * @access  Private
 */
export const getSocketToken = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken || req.cookies?.token;

  if (!accessToken) {
    throw new AppError('No access token found', 401);
  }

  return successResponse(res, 'Socket token', { token: accessToken });
});