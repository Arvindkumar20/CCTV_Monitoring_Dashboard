// import jwt from "jsonwebtoken";
// import logger from "../config/logger.js";
// import crypto from "crypto";
// import "dotenv/config";
// /**
//  * Generate access and refresh tokens
//  */

// export const generateTokens = (userId, role, sessionId = null) => {
//   try {
//     const payload = {
//       userId,
//       role,
//       sessionId: sessionId || crypto.randomBytes(16).toString("hex"),
//     };

//     // Access token - short lived
//     const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_ACCESS_EXPIRE || "1d",
//       audience: "your-app-audience",
//       issuer: "your-app-issuer",
//     });

//     // Refresh token - long lived
//     const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
//       expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
//       audience: "your-app-audience",
//       issuer: "your-app-issuer",
//     });

//     return { accessToken, refreshToken, sessionId: payload.sessionId };
//   } catch (error) {
//     console.log(error);
//     logger.error("Token generation error", { error: error.message, userId });
//     throw new Error("Failed to generate tokens");
//   }
// };

// /**
//  * Verify JWT token
//  */
// export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
//   try {
//     const decoded = jwt.verify(token, secret, {
//       audience: "your-app-audience",
//       issuer: "your-app-issuer",
//     });

//     return decoded;
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       logger.debug("Token expired");
//       return null;
//     }
//     if (error.name === "JsonWebTokenError") {
//       logger.debug("Invalid token", { error: error.message });
//       return null;
//     }

//     logger.error("Token verification error", { error: error.message });
//     return null;
//   }
// };

// /**
//  * Decode token without verification
//  */
// export const decodeToken = (token) => {
//   try {
//     return jwt.decode(token);
//   } catch (error) {
//     return null;
//   }
// };

// /**
//  * Set token cookies in response
//  */
// export const setTokenCookies = (res, accessToken, refreshToken) => {
//   console.log(accessToken);
//   const isProduction = process.env.NODE_ENV === "production" || "developement";
//   const sameSite = isProduction ? "None" : "lax";

//   // Access token cookie
//   res.cookie("accessToken", accessToken, {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite,
//     maxAge: 15 * 60 * 1000, // 15 minutes
//     path: "/",
//     // domain: isProduction ? process.env.CLIENT_URL : undefined,
//   });

//   // Refresh token cookie
//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite,
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     path: "/api/auth/refresh-token",
//     // path: "/", // Only nt // Only sent to refresh endpoint
//     // domain: isProduction ? process.env.CLIENT_URL : undefined,
//   });

//   // Optional: Non-httpOnly token for client-side (if needed)
//   if (!isProduction) {
//     res.cookie("accessTokenClient", accessToken, {
//       httpOnly: false,
//       secure: false,
//       sameSite,
//       maxAge: 15 * 60 * 1000,
//     });
//   }
// };

// /**
//  * Clear token cookies
//  */
// export const clearTokenCookies = (res) => {
//   const isProduction = process.env.NODE_ENV === "production";

//   res.clearCookie("accessToken", {
//     httpOnly: true,
//     secure: isProduction,
//     path: "/",
//     // domain: isProduction ? process.env.CLIENT_URL : undefined,
//   });

//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: isProduction,
//     path: "/api/auth/refresh-token",
//     // path: "/",
//     // domain: isProduction ? process.env.CLIENT_URL : undefined,
//   });

//   res.clearCookie("accessTokenClient", {
//     httpOnly: false,
//     // secure: false,
//     path: "/",
//   });
// };

// /**
//  * Extract token from request
//  */
// export const extractToken = (req) => {
//   // Check cookies first
//   let token = req.cookies?.accessToken;

//   // Check Authorization header
//   if (!token && req.headers.authorization) {
//     const authHeader = req.headers.authorization;
//     if (authHeader.startsWith("Bearer ")) {
//       token = authHeader.substring(7);
//     } else {
//       token = authHeader;
//     }
//   }

//   // Check query params (less secure, but sometimes needed)
//   if (!token && req.query?.token) {
//     token = req.query.token;
//   }

//   return token;
// };

// /**
//  * Refresh token validation
//  */
// export const isValidRefreshToken = (token) => {
//   console.log(token);
//   try {
//     const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
//     return !!decoded;
//   } catch {
//     return false;
//   }
// };

// /**
//  * Get token expiration time
//  */
// export const getTokenExpiry = (token) => {
//   try {
//     const decoded = jwt.decode(token);
//     return decoded?.exp ? new Date(decoded.exp * 1000) : null;
//   } catch {
//     return null;
//   }
// };




// src/utils/jwt.utils.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../config/logger.js";
import { env } from "../config/env.js";
import "dotenv/config";

// ==================== CONSTANTS ====================

const JWT_OPTIONS = {
  audience: env.JWT_AUDIENCE || "your-app-audience",
  issuer: env.JWT_ISSUER || "your-app-issuer",
};

