


// backend/server.js
import app from "./app.js";
import dotenv from "dotenv";
import "colors";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./config/database.js";
import Camera from "./models/camera.model.js";
import { detectionManager } from "./services/detection-service/detection-manager.service.js";
import { initializeSocket } from "./services/socket.service.js";
import { startTokenCleanupJob } from "./jobs/tokenCleanup.job.js";
import { startAlertRetryJob } from "./jobs/alertRetry.job.js";
// import { bootstrapAccessControl } from "./access-control-bootstrap.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// ✅ HTTP Server
const server = http.createServer(app);

// ✅ Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
     
    credentials: true,
  },
   transports: ["websocket", "polling"], // 🆕 ye add kar
  path: "/socket.io",
});

// ✅ Initialize socket service (auth + handlers)
initializeSocket(io);

// ✅ Detection manager → Socket broadcast
detectionManager.on("alert", (alert) => {
  // Ye already alert.service ke through emit ho raha hai per-user.
  // Ye line sirf admin dashboard ke liye global broadcast hai.
  io.to("admins").emit("detection:alert", alert);
  console.log(`📡 Admin broadcast: ${alert.type} @ ${alert.cameraName}`);
});

detectionManager.on("worker:failed", ({ cameraId, reason }) => {
  io.emit("detection:worker-failed", { cameraId, reason });
});

// // ✅ Detection bootstrap
async function bootstrapDetectionWorkers() {
  try {
    const cameras = await Camera.find({
      status: "active",
      rtspUrl: { $exists: true, $ne: "" },
    }).lean();

    console.log(`🔍 Bootstrapping detection for ${cameras.length} cameras`);

    for (const cam of cameras) {
      const cameraId = cam._id.toString();

      detectionManager.registerCameraMeta(cameraId, {
        name: cam.name,
        location: cam.location,
        userId: cam.createdBy, // ✅ IMPORTANT
        rtspUrl: cam.rtspUrl,
      });

      try {
        await detectionManager.startWorker(cameraId, cam.rtspUrl, {
          personConfidence: cam.detectionSettings?.personConfidence ?? 0.45,
          fireConfidence: cam.detectionSettings?.fireConfidence ?? 0.5,
          frameSampleRate: cam.detectionSettings?.frameSampleRate ?? 5,
          cooldownMs: cam.detectionSettings?.cooldownMs ?? 30_000,
        });
      } catch (err) {
        console.error(`❌ Worker failed for ${cam.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Bootstrap failed:", err);
  }
}

// ✅ Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected".green);
// await bootstrapAccessControl();  
    // ✅ Cron jobs
    startTokenCleanupJob();
    startAlertRetryJob();

    // ✅ Boot detection workers
    await bootstrapDetectionWorkers();

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      );
      console.log(`🔌 Socket.IO ready`.green);
    });
  } catch (err) {
    console.error(`❌ Startup failed: ${err.message}`.red);
    process.exit(1);
  }
};

startServer();

// ✅ Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection: ${err.message}`.red);
  server.close(() => process.exit(1));
});

// ✅ Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`.red);
  server.close(() => process.exit(1));
});

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing server".yellow);
  server.close(() => {
    console.log("HTTP server closed".yellow);
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed".yellow);
      process.exit(0);
    });
  });
});