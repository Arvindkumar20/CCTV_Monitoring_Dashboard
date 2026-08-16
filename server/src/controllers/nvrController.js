// backend/src/controllers/nvrController.js
import { NVRDevice } from '../models/NVRDevice.js';
import { nvrService } from '../services/nvrService.js';
import { recordingService } from '../services/recordingService.js';

export const nvrController = {
  // Add NVR device
  async addNVRDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceName, brand, ipAddress, port, username, password, protocol } = req.body;

      // Test connection
      const testResult = await nvrService.testConnection({
        ipAddress,
        port: port || 80,
        username,
        password,
        protocol: protocol || 'onvif'
      });

      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to connect to NVR',
          error: testResult.error
        });
      }

      // Get cameras
      const cameras = await nvrService.getCameras({
        ipAddress,
        port: port || 80,
        username,
        password,
        protocol: protocol || 'onvif'
      });

      const nvrDevice = new NVRDevice({
        userId,
        deviceName,
        brand: brand || 'generic',
        ipAddress,
        port: port || 80,
        username,
        password,
        protocol: protocol || 'onvif',
        cameras: cameras.map((cam, index) => ({
          cameraId: `cam_${Date.now()}_${index}`,
          name: cam.name || `Camera ${index + 1}`,
          channel: cam.channel || index,
          streamUrl: cam.streamUrl || null,
          resolution: cam.resolution || '1080p',
          enabled: true,
          recordingEnabled: false
        })),
        totalCameras: cameras.length,
        connectionStatus: 'connected',
        lastConnected: new Date()
      });

      await nvrDevice.save();

      res.status(201).json({
        success: true,
        nvrDevice
      });
    } catch (error) {
      console.error('Error adding NVR device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add NVR device',
        error: error.message
      });
    }
  },

  // Get NVR devices
  async getNVRDevices(req, res) {
    try {
      const userId = req.user.id;

      const devices = await NVRDevice.find({ userId });

      res.json({
        success: true,
        devices
      });
    } catch (error) {
      console.error('Error getting NVR devices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get NVR devices',
        error: error.message
      });
    }
  },

  // Get NVR device by ID
  async getNVRDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      res.json({
        success: true,
        device
      });
    } catch (error) {
      console.error('Error getting NVR device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get NVR device',
        error: error.message
      });
    }
  },

  // Update NVR device
  async updateNVRDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;
      const updates = req.body;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (key !== '_id' && key !== 'userId' && key !== '__v') {
          if (key === 'cameras') {
            // Handle camera updates
            updates.cameras.forEach(updatedCam => {
              const existingCam = device.cameras.find(
                cam => cam.cameraId === updatedCam.cameraId
              );
              if (existingCam) {
                Object.assign(existingCam, updatedCam);
              }
            });
          } else {
            device[key] = updates[key];
          }
        }
      });

      await device.save();

      res.json({
        success: true,
        device
      });
    } catch (error) {
      console.error('Error updating NVR device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update NVR device',
        error: error.message
      });
    }
  },

  // Delete NVR device
  async deleteNVRDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      await device.deleteOne();

      res.json({
        success: true,
        message: 'NVR device deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting NVR device:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete NVR device',
        error: error.message
      });
    }
  },

  // Start NVR camera recording
  async startNVRRecording(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, cameraId, format, resolution, storageType } = req.body;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      const camera = device.cameras.find(cam => cam.cameraId === cameraId);
      if (!camera) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found'
        });
      }

      // Start recording from NVR stream
      const recording = await nvrService.startRecording({
        device,
        camera,
        format,
        resolution,
        storageType
      });

      // Update camera recording status
      camera.recordingEnabled = true;
      await device.save();

      res.status(201).json({
        success: true,
        recording
      });
    } catch (error) {
      console.error('Error starting NVR recording:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start NVR recording',
        error: error.message
      });
    }
  },

  // Stop NVR camera recording
  async stopNVRRecording(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, cameraId } = req.params;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      const camera = device.cameras.find(cam => cam.cameraId === cameraId);
      if (!camera) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found'
        });
      }

      // Stop recording
      const recording = await nvrService.stopRecording({
        device,
        camera
      });

      // Update camera recording status
      camera.recordingEnabled = false;
      await device.save();

      res.json({
        success: true,
        recording
      });
    } catch (error) {
      console.error('Error stopping NVR recording:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop NVR recording',
        error: error.message
      });
    }
  },

  // Test NVR connection
  async testNVRConnection(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      const result = await nvrService.testConnection({
        ipAddress: device.ipAddress,
        port: device.port,
        username: device.username,
        password: device.password,
        protocol: device.protocol
      });

      // Update device status
      device.connectionStatus = result.success ? 'connected' : 'error';
      if (result.success) {
        device.lastConnected = new Date();
      } else {
        device.errorMessage = result.error;
      }
      await device.save();

      res.json({
        success: true,
        result
      });
    } catch (error) {
      console.error('Error testing NVR connection:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test NVR connection',
        error: error.message
      });
    }
  },

  // Get NVR camera streams
  async getNVRCameraStream(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, cameraId } = req.params;

      const device = await NVRDevice.findOne({ _id: deviceId, userId });

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'NVR device not found'
        });
      }

      const camera = device.cameras.find(cam => cam.cameraId === cameraId);
      if (!camera) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found'
        });
      }

      const streamUrl = await nvrService.getStreamUrl({
        device,
        camera
      });

      res.json({
        success: true,
        streamUrl
      });
    } catch (error) {
      console.error('Error getting NVR camera stream:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get NVR camera stream',
        error: error.message
      });
    }
  }
};