// backend/src/controllers/recordingController.js
import { Recording } from "../models/Recording.js";
import { StorageConfig } from "../models/StorageConfig.js";
import { recordingService } from "../services/recordingService.js";
import { storageService } from "../services/storageService.js";
import { nvrService } from "../services/nvrService.js";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const recordingController = {
  // Start recording
  async startRecording(req, res) {
    try {
      const { childId, cameraId, format, resolution, storageType } = req.body;
      const userId = req.user.id;
      console.log(cameraId);
      // Get user storage config
      const storageConfig = await StorageConfig.findOne({ userId });
      if (!storageConfig) {
        return res.status(400).json({
          success: false,
          message: "Storage configuration not found",
        });
      }

      // Check storage availability
      const storageAvailable = await storageService.checkStorageAvailability(
        userId,
        storageType || storageConfig.primaryStorage,
      );

      if (!storageAvailable) {
        return res.status(400).json({
          success: false,
          message: "Storage is full or unavailable",
        });
      }

      // Start recording
      const recording = await recordingService.startRecording({
        userId,
        childId,
        cameraId,
        format: format || storageConfig.recordingSettings.defaultFormat,
        resolution:
          resolution || storageConfig.recordingSettings.defaultResolution,
        storageType: storageType || storageConfig.primaryStorage,
        config: storageConfig,
      });

      res.status(201).json({
        success: true,
        recording,
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start recording",
        error: error.message,
      });
    }
  },

  // Stop recording
  async stopRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await recordingService.stopRecording(
        recordingId,
        userId,
      );

      res.json({
        success: true,
        recording,
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to stop recording",
        error: error.message,
      });
    }
  },

  // Get recordings list
  async getRecordings(req, res) {
    try {
      const userId = req.user.id;
      const {
        childId,
        cameraId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sort = "-startTime",
      } = req.query;

      const query = { userId };
      if (childId) query.childId = childId;
      if (cameraId) query.cameraId = cameraId;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [recordings, total] = await Promise.all([
        Recording.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Recording.countDocuments(query),
      ]);

      res.json({
        success: true,
        recordings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting recordings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recordings",
        error: error.message,
      });
    }
  },

  // Download recording
  async downloadRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;
      const { format } = req.query;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Get file path from storage service
      const filePath = await storageService.getRecordingFile(recording, format);

      // Increment download count
      await Recording.findByIdAndUpdate(recordingId, {
        $inc: { downloadCount: 1 },
      });

      res.download(
        filePath,
        `${recording.recordingName}.${format || recording.format}`,
      );
    } catch (error) {
      console.error("Error downloading recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to download recording",
        error: error.message,
      });
    }
  },

  // Delete recording
  async deleteRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Delete file from storage
      await storageService.deleteRecording(recording);

      // Delete from database
      await Recording.findByIdAndDelete(recordingId);

      res.json({
        success: true,
        message: "Recording deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete recording",
        error: error.message,
      });
    }
  },

  // Get recording stats
  async getRecordingStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await Recording.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalRecordings: { $sum: 1 },
            totalSize: { $sum: "$fileSize" },
            avgDuration: { $avg: "$duration" },
            totalDuration: { $sum: "$duration" },
          },
        },
      ]);

      // Get storage usage
      const storageConfig = await StorageConfig.findOne({ userId });
      const storageUsage = await storageService.getStorageUsage(
        userId,
        storageConfig,
      );

      res.json({
        success: true,
        stats: stats[0] || {
          totalRecordings: 0,
          totalSize: 0,
          avgDuration: 0,
          totalDuration: 0,
        },
        storageUsage,
      });
    } catch (error) {
      console.error("Error getting recording stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recording stats",
        error: error.message,
      });
    }
  },

  // Get active recordings
  async getActiveRecordings(req, res) {
    try {
      const userId = req.user.id;

      const recordings = await Recording.find({
        userId,
        status: "recording",
      }).select("childId cameraId startTime recordingName");

      res.json({
        success: true,
        activeRecordings: recordings,
      });
    } catch (error) {
      console.error("Error getting active recordings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get active recordings",
        error: error.message,
      });
    }
  },
  // backend/src/controllers/recordingController.js (additional methods)

  // Get recording by ID
  async getRecordingById(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      res.json({
        success: true,
        recording,
      });
    } catch (error) {
      console.error("Error getting recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recording",
        error: error.message,
      });
    }
  },

  // Update recording metadata
  async updateRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Allowed fields to update
      const allowedUpdates = ["recordingName", "metadata", "isArchived"];
      allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
          recording[field] = updates[field];
        }
      });

      await recording.save();

      res.json({
        success: true,
        recording,
      });
    } catch (error) {
      console.error("Error updating recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update recording",
        error: error.message,
      });
    }
  },

  // Generate thumbnail
  async generateThumbnail(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      const thumbnailPath =
        await recordingService.generateThumbnail(recordingId);

      res.json({
        success: true,
        thumbnail: thumbnailPath,
      });
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate thumbnail",
        error: error.message,
      });
    }
  },

  // Bulk delete recordings
  async bulkDeleteRecordings(req, res) {
    try {
      const userId = req.user.id;
      const { recordingIds } = req.body;

      if (
        !recordingIds ||
        !Array.isArray(recordingIds) ||
        recordingIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "No recording IDs provided",
        });
      }

      const recordings = await Recording.find({
        _id: { $in: recordingIds },
        userId,
      });

      // Delete files
      for (const recording of recordings) {
        await storageService.deleteRecording(recording);
      }

      // Delete from database
      await Recording.deleteMany({
        _id: { $in: recordingIds },
        userId,
      });

      res.json({
        success: true,
        message: `${recordings.length} recordings deleted successfully`,
      });
    } catch (error) {
      console.error("Error bulk deleting recordings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete recordings",
        error: error.message,
      });
    }
  },

  // Export recordings
  async exportRecordings(req, res) {
    try {
      const userId = req.user.id;
      const { childId, startDate, endDate } = req.query;

      const query = { userId, status: "completed" };
      if (childId) query.childId = childId;
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
      }

      const recordings = await Recording.find(query).lean();

      // Create export data
      const exportData = {
        totalRecordings: recordings.length,
        totalSize: recordings.reduce((sum, r) => sum + (r.fileSize || 0), 0),
        recordings: recordings.map((r) => ({
          name: r.recordingName,
          date: r.startTime,
          duration: r.duration,
          size: r.fileSize,
          resolution: r.resolution,
          format: r.format,
        })),
      };

      res.json({
        success: true,
        exportData,
      });
    } catch (error) {
      console.error("Error exporting recordings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export recordings",
        error: error.message,
      });
    }
  },

  // Get stream URL for preview
  async getStreamUrl(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Generate a temporary stream URL
      const streamUrl = await storageService.getStreamUrl(recording);

      res.json({
        success: true,
        streamUrl,
      });
    } catch (error) {
      console.error("Error getting stream URL:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get stream URL",
        error: error.message,
      });
    }
  },

  // Get recording segments
  async getRecordingSegments(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Get segments from storage service
      const segments = await storageService.getRecordingSegments(recording);

      res.json({
        success: true,
        segments,
      });
    } catch (error) {
      console.error("Error getting recording segments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recording segments",
        error: error.message,
      });
    }
  },

  // Trim recording
  async trimRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;
      const { startTime, endTime } = req.body;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Trim using ffmpeg
      const trimmedPath = await recordingService.trimRecording(
        recording,
        startTime,
        endTime,
      );

      // Create new recording record for trimmed version
      const trimmedRecording = new Recording({
        userId,
        childId: recording.childId,
        cameraId: recording.cameraId,
        recordingName: `${recording.recordingName}_trimmed`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: (endTime - startTime) / 1000,
        storageType: recording.storageType,
        storagePath: trimmedPath,
        format: recording.format,
        resolution: recording.resolution,
        status: "completed",
      });

      await trimmedRecording.save();

      res.json({
        success: true,
        recording: trimmedRecording,
      });
    } catch (error) {
      console.error("Error trimming recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to trim recording",
        error: error.message,
      });
    }
  },

  // Merge recordings
  async mergeRecordings(req, res) {
    try {
      const userId = req.user.id;
      const { recordingIds, name, format } = req.body;

      if (
        !recordingIds ||
        !Array.isArray(recordingIds) ||
        recordingIds.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "At least 2 recordings required to merge",
        });
      }

      // Get all recordings
      const recordings = await Recording.find({
        _id: { $in: recordingIds },
        userId,
        status: "completed",
      });

      if (recordings.length !== recordingIds.length) {
        return res.status(404).json({
          success: false,
          message: "Some recordings not found",
        });
      }

      // Merge recordings using ffmpeg
      const mergedPath = await recordingService.mergeRecordings(
        recordings,
        name || "merged_recording",
        format || "mp4",
      );

      // Create merged recording record
      const mergedRecording = new Recording({
        userId,
        childId: recordings[0].childId,
        cameraId: recordings[0].cameraId,
        recordingName: name || "Merged Recording",
        startTime: recordings[0].startTime,
        endTime: recordings[recordings.length - 1].endTime,
        duration: recordings.reduce((sum, r) => sum + (r.duration || 0), 0),
        storageType: recordings[0].storageType,
        storagePath: mergedPath,
        format: format || "mp4",
        resolution: recordings[0].resolution,
        status: "completed",
        metadata: {
          mergedFrom: recordingIds,
        },
      });

      await mergedRecording.save();

      res.json({
        success: true,
        recording: mergedRecording,
      });
    } catch (error) {
      console.error("Error merging recordings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to merge recordings",
        error: error.message,
      });
    }
  },

  // Share recording
  async shareRecording(req, res) {
    try {
      const { recordingId } = req.params;
      const userId = req.user.id;
      const { expiryDays, password } = req.body;

      const recording = await Recording.findOne({
        _id: recordingId,
        userId,
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          message: "Recording not found",
        });
      }

      // Generate share token
      const shareToken = crypto.randomBytes(32).toString("hex");
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (expiryDays || 7));

      // Save share info (you'd store this in a separate collection)
      // For now, we'll just generate a URL
      const shareUrl = `${process.env.FRONTEND_URL}/share/${shareToken}`;

      res.json({
        success: true,
        shareUrl,
        expiryDate,
      });
    } catch (error) {
      console.error("Error sharing recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to share recording",
        error: error.message,
      });
    }
  },

  // Get recordings by date range
  async getRecordingsByDate(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, childId, cameraId } = req.query;

      const query = { userId };
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
      if (childId) query.childId = childId;
      if (cameraId) query.cameraId = cameraId;

      const recordings = await Recording.find(query)
        .sort({ startTime: 1 })
        .lean();

      res.json({
        success: true,
        recordings,
      });
    } catch (error) {
      console.error("Error getting recordings by date:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recordings",
        error: error.message,
      });
    }
  },

  // Get recordings by camera
  async getRecordingsByCamera(req, res) {
    try {
      const userId = req.user.id;
      const { cameraId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const recordings = await Recording.find({
        userId,
        cameraId,
      })
        .sort({ startTime: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .lean();

      const total = await Recording.countDocuments({
        userId,
        cameraId,
      });

      res.json({
        success: true,
        recordings,
        total,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      console.error("Error getting recordings by camera:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recordings",
        error: error.message,
      });
    }
  },

  // Get recordings by child
  async getRecordingsByChild(req, res) {
    try {
      const userId = req.user.id;
      const { childId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const recordings = await Recording.find({
        userId,
        childId,
      })
        .sort({ startTime: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .lean();

      const total = await Recording.countDocuments({
        userId,
        childId,
      });

      res.json({
        success: true,
        recordings,
        total,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      console.error("Error getting recordings by child:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recordings",
        error: error.message,
      });
    }
  },

  // Schedule recording
  async scheduleRecording(req, res) {
    try {
      const userId = req.user.id;
      const {
        childId,
        cameraId,
        scheduleName,
        startTime,
        endTime,
        recurrence,
        daysOfWeek,
        format,
        resolution,
        storageType,
      } = req.body;

      // Validate schedule
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Start time and end time are required",
        });
      }

      // Create schedule (store in separate collection)
      const schedule = {
        userId,
        childId,
        cameraId,
        scheduleName: scheduleName || `Schedule ${new Date().toLocaleString()}`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        recurrence: recurrence || "once",
        daysOfWeek: daysOfWeek || [],
        format: format || "mp4",
        resolution: resolution || "1080p",
        storageType: storageType || "local",
        active: true,
        createdAt: new Date(),
      };

      // For now, just return the schedule
      // In production, you'd save this to a Schedules collection
      // and run a cron job to check for scheduled recordings

      res.status(201).json({
        success: true,
        schedule,
        message: "Recording scheduled successfully",
      });
    } catch (error) {
      console.error("Error scheduling recording:", error);
      res.status(500).json({
        success: false,
        message: "Failed to schedule recording",
        error: error.message,
      });
    }
  },
};
