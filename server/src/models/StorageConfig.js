// backend/src/models/StorageConfig.js
import mongoose from 'mongoose';

const storageConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  primaryStorage: {
    type: String,
    enum: ['local', 'cloud', 'external'],
    default: 'local'
  },
  localStorage: {
    enabled: {
      type: Boolean,
      default: true
    },
    maxSize: {
      type: Number, // in GB
      default: 50
    },
    currentSize: {
      type: Number,
      default: 0
    },
    path: {
      type: String,
      default: './storage/recordings'
    },
    autoDelete: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysToKeep: {
        type: Number,
        default: 30
      }
    }
  },
  cloudStorage: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['aws', 'gcp', 'azure', 'digitalocean', 'dropbox', 'google-drive']
    },
    credentials: {
      type: Map,
      of: String
    },
    bucketName: String,
    region: String,
    maxSize: {
      type: Number,
      default: 100
    }
  },
  externalStorage: {
    enabled: {
      type: Boolean,
      default: false
    },
    devices: [{
      deviceId: String,
      name: String,
      path: String,
      type: {
        type: String,
        enum: ['hdd', 'ssd', 'usb', 'nas']
      },
      maxSize: Number,
      connected: {
        type: Boolean,
        default: false
      },
      lastConnected: Date
    }]
  },
  recordingSettings: {
    defaultFormat: {
      type: String,
      enum: ['mp4', 'mkv', 'mov', 'avi'],
      default: 'mp4'
    },
    defaultResolution: {
      type: String,
      enum: ['720p', '1080p', '4K'],
      default: '1080p'
    },
    autoStartRecording: {
      type: Boolean,
      default: false
    },
    keepOriginalAudio: {
      type: Boolean,
      default: true
    },
    motionDetection: {
      enabled: {
        type: Boolean,
        default: true
      },
      sensitivity: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      }
    }
  },
  nvrSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    devices: [{
      deviceId: String,
      name: String,
      ipAddress: String,
      port: Number,
      username: String,
      password: String,
      cameras: [{
        cameraId: String,
        name: String,
        channel: Number,
        enabled: {
          type: Boolean,
          default: true
        }
      }],
      status: {
        type: String,
        enum: ['connected', 'disconnected', 'error'],
        default: 'disconnected'
      }
    }]
  },
  retentionPolicy: {
    enabled: {
      type: Boolean,
      default: false
    },
    maxAge: {
      type: Number, // in days
      default: 90
    },
    maxStorageUsage: {
      type: Number, // percentage
      default: 85
    }
  }
}, {
  timestamps: true
});

export const StorageConfig = mongoose.model('StorageConfig', storageConfigSchema);