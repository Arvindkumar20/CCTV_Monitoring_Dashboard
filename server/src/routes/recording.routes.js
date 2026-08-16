// server/src/routes/recordingRoutes.js
// ✅ YEH API ROUTES HAIN - CLIENT INKO CALL KAREGA

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  deleteRecording,
  downloadRecording,
  getAllRecordings,
  getRecording,
  getStorageInfo,
  uploadRecording,
} from "../controllers/recording.controller.js";

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/webm", "video/mp4", "video/quicktime"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// ✅ API ENDPOINTS
router.post("/upload", upload.single("file"), uploadRecording);
router.get("/", getAllRecordings);
router.get("/info", getStorageInfo);
router.get("/:id", getRecording);
router.get("/download/:id", downloadRecording);
router.delete("/:id", deleteRecording);

export const recordingRoutes= router;
