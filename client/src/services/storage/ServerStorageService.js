// client/src/services/storage/ServerStorageService.js
// ✅ YEH SERVER SE BAAT KARTA HAI - API CALLS

import apiClient from '@/services/api/client';

export class ServerStorageService {
  constructor() {
    this.FREE_LIMIT = 50 * 1024 * 1024 * 1024; // 50GB
  }

  // Recording server pe upload karo
  async save(blob, metadata) {
    const formData = new FormData();
    formData.append('file', blob, `${metadata.cameraName}_${Date.now()}.webm`);
    formData.append('metadata', JSON.stringify(metadata));

    // API CALL - Server pe bhej rahe hain
    const response = await apiClient.post('/api/recordings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.data;
  }

  // Server se sare recordings get karo
  async getAll() {
    const response = await apiClient.get('/api/recordings');
    return response.data.data;
  }

  // Server se delete karo
  async delete(id) {
    const response = await apiClient.delete(`/api/recordings/${id}`);
    return response.data.success;
  }

  // Server storage info get karo
  async getStorageInfo() {
    const response = await apiClient.get('/api/recordings/info');
    return response.data.data;
  }
}