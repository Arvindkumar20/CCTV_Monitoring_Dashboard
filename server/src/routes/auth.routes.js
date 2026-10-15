// import express from 'express';
// import { 
//   register, 
//   login, 
//   refreshToken, 
//   logout, 
//   getProfile,
//   updateProfile,
//   changePassword
// } from '../controllers/auth.controller.js';
// import { 
//   registerValidation, 
//   loginValidation,
//   updateProfileValidation,
//   changePasswordValidation
// } from '../validations/auth.validation.js';
// import { validate } from '../middlewares/validation.middleware.js';
// import { authenticate } from '../middlewares/auth.middleware.js';

// const router = express.Router();

// // Public routes with validation
// router.post('/register', validate(registerValidation), register);
// router.post('/login', validate(loginValidation), login);

// // Protected routes (all routes below this will require authentication)
// router.post('/refresh-token', refreshToken);
// router.use(authenticate);
// router.get('/profile', getProfile);
// router.patch('/profile', validate(updateProfileValidation), updateProfile);
// router.post('/change-password', validate(changePasswordValidation), changePassword);
// router.post('/logout', logout);

// export default router;



// src/routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  updateAlertPreferences,
  getSocketToken,
} from "../controllers/auth.controller.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/socket-token", authenticate, getSocketToken);
// ==================== PROTECTED ROUTES ====================
router.use(authenticate);

router.get("/profile", getProfile);
router.patch("/profile", validate(updateProfileValidation), updateProfile);
router.post(
  "/change-password",
  validate(changePasswordValidation),
  changePassword
);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.patch("/alert-preferences", authenticate, updateAlertPreferences);
export default router;