const ACCESS_TOKEN_TTL = env.JWT_ACCESS_EXPIRE || "1d";
const REFRESH_TOKEN_TTL = env.JWT_REFRESH_EXPIRE || "7d";

// Cookie TTLs (in ms) — used for cookie maxAge
const ACCESS_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const isProduction = env.NODE_ENV === "production";

// ==================== GENERATE ====================

/**
 * Generate access + refresh tokens
 * @param {string|ObjectId} userId
 * @param {string} role
 * @param {string|null} sessionId
 * @returns {{ accessToken: string, refreshToken: string, sessionId: string }}
 */
export const generateTokens = (userId, role, sessionId = null) => {
  try {
    const finalSessionId =
      sessionId || crypto.randomBytes(16).toString("hex");

    const payload = {
      userId: String(userId),
      role,
      sessionId: finalSessionId,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
      ...JWT_OPTIONS,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
      ...JWT_OPTIONS,
    });

    if (!accessToken || !refreshToken) {
      throw new Error("Token generation returned empty");
    }

    return {
      accessToken,
      refreshToken,
      sessionId: finalSessionId,
    };
  } catch (error) {
    logger.error("Token generation error", {
      error: error.message,
      userId,
    });
    throw new Error("Failed to generate tokens");
  }
};

// ==================== VERIFY ====================

/**
 * Verify JWT token
 * @param {string} token
 * @param {string} secret - defaults to JWT_SECRET
 * @returns {Object|null} decoded payload or null
 */
export const verifyToken = (
  token,
  secret = env.JWT_SECRET
) => {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, secret, JWT_OPTIONS);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.debug("Token expired");
      return null;
    }
    if (error.name === "JsonWebTokenError") {
      logger.debug("Invalid token", { error: error.message });
      return null;
    }

    logger.error("Token verification error", { error: error.message });
    return null;
  }
};

/**
 * Verify refresh token specifically
 */
export const verifyRefreshToken = (token) => {
  return verifyToken(token, env.JWT_REFRESH_SECRET);
};

/**
 * Verify access token specifically
 */
export const verifyAccessToken = (token) => {
  return verifyToken(token, env.JWT_SECRET);
};

// ==================== DECODE ====================

/**
 * Decode token without verification (dangerous)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Get token expiry as Date
 */
export const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
};

// ==================== COOKIES ====================

/**
 * Set access + refresh token cookies
 * Access → path "/"  (sent to all routes)
 * Refresh → path "/api/auth/refresh-token"  (sent only to refresh endpoint)
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  // ✅ Development + production both supported
  const sameSite = isProduction ? "None" : "lax";
  const secure = isProduction;

  // Access token cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: "/",
  });

  // Refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    // ✅ Fixed: only sent to refresh endpoint
    path: "/api/auth/refresh-token",
  });

  // Non-httpOnly mirror for frontend (dev only)
  if (!isProduction) {
    res.cookie("accessTokenClient", accessToken, {
      httpOnly: false,
      secure: false,
      sameSite,
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: "/",
    });
  }
};

/**
 * Clear all auth cookies
 * ⚠️ path must match the path used in setTokenCookies()
 */
export const clearTokenCookies = (res) => {
  const secure = isProduction;
  const sameSite = isProduction ? "None" : "lax";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth/refresh-token",
  });

  // Also try clearing "/" path in case old cookies were set there
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  });

  res.clearCookie("accessTokenClient", {
    httpOnly: false,
    secure: false,
    sameSite,
    path: "/",
  });
};

// ==================== EXTRACT ====================

/**
 * Extract access token from request
 * Priority: cookie → Authorization header → query
 */
export const extractToken = (req) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;
  }

  if (!token && req.query?.token) {
    token = req.query.token;
  }

  return token || null;
};

/**
 * Extract refresh token from request
 * Priority: cookie → body
 */
export const extractRefreshToken = (req) => {
  return req.cookies?.refreshToken || req.body?.refreshToken || null;
};

// ==================== VALIDATION ====================

/**
 * Quick check if refresh token is valid (signature + expiry)
 */
export const isValidRefreshToken = (token) => {
  if (!token) return false;
  try {
    jwt.verify(token, env.JWT_REFRESH_SECRET, JWT_OPTIONS);
    return true;
  } catch {
    return false;
  }
};

/**
 * Quick check if access token is valid
 */
export const isValidAccessToken = (token) => {
  if (!token) return false;
  try {
    jwt.verify(token, env.JWT_SECRET, JWT_OPTIONS);
    return true;
  } catch {
    return false;
  }
};

// ==================== DEFAULT EXPORT ====================

export default {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  verifyAccessToken,
  decodeToken,
  getTokenExpiry,
  setTokenCookies,
  clearTokenCookies,
  extractToken,
  extractRefreshToken,
  isValidRefreshToken,
  isValidAccessToken,
};