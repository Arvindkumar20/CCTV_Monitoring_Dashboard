// // import express from "express";
// // import dotenv from "dotenv";
// // import helmet from "helmet";
// // import cors from "cors";
// // import compression from "compression";
// // import cookieParser from "cookie-parser";
// // import path from "path";
// // import "dotenv/config";
// // console.log(process.env.MONGODB_URI);
// // import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// // // Import routes
// // import authRoutes from "./routes/auth.routes.js";
// // import { categoryRouter } from "./routes/category.routes.js";
// // import { subCategoryRouter } from "./routes/subCategory.routes.js";
// // import { nestedSubCategoryRoutes } from "./routes/nestedSubCategory.routes.js";
// // import { cameraRoter } from "./routes/camera.routes.js";
// // import { guardianRouter } from "./routes/guardian.routes.js";
// // import { dashboardRouter } from "./routes/dashboard.routes.js";
// // import { streamRouter } from "./routes/stream.routes.js";
// // import { settingsRoutes } from "./routes/settings.routes.js";
// // import { storageRouter } from "./routes/storageRoutes.js";
// // import { NVRRouter } from "./routes/nvrRoutes.js";
// // import { RecordingRoute } from "./routes/recordingRoutes.js";
// // // import webrtcService from "./services/webrtc.service.js";
// // // import { guardianRoute } from "./routes/guardian.js";
// // // import { sanitizeInputs } from "./middlewares/sanitize.js";

// // // Load env vars
// // dotenv.config();
// // const app = express();
// // // Body parser - increased limit for file uploads/camera data
// // app.use(express.json({ limit: "10mb" }));
// // app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// // app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// // app.use("/streams", express.static(path.join(process.cwd(), "streams")));
// // // Compression
// // app.use(compression());
// // // Sanitize data against XSS

// // // Cookie parser for JWT cookies
// // app.use(cookieParser());

// // // Set security headers
// // app.use(
// //   helmet({
// //     crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow camera images from different origins
// //     contentSecurityPolicy: {
// //       directives: {
// //         defaultSrc: ["'self'"],
// //         styleSrc: ["'self'", "'unsafe-inline'"],
// //         scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
// //         imgSrc: ["'self'", "data:", "blob:", "*"], // Allow camera streams
// //         connectSrc: ["'self'", "*"], // Allow WebSocket connections for live camera
// //       },
// //     },
// //   }),
// // );

// // // Enable CORS
// // app.use(
// //   cors({
// //     origin: process.env.CORS_ORIGIN,
// //     credentials: true, // Important for cookies
// //     optionsSuccessStatus: 200,
// //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// //     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// //   }),
// // );

// // // Request logging in development
// // if (process.env.NODE_ENV === "development") {
// //   app.use((req, res, next) => {
// //     console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
// //     next();
// //   });
// // }
// // // Initialize WebRTC service on server start
// // // await webrtcService.initialize();

// // // Graceful shutdown
// // // process.on('SIGTERM', async () => {
// // //   await webrtcService.cleanup();
// // //   process.exit(0);
// // // });

// // // process.on('SIGINT', async () => {
// // //   await webrtcService.cleanup();
// // //   process.exit(0);
// // // });
// // // Rate limiting
// // // Apply strict rate limiting to auth routes
// // // app.use('/api/auth', authLimiter);

// // // Apply general rate limiting to all other API routes
// // // app.use('/api', apiLimiter);

// // // ==================== ROUTES ====================

// // // Mount auth routes - THESE ARE THE IMPORTANT LINES
// // app.use("/api/auth", authRoutes);
// // app.use("/api/categories", categoryRouter);
// // app.use("/api/sub-categories", subCategoryRouter);
// // app.use("/api/nested-subcategories", nestedSubCategoryRoutes);
// // app.use("/api/cameras", cameraRoter);
// // // app.use("/api/guardian", guardianRoute);
// // app.use("/api/guardians", guardianRouter);
// // app.use("/api/dashboard", dashboardRouter);
// // app.use("/api/streams", streamRouter);
// // // app.use('/api/recordings', recordingRoutes);
// // app.use('/api/storage', storageRouter);
// // app.use('/api/nvr', NVRRouter);
// // app.use('/api/recording', RecordingRoute);


// // // Mount other routes as needed
// // // app.use('/api/users', userRoutes);
// // // app.use('/api/cameras', cameraRoutes);
// // // app.use('/api/recordings', recordingRoutes);
// // // app.use('/api/alerts', alertRoutes);
// // // app.use('/api/settings', settingsRoutes);

// // // ==================== PUBLIC ROUTES ====================

// // // Health check endpoint
// // app.get("/health", (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: "Server is running",
// //     timestamp: new Date().toISOString(),
// //     uptime: process.uptime(),
// //     environment: process.env.NODE_ENV,
// //     version: process.env.npm_package_version || "1.0.0",
// //   });
// // });
// // app.use("/api/settings", settingsRoutes);
// // // Test endpoint to verify auth routes are working
// // app.get("/api/test", (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: "API is working",
// //     endpoints: {
// //       auth: {
// //         register: "POST /api/auth/register",
// //         login: "POST /api/auth/login",
// //         refreshToken: "POST /api/auth/refresh-token",
// //         logout: "POST /api/auth/logout",
// //         profile: "GET /api/auth/profile",
// //       },
// //     },
// //   });
// // });

// // // Serve static files if needed (for camera snapshots, etc.)
// // // app.use('/uploads', express.static('uploads'));

// // // ==================== ERROR HANDLING ====================

// // // 404 handler - This should be after all routes
// // app.use(notFound);

