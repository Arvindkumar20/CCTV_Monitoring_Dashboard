// frontend/src/services/storageService.js

import api from "../api";

export const storageService = {
  // Get storage configuration
  async getConfig() {
    const response = await api.get('/storage/config');
    return response.data;
  },

  // Update storage configuration
  async updateConfig(config) {
    const response = await api.put('/storage/config', config);
    return response.data;
  },

  // Get storage usage
  async getUsage() {
    const response = await api.get('/storage/usage');
    return response.data;
  },

  // Get storage metrics
  async getMetrics() {
    const response = await api.get('/storage/metrics');
    return response.data;
  },

  // Check storage availability
  async checkAvailability(storageType) {
    const response = await api.get(`/storage/availability/${storageType}`);
    return response.data;
  },

  // Connect external storage
  async connectExternal(deviceData) {
    const response = await api.post('/storage/external/connect', deviceData);
    return response.data;
  },

  // Disconnect external storage
  async disconnectExternal(deviceId) {
    const response = await api.post(`/storage/external/disconnect/${deviceId}`);
    return response.data;
  }
};