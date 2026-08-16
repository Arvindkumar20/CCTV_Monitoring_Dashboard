// backend/src/controllers/storageController.js
import { StorageConfig } from '../models/StorageConfig.js';
import { storageService } from '../services/storageService.js';

export const storageController = {
  // Get storage configuration
  async getStorageConfig(req, res) {
    try {
      const userId = req.user.id;

      let config = await StorageConfig.findOne({ userId });
      
      if (!config) {
        // Create default config
        config = new StorageConfig({
          userId,
          localStorage: {
            enabled: true,
            maxSize: 50,
            currentSize: 0,
            path: './storage/recordings'
          }
        });
        await config.save();
      }

      res.json({
        success: true,
        config
      });
    } catch (error) {
      console.error('Error getting storage config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get storage configuration',
        error: error.message
      });
    }
  },

  // Update storage configuration
  async updateStorageConfig(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      let config = await StorageConfig.findOne({ userId });
      
      if (!config) {
        config = new StorageConfig({ userId });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (key in config) {
          if (typeof updates[key] === 'object') {
            config[key] = { ...config[key], ...updates[key] };
          } else {
            config[key] = updates[key];
          }
        }
      });

      await config.save();

      res.json({
        success: true,
        config
      });
    } catch (error) {
      console.error('Error updating storage config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update storage configuration',
        error: error.message
      });
    }
  },

  // Get storage usage
  async getStorageUsage(req, res) {
    try {
      const userId = req.user.id;

      const config = await StorageConfig.findOne({ userId });
      const usage = await storageService.getStorageUsage(userId, config);

      res.json({
        success: true,
        usage
      });
    } catch (error) {
      console.error('Error getting storage usage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get storage usage',
        error: error.message
      });
    }
  },

  // Check storage availability
  async checkStorageAvailability(req, res) {
    try {
      const userId = req.user.id;
      const { storageType } = req.params;

      const config = await StorageConfig.findOne({ userId });
      const available = await storageService.checkStorageAvailability(
        userId,
        storageType || config?.primaryStorage || 'local',
        config
      );

      res.json({
        success: true,
        available
      });
    } catch (error) {
      console.error('Error checking storage availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check storage availability',
        error: error.message
      });
    }
  },

  // Connect external storage
  async connectExternalStorage(req, res) {
    try {
      const userId = req.user.id;
      const { deviceName, path, type } = req.body;

      // Check if device exists
      const deviceExists = await fs.pathExists(path);
      if (!deviceExists) {
        return res.status(400).json({
          success: false,
          message: 'Device path not found'
        });
      }

      // Get storage config
      let config = await StorageConfig.findOne({ userId });
      if (!config) {
        config = new StorageConfig({ userId });
      }

      // Add device
      const device = {
        deviceId: `device_${Date.now()}`,
        name: deviceName,
        path,
        type: type || 'hdd',
        connected: true,
        lastConnected: new Date()
      };

      config.externalStorage.devices.push(device);
      config.externalStorage.enabled = true;
      await config.save();

      res.json({
        success: true,
        device
      });
    } catch (error) {
      console.error('Error connecting external storage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to connect external storage',
        error: error.message
      });
    }
  },

  // Disconnect external storage
  async disconnectExternalStorage(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const config = await StorageConfig.findOne({ userId });
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Storage config not found'
        });
      }

      const deviceIndex = config.externalStorage.devices.findIndex(
        d => d.deviceId === deviceId
      );

      if (deviceIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }

      config.externalStorage.devices[deviceIndex].connected = false;
      await config.save();

      res.json({
        success: true,
        message: 'Device disconnected successfully'
      });
    } catch (error) {
      console.error('Error disconnecting external storage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect external storage',
        error: error.message
      });
    }
  },

  // Get storage metrics
  async getStorageMetrics(req, res) {
    try {
      const userId = req.user.id;
      const config = await StorageConfig.findOne({ userId });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Storage config not found'
        });
      }

      const metrics = await storageService.getStorageMetrics(userId, config);

      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error('Error getting storage metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get storage metrics',
        error: error.message
      });
    }
  }
};