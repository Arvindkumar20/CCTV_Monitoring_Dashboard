// backend/src/models/Recording.js
import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  cameraId: {
    type: String,
    required: true
  },
  recordingName: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  fileSize: {
    type: Number // in bytes
  },
  storageType: {
    type: String,
    enum: ['local', 'cloud', 'external'],
    default: 'local'
  },
  storagePath: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['mp4', 'mkv', 'mov', 'avi'],
    default: 'mp4'
  },
  resolution: {
    type: String,
    enum: ['720p', '1080p', '4K'],
    default: '1080p'
  },
  status: {
    type: String,
    enum: ['recording', 'processing', 'completed', 'failed'],
    default: 'recording'
  },
  thumbnail: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
recordingSchema.index({ userId: 1, startTime: -1 });
recordingSchema.index({ childId: 1, status: 1 });
recordingSchema.index({ cameraId: 1 });

export const Recording = mongoose.model('Recording', recordingSchema);