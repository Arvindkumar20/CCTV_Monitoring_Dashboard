// backend/src/services/recordingService.js
import { Recording } from '../models/Recording.js';
import { storageService } from './storageService.js';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

class RecordingService extends EventEmitter {
  activeRecordings = new Map();

  constructor() {
    super();
    // Setup ffmpeg path
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg');
  }

  async startRecording({ userId, childId, cameraId, format, resolution, storageType, config }) {
    const recordingId = uuidv4();
    const fileName = `recording_${Date.now()}_${childId}.${format}`;
    
    // Get storage path
    const storagePath = await storageService.getStoragePath(
      userId,
      storageType,
      config,
      fileName
    );

    // Create recording record
    const recording = new Recording({
      userId,
      childId,
      cameraId,
      recordingId,
      recordingName: `Recording ${new Date().toLocaleString()}`,
      startTime: new Date(),
      storageType,
      storagePath,
      format,
      resolution,
      status: 'recording'
    });

    await recording.save();

    // Start ffmpeg process
    const streamUrl = `rtsp://camera-${cameraId}/stream`; // This should come from camera config
    
    const process = ffmpeg(streamUrl)
      .inputOptions([
        '-rtsp_transport tcp',
        '-timeout 3000000'
      ])
      .outputOptions([
        '-c:v libx264',
        '-preset veryfast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .output(storagePath)
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
        this.emit('recording:started', { recordingId, userId, childId });
      })
      .on('progress', (progress) => {
        // Update duration
        recording.duration = progress.timemark;
      })
      .on('end', async () => {
        try {
          // Get file size
          const stats = await fs.stat(storagePath);
          recording.fileSize = stats.size;
          recording.endTime = new Date();
          recording.status = 'completed';
          await recording.save();
          
          this.activeRecordings.delete(recordingId);
          this.emit('recording:completed', { recordingId, userId, childId });
        } catch (error) {
          console.error('Error finalizing recording:', error);
        }
      })
      .on('error', async (err) => {
        console.error('FFmpeg error:', err);
        recording.status = 'failed';
        await recording.save();
        this.activeRecordings.delete(recordingId);
        this.emit('recording:failed', { recordingId, userId, childId, error: err.message });
      });

    // Store process reference
    this.activeRecordings.set(recordingId, {
      process,
      recording,
      startTime: Date.now()
    });

    return recording;
  }

  async stopRecording(recordingId, userId) {
    const active = this.activeRecordings.get(recordingId);
    if (!active) {
      throw new Error('Recording not active');
    }

    // Stop ffmpeg process
    active.process.kill('SIGTERM');

    return active.recording;
  }

  async getRecordingStatus(recordingId) {
    const active = this.activeRecordings.get(recordingId);
    if (active) {
      const duration = Math.floor((Date.now() - active.startTime) / 1000);
      return {
        status: 'recording',
        duration,
        recording: active.recording
      };
    }

    // Check database
    const recording = await Recording.findOne({ recordingId });
    if (!recording) {
      throw new Error('Recording not found');
    }

    return {
      status: recording.status,
      duration: recording.duration,
      recording
    };
  }

  async cleanup() {
    // Clean up any stale recordings
    for (const [recordingId, active] of this.activeRecordings) {
      const elapsed = Date.now() - active.startTime;
      if (elapsed > 24 * 60 * 60 * 1000) { // 24 hours
        console.log('Cleaning up stale recording:', recordingId);
        active.process.kill('SIGTERM');
        this.activeRecordings.delete(recordingId);
      }
    }
  }

  async generateThumbnail(recordingId) {
    const recording = await Recording.findOne({ recordingId });
    if (!recording) {
      throw new Error('Recording not found');
    }

    const thumbnailPath = recording.storagePath.replace(/\.\w+$/, '_thumb.jpg');
    
    await new Promise((resolve, reject) => {
      ffmpeg(recording.storagePath)
        .screenshots({
          count: 1,
          folder: path.dirname(thumbnailPath),
          filename: path.basename(thumbnailPath),
          size: '320x180'
        })
        .on('end', resolve)
        .on('error', reject);
    });

    recording.thumbnail = thumbnailPath;
    await recording.save();

    return thumbnailPath;
  }
}

export const recordingService = new RecordingService();