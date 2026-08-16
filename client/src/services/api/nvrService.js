// frontend/src/services/nvrService.js

import api from "../api";

export const nvrService = {
  // Get all NVR devices
  async getDevices() {
    const response = await api.get('/nvr');
    return response.data;
  },

  // Get single NVR device
  async getDevice(deviceId) {
    const response = await api.get(`/nvr/${deviceId}`);
    return response.data;
  },

  // Add NVR device
  async addDevice(deviceData) {
    const response = await api.post('/nvr', deviceData);
    return response.data;
  },

  // Update NVR device
  async updateDevice(deviceId, data) {
    const response = await api.put(`/nvr/${deviceId}`, data);
    return response.data;
  },

  // Delete NVR device
  async deleteDevice(deviceId) {
    const response = await api.delete(`/nvr/${deviceId}`);
    return response.data;
  },

  // Test connection
  async testConnection(deviceId) {
    const response = await api.post(`/nvr/${deviceId}/test`);
    return response.data;
  },

  // Start NVR recording
  async startRecording(params) {
    const response = await api.post('/nvr/start', params);
    return response.data;
  },

  // Stop NVR recording
  async stopRecording({ deviceId, cameraId }) {
    const response = await api.post(`/nvr/${deviceId}/${cameraId}/stop`);
    return response.data;
  },

  // Get camera stream
  async getCameraStream(deviceId, cameraId) {
    const response = await api.get(`/nvr/${deviceId}/${cameraId}/stream`);
    return response.data;
  }
};