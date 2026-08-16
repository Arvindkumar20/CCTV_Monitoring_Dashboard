// server/src/controllers/recordingController.js
// ✅ YEH BUSINESS LOGIC HAI - DATABASE ME SAVE/DELETE KARTA HAI

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import RecordingModel from "../models/Recording.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_STORAGE = 50 * 1024 * 1024 * 1024; // 50GB

// Get total storage used from database
const getTotalStorageUsed = async () => {
  const result = await RecordingModel.aggregate([
    { $group: { _id: null, total: { $sum: "$size" } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// ✅ UPLOAD RECORDING - Database me save karo
export const uploadRecording = async (req, res) => {
  try {
    const { file, body } = req;
    const metadata = JSON.parse(body.metadata);

    // Check storage limit from database
    const used = await getTotalStorageUsed();
    if (used + file.size > MAX_STORAGE) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: "Storage limit exceeded. Maximum 50GB available.",
      });
    }

    // ✅ DATABASE ME SAVE KARO
    const recording = new RecordingModel({
      id: `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: file.filename,
      filePath: file.path,
      size: file.size,
      mimeType: file.mimetype,
      cameraName: metadata.cameraName || "Camera",
      duration: metadata.duration || 0,
      storageType: "server",
      timestamp: new Date(),
      metadata: metadata,
    });

    await recording.save(); // ✅ Database me save ho raha hai

    res.json({
      success: true,
      data: recording,
      message: "Recording uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};

// ✅ GET ALL RECORDINGS - Database se fetch karo
export const getAllRecordings = async (req, res) => {
  try {
    // ✅ DATABASE SE FETCH KARO
    const recordings = await RecordingModel.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: recordings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SINGLE RECORDING
export const getRecording = async (req, res) => {
  try {
    const recording = await RecordingModel.findOne({ id: req.params.id });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    res.json({
      success: true,
      data: recording,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE RECORDING - Database se delete karo
export const deleteRecording = async (req, res) => {
  try {
    const recording = await RecordingModel.findOne({ id: req.params.id });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    // File system se delete karo
    if (fs.existsSync(recording.filePath)) {
      fs.unlinkSync(recording.filePath);
    }

    // ✅ DATABASE SE DELETE KARO
    await RecordingModel.deleteOne({ id: req.params.id });

    res.json({
      success: true,
      message: "Recording deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DOWNLOAD RECORDING
export const downloadRecording = async (req, res) => {
  try {
    const recording = await RecordingModel.findOne({ id: req.params.id });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    res.download(
      recording.filePath,
      `${recording.cameraName || "recording"}.webm`,
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET STORAGE INFO - Database se calculate karo
export const getStorageInfo = async (req, res) => {
  try {
    const used = await getTotalStorageUsed();
    const totalFiles = await RecordingModel.countDocuments();

    res.json({
      success: true,
      data: {
        total: MAX_STORAGE,
        used: used,
        available: Math.max(0, MAX_STORAGE - used),
        files: totalFiles,
        limit: MAX_STORAGE,
        isFree: true,
        percentUsed: (used / MAX_STORAGE) * 100,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