// // // Global error handler - This should be last
// // app.use(errorHandler);

// // export default app;



// import express from "express";
// import dotenv from "dotenv";
// import helmet from "helmet";
// import cors from "cors";
// import compression from "compression";
// import cookieParser from "cookie-parser";
// import path from "path";
// import "dotenv/config";
// console.log(process.env.MONGODB_URI);
// import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// // Import routes
// import authRoutes from "./routes/auth.routes.js";
// import { categoryRouter } from "./routes/category.routes.js";
// import { subCategoryRouter } from "./routes/subCategory.routes.js";
// import { nestedSubCategoryRoutes } from "./routes/nestedSubCategory.routes.js";
// import { cameraRoter } from "./routes/camera.routes.js";
// import { guardianRouter } from "./routes/guardian.routes.js";
// import { dashboardRouter } from "./routes/dashboard.routes.js";
// import { streamRouter } from "./routes/stream.routes.js";
// import { settingsRoutes } from "./routes/settings.routes.js";
// import { storageRouter } from "./routes/storageRoutes.js";
// import { NVRRouter } from "./routes/nvrRoutes.js";
// import { RecordingRoute } from "./routes/recordingRoutes.js";

// // Load env vars
// dotenv.config();
// const app = express();

// // ✅ FIX: Ensure directories exist
// import fs from 'fs';
// const uploadsDir = path.join(process.cwd(), "uploads");
// const streamsDir = path.join(process.cwd(), "streams");

// // Create directories if they don't exist
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('📁 Uploads directory created');
// }

// if (!fs.existsSync(streamsDir)) {
//   fs.mkdirSync(streamsDir, { recursive: true });
//   console.log('📁 Streams directory created');
// }

// // Body parser - increased limit for file uploads/camera data
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // ✅ FIX: Serve static files with correct paths
// app.use("/uploads", express.static(uploadsDir));
// app.use("/streams", express.static(streamsDir));

// // Compression
// app.use(compression());

// // Cookie parser for JWT cookies
// app.use(cookieParser());

// // Set security headers
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//         imgSrc: ["'self'", "data:", "blob:", "*"],
//         connectSrc: ["'self'", "*"],
//       },
//     },
//   }),
// );

// // Enable CORS
// // app.use(
// //   cors({
// //     origin: process.env.CORS_ORIGIN || true,
// //     credentials: true,
// //     optionsSuccessStatus: 200,
// //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// //     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// //   }),
// // );


// // app.use(cors({
//   // origin: 'http://localhost:5173', // Allow only your frontend
//   // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   // allowedHeaders: ['Content-Type', 'Authorization'],
//   // credentials: true
// // }));



// const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.header('Access-Control-Allow-Origin', origin);
//   }
//   // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   // allowedHeaders: ['Content-Type', 'Authorization'],
//   // credentials: true
//   // ... rest of CORS headers
//   cors({
//     origin: 'http://localhost:5173', // Allow only your frontend
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
//   })
//   next();
// });




// // Request logging in development
// if (process.env.NODE_ENV === "development") {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
//     next();
//   });
// }

// // ==================== ROUTES ====================

// app.use("/api/auth", authRoutes);
// app.use("/api/categories", categoryRouter);
// app.use("/api/sub-categories", subCategoryRouter);
// app.use("/api/nested-subcategories", nestedSubCategoryRoutes);
// app.use("/api/cameras", cameraRoter);
// app.use("/api/guardians", guardianRouter);
// app.use("/api/dashboard", dashboardRouter);
// app.use("/api/streams", streamRouter);
// app.use('/api/storage', storageRouter);
// app.use('/api/nvr', NVRRouter);
// app.use('/api/recording', RecordingRoute);
// app.use("/api/settings", settingsRoutes);

// // ==================== PUBLIC ROUTES ====================

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV,
//     version: process.env.npm_package_version || "1.0.0",
//   });
// });

// // Test endpoint
// app.get("/api/test", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "API is working",
//     endpoints: {
//       auth: {
//         register: "POST /api/auth/register",
//         login: "POST /api/auth/login",
//         refreshToken: "POST /api/auth/refresh-token",
//         logout: "POST /api/auth/logout",
//         profile: "GET /api/auth/profile",
//       },
//     },
//   });
// });

// // ==================== ERROR HANDLING ====================

// app.use(notFound);
// app.use(errorHandler);

// export default app;




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

// Load env vars
dotenv.config();

const app = express();

// ==================== DIRECTORY SETUP ====================
const uploadsDir = path.join(process.cwd(), "uploads");
const streamsDir = path.join(process.cwd(), "streams");

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

// Option 2: Alternatively, use custom middleware for more control (uncomment if needed)
/*
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
*/

// ==================== STATIC FILE SERVING ====================
// Serve static files with CORS already applied via the cors middleware above
app.use("/uploads", express.static(uploadsDir));
app.use("/streams", express.static(streamsDir));

// Alternative: If you want explicit CORS headers for static files only
// You can use this custom middleware approach:
/*
const serveStaticWithCORS = (directory) => {
  return (req, res, next) => {
    // CORS headers are already set by the global middleware
    // This just serves the files
    express.static(directory)(req, res, next);
  };
};

app.use("/uploads", serveStaticWithCORS(uploadsDir));
app.use("/streams", serveStaticWithCORS(streamsDir));
*/

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

// ==================== PUBLIC ROUTES ====================

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

// ==================== ERROR HANDLING ====================

// 404 handler - This should be after all routes
app.use(notFound);

// Global error handler - This should be last
app.use(errorHandler);

export default app;