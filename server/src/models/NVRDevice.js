// backend/src/models/NVRDevice.js
import mongoose from 'mongoose';

const nvrDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceName: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    enum: ['hikvision', 'dahua', 'ubiquiti', 'axis', 'generic'],
    default: 'generic'
  },
  ipAddress: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    default: 80
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    enum: ['rtsp', 'onvif', 'http', 'https'],
    default: 'onvif'
  },
  cameras: [{
    cameraId: String,
    name: String,
    channel: Number,
    streamUrl: String,
    resolution: String,
    enabled: {
      type: Boolean,
      default: true
    },
    recordingEnabled: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: Map,
      of: String
    }
  }],
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'connecting', 'error'],
    default: 'disconnected'
  },
  lastConnected: Date,
  errorMessage: String,
  totalCameras: {
    type: Number,
    default: 0
  },
  onlineCameras: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const NVRDevice = mongoose.model('NVRDevice', nvrDeviceSchema);