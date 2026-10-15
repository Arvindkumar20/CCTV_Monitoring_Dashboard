const path = require("path");
const isProd = process.env.NODE_ENV === "production";
const apps = [
  // detector-ai — hamesha
  {
    name: "detector-ai",
    cwd: path.join(__dirname, "server/detector-ai"),
    script: "./venv/bin/python",
    args: "detector.py",
    interpreter: "none",
    env: {
      NODE_ENV: isProd ? "production" : "development",
      DETECTOR_HOST: "0.0.0.0",
      DETECTOR_PORT: 8765,
      DETECTOR_PERSON_MODEL: "yolo11s.pt",
      DETECTOR_FIRE_MODEL: "fire_smoke_yolo.pt",
      DETECTOR_SNAPSHOT_DIR: isProd ? "/var/cctv/snapshots" : "./snapshots",
//       DETECTOR_PERSON_MODEL=yolo11s.pt
// DETECTOR_SAMPLE_RATE=3
// DETECTOR_COOLDOWN_S=10
    },
    out_file: "./logs/detector-out.log",
    error_file: "./logs/detector-err.log",
    merge_logs: true,
    time: true,
    autorestart: true,
    max_restarts: 20,
    restart_delay: 3000,
    max_memory_restart: "2G",
  },

  // backend — hamesha
  {
    name: "src",
    cwd: path.join(__dirname, "server"),
    script: "server.js",
    env: {
      NODE_ENV: isProd ? "production" : "development",
      PORT: 5000,
      MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cctv",
      DETECTOR_WS_URL: "ws://127.0.0.1:8765",
    },
    out_file: "./logs/backend-out.log",
    error_file: "./logs/backend-err.log",
    merge_logs: true,
    time: true,
    autorestart: true,
    max_restarts: 20,
    restart_delay: 2000,
    max_memory_restart: "1G",
  },
];

// ✅ Client sirf DEV me PM2 se — prod me backend serve karega
if (!isProd) {
  apps.push({
    name: "client",
    cwd: path.join(__dirname, "client"),
    script: "npm",
    args: "run dev",
    env: {
      NODE_ENV: "development",
      PORT: 3000,
      VITE_API_URL: "http://127.0.0.1:5000",
    },
    out_file: "./logs/client-out.log",
    error_file: "./logs/client-err.log",
    merge_logs: true,
    time: true,
    autorestart: true,
    max_restarts: 20,
    restart_delay: 2000,
    max_memory_restart: "1G",
  });
}

module.exports = { apps };
