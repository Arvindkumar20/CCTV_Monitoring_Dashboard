// backend/src/services/storageService.js
import { StorageConfig } from '../models/StorageConfig.js';
import fs from 'fs-extra';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { uploadFile } from '@google-cloud/storage';
import { getStorage } from 'firebase-admin/storage';

class StorageService {
  constructor() {
    this.awsClients = new Map();
  }

  async getStoragePath(userId, storageType, config, fileName) {
    switch (storageType) {
      case 'local':
        return await this.getLocalPath(userId, config, fileName);
      case 'cloud':
        return await this.getCloudPath(userId, config, fileName);
      case 'external':
        return await this.getExternalPath(userId, config, fileName);
      default:
        throw new Error('Invalid storage type');
    }
  }

  async getLocalPath(userId, config, fileName) {
    const basePath = config?.localStorage?.path || './storage/recordings';
    const userPath = path.join(basePath, userId);
    await fs.ensureDir(userPath);
    return path.join(userPath, fileName);
  }

  async getCloudPath(userId, config, fileName) {
    // This is a virtual path, actual upload happens in getRecordingFile
    return `cloud://${config.cloudStorage.bucketName}/${userId}/${fileName}`;
  }

  async getExternalPath(userId, config, fileName) {
    // Find first connected external device
    const device = config.externalStorage.devices.find(d => d.connected);
    if (!device) {
      throw new Error('No external storage device connected');
    }
    const userPath = path.join(device.path, userId);
    await fs.ensureDir(userPath);
    return path.join(userPath, fileName);
  }

  async checkStorageAvailability(userId, storageType, config) {
    if (!config) {
      config = await StorageConfig.findOne({ userId });
    }

    switch (storageType) {
      case 'local': {
        const used = config.localStorage.currentSize || 0;
        const max = config.localStorage.maxSize * 1024 * 1024 * 1024; // GB to bytes
        return used < max * 0.9; // 90% threshold
      }
      case 'cloud': {
        if (!config.cloudStorage.enabled) return false;
        // Check cloud storage quota
        return true; // Implement actual check
      }
      case 'external': {
        const device = config.externalStorage.devices.find(d => d.connected);
        if (!device) return false;
        // Check device space
        const stats = await fs.stat(device.path);
        // fs.stat doesn't give free space, implement actual check
        return true;
      }
      default:
        return false;
    }
  }

  async getRecordingFile(recording, format) {
    // Convert format if needed
    if (format && format !== recording.format) {
      return await this.convertFormat(recording, format);
    }

    // Return file based on storage type
    if (recording.storageType === 'cloud') {
      return await this.downloadFromCloud(recording);
    } else if (recording.storageType === 'external') {
      return recording.storagePath;
    } else {
      return recording.storagePath;
    }
  }

  async convertFormat(recording, targetFormat) {
    const outputPath = recording.storagePath.replace(/\.\w+$/, `.${targetFormat}`);
    
    // Check if converted file exists
    if (await fs.pathExists(outputPath)) {
      return outputPath;
    }

    // Convert using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(recording.storagePath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return outputPath;
  }

  async downloadFromCloud(recording) {
    const tempPath = path.join('./temp', path.basename(recording.storagePath));
    await fs.ensureDir(path.dirname(tempPath));
    
    // Implement cloud download based on provider
    // This is a placeholder
    return tempPath;
  }

  async deleteRecording(recording) {
    try {
      // Delete file
      if (recording.storageType !== 'cloud') {
        await fs.remove(recording.storagePath);
      } else {
        // Delete from cloud
      }
      
      // Delete thumbnail
      if (recording.thumbnail && await fs.pathExists(recording.thumbnail)) {
        await fs.remove(recording.thumbnail);
      }
    } catch (error) {
      console.error('Error deleting recording file:', error);
      // Don't throw, just log
    }
  }

  async getStorageUsage(userId, config) {
    if (!config) {
      config = await StorageConfig.findOne({ userId });
    }

    const usage = {
      total: 0,
      used: 0,
      available: 0,
      breakdown: {}
    };

    // Local storage
    if (config.localStorage.enabled) {
      const used = config.localStorage.currentSize || 0;
      const max = config.localStorage.maxSize * 1024 * 1024 * 1024;
      usage.total += max;
      usage.used += used;
      usage.breakdown.local = {
        used,
        max,
        percentage: (used / max) * 100
      };
    }

    // Cloud storage
    if (config.cloudStorage.enabled) {
      // Get cloud usage
      const cloudUsed = 0; // Implement actual cloud usage check
      const cloudMax = config.cloudStorage.maxSize * 1024 * 1024 * 1024;
      usage.total += cloudMax;
      usage.used += cloudUsed;
      usage.breakdown.cloud = {
        used: cloudUsed,
        max: cloudMax,
        percentage: (cloudUsed / cloudMax) * 100
      };
    }

    // External storage
    config.externalStorage.devices.forEach(device => {
      if (device.connected) {
        // Get device usage
        const deviceUsed = 0; // Implement actual device usage check
        const deviceMax = device.maxSize * 1024 * 1024 * 1024;
        usage.total += deviceMax;
        usage.used += deviceUsed;
        usage.breakdown[`external_${device.deviceId}`] = {
          name: device.name,
          used: deviceUsed,
          max: deviceMax,
          percentage: (deviceUsed / deviceMax) * 100
        };
      }
    });

    usage.available = usage.total - usage.used;
    usage.percentage = (usage.used / usage.total) * 100;

    return usage;
  }

  async getStorageMetrics(userId, config) {
    const usage = await this.getStorageUsage(userId, config);
    
    return {
      ...usage,
      recommendations: this.getStorageRecommendations(usage),
      warnings: this.getStorageWarnings(usage)
    };
  }

  getStorageRecommendations(usage) {
    const recommendations = [];
    
    if (usage.percentage > 80) {
      recommendations.push('Storage is running low. Consider upgrading your storage plan or deleting old recordings.');
    }
    
    if (usage.breakdown.local && usage.breakdown.local.percentage > 85) {
      recommendations.push('Local storage is nearly full. Move some recordings to cloud or external storage.');
    }
    
    return recommendations;
  }

  getStorageWarnings(usage) {
    const warnings = [];
    
    if (usage.percentage > 90) {
      warnings.push('CRITICAL: Storage is almost full. New recordings will fail.');
    }
    
    return warnings;
  }
}

export const storageService = new StorageService();