

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import "dotenv/config";

import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// Import routes
import detectionRoutes from "./routes/detection.routes.js";
import cameraScheduleRoutes from "./routes/camera-schedule.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { categoryRouter } from "./routes/category.routes.js";
import { subCategoryRouter } from "./routes/subCategory.routes.js";
import { nestedSubCategoryRoutes } from "./routes/nestedSubCategory.routes.js";
import { cameraRoter } from "./routes/camera.routes.js";
import { guardianRouter } from "./routes/guardian.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { streamRouter } from "./routes/stream.routes.js";
import { settingsRoutes } from "./routes/settings.routes.js";
import { storageRouter } from "./routes/storageRoutes.js";
import { NVRRouter } from "./routes/nvrRoutes.js";
import { RecordingRoute } from "./routes/recordingRoutes.js";
import { fileURLToPath } from "url";
import { notificationRouter } from "./routes/notification.routes.js";
import { pushRouter } from "./routes/push.routes.js";
import { alertRouter } from "./routes/alert.routes.js";
import { startTokenCleanupJob } from "./jobs/tokenCleanup.job.js";
import { User } from "./models/user.model.js";

// Load env vars
dotenv.config();

const app = express();
// ==================== STATIC CLIENT ====================

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const clientDistPath = path.resolve(__dirname, "../../client/dist");

// console.log("📦 Client path:", clientDistPath);
// console.log("📦 Client exists:", fs.existsSync(clientDistPath));

// app.use(express.static(clientDistPath));

// ==================== DIRECTORY SETUP ====================
const uploadsDir = path.join(process.cwd(), "uploads");
const streamsDir = path.join(process.cwd(), "streams");
const detectionPath = path.join(process.cwd(), "detector-ai");

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Uploads directory created');
}

if (!fs.existsSync(streamsDir)) {
  fs.mkdirSync(streamsDir, { recursive: true });
  console.log('📁 Streams directory created');
}

// ==================== MIDDLEWARE ====================

// Body parser - increased limit for file uploads/camera data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Cookie parser for JWT cookies
app.use(cookieParser());

// ==================== CORS CONFIGURATION ====================
// IMPORTANT: CORS must be applied BEFORE any routes that need it

// Option 1: Using the cors package with custom configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Your frontend URL
  methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));




// ==================== STATIC FILE SERVING ====================
// Serve static files with CORS already applied via the cors middleware above
app.use("/uploads", express.static(uploadsDir));
app.use("/streams", express.static(streamsDir));
app.use("/detector-ai", express.static(detectionPath));




// ==================== SECURITY HEADERS ====================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        connectSrc: ["'self'", "*"],
        mediaSrc: ["'self'", "blob:", "*"], // Allow video streams
      },
    },
  })
);

// ==================== REQUEST LOGGING ====================
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}
// ✅ Production me client build serve karo
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));

  // SPA fallback — React Router ke liye
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}
// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/sub-categories", subCategoryRouter);
app.use("/api/nested-subcategories", nestedSubCategoryRoutes);
app.use("/api/cameras", cameraRoter);
app.use("/api/guardians", guardianRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/streams", streamRouter);
app.use('/api/storage', storageRouter);
app.use('/api/nvr', NVRRouter);
app.use('/api/recordings', RecordingRoute);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRouter);
app.use("/api/push", pushRouter);
app.use("/api/alert", alertRouter);
app.use("/api/detection", detectionRoutes);
app.use("/api/cameras-settings", cameraScheduleRoutes);

app.get("/api/system/status", (req, res) => {
  res.json({
    success: true,
    detection: {
      workers: detectionManager.getStatus(),
      totalWorkers: detectionManager.workers.size,
    },
    streams: {
      active: streamManager.streams.size,
      metrics: streamManager.getMetrics(),
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
// ==================== PUBLIC ROUTES ====================
app.use("/streams", express.static(path.join(process.cwd(), "streams"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".m3u8")) {
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (filePath.endsWith(".ts")) {
      res.setHeader("Content-Type", "video/mp2t");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  },
  etag: false,
  lastModified: false,
  maxAge: 0,
}));
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Test endpoint to verify API is working
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refreshToken: "POST /api/auth/refresh-token",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile",
      },
    },
  });
});

startTokenCleanupJob();


// ==================== ERROR HANDLING ====================

// 404 handler - This should be after all routes
app.use(notFound);

// Global error handler - This should be last
app.use(errorHandler);

export default app;







