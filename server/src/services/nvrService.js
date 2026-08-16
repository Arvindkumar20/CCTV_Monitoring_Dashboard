// backend/src/services/nvrService.js
import axios from 'axios';
import ONVIF  from 'onvif';
import { v4 as uuidv4 } from 'uuid';

class NVRService {
  constructor() {
    this.connections = new Map();
  }

  async testConnection({ ipAddress, port, username, password, protocol }) {
    try {
      if (protocol === 'onvif') {
        // Test ONVIF connection
        const onvif = new ONVIF({
          hostname: ipAddress,
          port: port || 80,
          username,
          password,
          path: '/onvif/device_service'
        });

        await new Promise((resolve, reject) => {
          onvif.getDeviceInformation((err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        });

        return { success: true };
      } else if (protocol === 'rtsp') {
        // Test RTSP connection
        const response = await axios.get(`rtsp://${username}:${password}@${ipAddress}:${port}/`, {
          timeout: 5000,
          validateStatus: false
        });
        return { success: response.status < 400 };
      } else {
        // HTTP/HTTPS
        const response = await axios.get(
          `${protocol}://${username}:${password}@${ipAddress}:${port}`,
          { timeout: 5000 }
        );
        return { success: response.status === 200 };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCameras({ ipAddress, port, username, password, protocol }) {
    try {
      if (protocol === 'onvif') {
        const onvif = new ONVIF({
          hostname: ipAddress,
          port: port || 80,
          username,
          password,
          path: '/onvif/device_service'
        });

        const cameras = await new Promise((resolve, reject) => {
          onvif.getProfiles((err, profiles) => {
            if (err) reject(err);
            else resolve(profiles);
          });
        });

        return cameras.map(profile => ({
          name: profile.Name || `Camera ${profile.token}`,
          channel: profile.token,
          streamUrl: `rtsp://${username}:${password}@${ipAddress}:${port}/Streaming/Channels/${profile.token}01`,
          resolution: profile.VideoEncoderConfiguration?.Resolution || '1080p'
        }));
      } else {
        // Generic RTSP or HTTP camera
        return [{
          name: 'Camera 1',
          channel: 1,
          streamUrl: `rtsp://${username}:${password}@${ipAddress}:${port}/stream`,
          resolution: '1080p'
        }];
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
      throw error;
    }
  }

  async startRecording({ device, camera, format, resolution, storageType }) {
    // This is a placeholder - actual implementation depends on NVR brand
    // For Hikvision, Dahua, etc. use their specific APIs
    
    const recordingId = uuidv4();
    
    // Generate recording URL based on NVR brand
    let streamUrl = '';
    if (device.brand === 'hikvision') {
      streamUrl = `http://${device.ipAddress}:${device.port}/ISAPI/Streaming/channels/${camera.channel}01/picture`;
    } else if (device.brand === 'dahua') {
      streamUrl = `http://${device.ipAddress}:${device.port}/cgi-bin/snapshot.cgi?channel=${camera.channel}&subtype=0`;
    } else {
      streamUrl = camera.streamUrl;
    }

    // Start recording using ffmpeg
    const recording = await this.recordStream({
      streamUrl,
      cameraName: camera.name,
      format,
      resolution,
      storageType
    });

    return {
      recordingId,
      ...recording
    };
  }

  async recordStream({ streamUrl, cameraName, format, resolution, storageType }) {
    // Implementation using ffmpeg
    // Similar to recordingService.startRecording
    return {
      status: 'recording',
      startTime: new Date()
    };
  }

  async stopRecording({ device, camera }) {
    // Stop the recording
    // Implementation depends on recording service
    return {
      status: 'completed'
    };
  }

  async getStreamUrl({ device, camera }) {
    // Generate stream URL based on NVR brand and camera
    if (device.brand === 'hikvision') {
      return `rtsp://${device.username}:${device.password}@${device.ipAddress}:${device.port}/Streaming/Channels/${camera.channel}01`;
    } else if (device.brand === 'dahua') {
      return `rtsp://${device.username}:${device.password}@${device.ipAddress}:${device.port}/cam/realmonitor?channel=${camera.channel}&subtype=0`;
    } else if (device.brand === 'ubiquiti') {
      return `rtsp://${device.username}:${device.password}@${device.ipAddress}:${device.port}/s0`;
    } else {
      return camera.streamUrl;
    }
  }

  async getCameraStatus({ device, camera }) {
    try {
      // Check camera status based on brand
      const streamUrl = await this.getStreamUrl({ device, camera });
      const response = await axios.head(streamUrl, { timeout: 3000 });
      return {
        online: response.status === 200,
        status: 'online'
      };
    } catch (error) {
      return {
        online: false,
        status: 'offline',
        error: error.message
      };
    }
  }
}

export const nvrService = new NVRService();