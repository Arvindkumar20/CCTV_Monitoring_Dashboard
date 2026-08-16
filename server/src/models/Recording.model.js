// server/src/models/Recording.js
// ✅ YEH DATABASE SCHEMA HAI - MONGODB ME STORE HOGA

import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  cameraName: {
    type: String,
    default: 'Camera'
  },
  duration: {
    type: Number,
    default: 0
  },
  storageType: {
    type: String,
    default: 'server'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
recordingSchema.index({ timestamp: -1 });
recordingSchema.index({ cameraName: 1 });

export default mongoose.model('Recording', recordingSchema);