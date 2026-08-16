import api from "../api";

class CameraApi {
  /**
   * Get all cameras with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with cameras data
   */
  async getAll(params = {}) {
    const response = await api.get("/api/cameras", { params });
    return response.data;
  }

  /**
   * Get camera by ID
   * @param {string} id - Camera ID
   * @returns {Promise} - Promise with camera data
   */
  async getById(id) {
    const response = await api.get(`/api/cameras/${id}`);
    return response.data;
  }

  /**
   * Create new camera
   * @param {Object} data - Camera data
   * @returns {Promise} - Promise with created camera
   */
  async create(data) {
    const response = await api.post("/api/cameras", data);
    return response.data;
  }

  /**
   * Update camera
   * @param {string} id - Camera ID
   * @param {Object} data - Updated camera data
   * @returns {Promise} - Promise with updated camera
   */
  async update(id, data) {
    const response = await api.patch(`/api/cameras/${id}`, data);
    return response.data;
  }

  /**
   * Delete camera
   * @param {string} id - Camera ID
   * @returns {Promise} - Promise with deletion result
   */
  async delete(id) {
    const response = await api.delete(`/api/cameras/${id}`);
    return response.data;
  }

  /**
   * Get cameras by main category
   * @param {string} mainCategoryId - Main category ID
   * @returns {Promise} - Promise with cameras data
   */
  async getByMainCategory(mainCategoryId) {
    const response = await api.get(`/api/cameras/by-main-category/${mainCategoryId}`);
    return response.data;
  }

  /**
   * Get cameras by sub category
   * @param {string} subCategoryId - Sub category ID
   * @returns {Promise} - Promise with cameras data
   */
  async getBySubCategory(subCategoryId) {
    const response = await api.get(`/api/cameras/by-sub-category/${subCategoryId}`);
    return response.data;
  }

  /**
   * Get cameras by nested sub category
   * @param {string} nestedSubCategoryId - Nested sub category ID
   * @returns {Promise} - Promise with cameras data
   */
  async getByNestedSubCategory(nestedSubCategoryId) {
    const response = await api.get(`/api/cameras/by-nested-sub-category/${nestedSubCategoryId}`);
    return response.data;
  }

  /**
   * Get cameras by category type
   * @param {string} categoryType - Category type (main/sub/nested)
   * @param {string} categoryId - Category ID
   * @returns {Promise} - Promise with cameras data
   */
  async getByCategory(categoryType, categoryId) {
    const response = await api.get(`/api/cameras/by-category/${categoryType}/${categoryId}`);
    return response.data;
  }

  /**
   * Toggle camera status
   * @param {string} id - Camera ID
   * @returns {Promise} - Promise with updated camera
   */
  async toggleStatus(id) {
    const response = await api.patch(`/api/cameras/${id}/toggle-status`);
    return response.data;
  }

  /**
   * Update stream status
   * @param {string} id - Camera ID
   * @param {string} status - Stream status (online/offline/unknown/connecting)
   * @returns {Promise} - Promise with updated camera
   */
  async updateStreamStatus(id, status) {
    const response = await api.patch(`/api/cameras/${id}/stream-status`, { status });
    return response.data;
  }

  /**
   * Bulk delete cameras
   * @param {Array} cameraIds - Array of camera IDs
   * @returns {Promise} - Promise with bulk delete result
   */
  async bulkDelete(cameraIds) {
    const response = await api.post("/api/cameras/bulk-delete", { 
      cameraIds 
    });
    return response.data;
  }

  /**
   * Bulk update camera status
   * @param {Array} cameraIds - Array of camera IDs
   * @param {string} status - New status (active/inactive/maintenance)
   * @returns {Promise} - Promise with bulk update result
   */
  async bulkUpdateStatus(cameraIds, status) {
    const response = await api.patch("/api/cameras/bulk-status", { 
      cameraIds, 
      status 
    });
    return response.data;
  }

  /**
   * Search cameras
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} - Promise with search results
   */
  async search(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await api.get("/api/cameras/search", { params });
    return response.data;
  }

  /**
   * Get camera statistics
   * @returns {Promise} - Promise with statistics
   */
  async getStats() {
    const response = await api.get("/api/cameras/stats");
    return response.data;
  }

  /**
   * Validate RTSP URL
   * @param {string} rtspUrl - RTSP URL to validate
   * @returns {Promise} - Promise with validation result
   */
  async validateRtspUrl(rtspUrl) {
    const response = await api.post("/api/cameras/validate-rtsp", { rtspUrl });
    return response.data;
  }

  /**
   * Get camera by RTSP URL
   * @param {string} rtspUrl - RTSP URL
   * @returns {Promise} - Promise with camera data
   */
  async getByRtspUrl(rtspUrl) {
    const encodedUrl = encodeURIComponent(rtspUrl);
    const response = await api.get(`/api/cameras/by-rtsp/${encodedUrl}`);
    return response.data;
  }

  /**
   * Get recent cameras
   * @param {number} limit - Number of cameras to fetch
   * @returns {Promise} - Promise with recent cameras
   */
  async getRecent(limit = 10) {
    const response = await api.get("/api/cameras/recent", { 
      params: { limit } 
    });
    return response.data;
  }

  /**
   * Get stream summary
   * @returns {Promise} - Promise with stream summary
   */
  async getStreamSummary() {
    const response = await api.get("/api/cameras/stream-summary");
    return response.data;
  }

  /**
   * Export cameras
   * @param {string} format - Export format (json/csv)
   * @param {Object} filters - Export filters
   * @returns {Promise} - Promise with exported data
   */
  async exportCameras(format = "json", filters = {}) {
    const params = { format, ...filters };
    const response = await api.get("/api/cameras/export", { params });
    return response.data;
  }

  /**
   * ============================================
   * STREAM MANAGEMENT API CALLS
   * ============================================
   */

  /**
   * Start HLS stream for a camera
   * @param {string} cameraId - Camera ID
   * @returns {Promise} - Promise with stream start result
   */
  async startStream(cameraId) {
    const response = await api.post(`/api/cameras/${cameraId}/stream/start`);
    return response.data;
  }

  /**
   * Stop HLS stream for a camera
   * @param {string} cameraId - Camera ID
   * @returns {Promise} - Promise with stream stop result
   */
  async stopStream(cameraId) {
    const response = await api.post(`/api/cameras/${cameraId}/stream/stop`);
    return response.data;
  }

  /**
   * Restart HLS stream for a camera
   * @param {string} cameraId - Camera ID
   * @returns {Promise} - Promise with stream restart result
   */
  async restartStream(cameraId) {
    const response = await api.post(`/api/cameras/${cameraId}/stream/restart`);
    return response.data;
  }

  /**
   * Get stream status for a camera
   * @param {string} cameraId - Camera ID
   * @returns {Promise} - Promise with stream status
   */
  async getStreamStatus(cameraId) {
    const response = await api.get(`/api/cameras/${cameraId}/stream/status`);
    return response.data;
  }

  /**
   * Get stream URL for viewing
   * @param {string} cameraId - Camera ID
   * @param {string} clientId - Optional client ID
   * @returns {Promise} - Promise with stream URL
   */
  async getStreamUrl(cameraId, clientId) {
    const params = clientId ? { clientId } : {};
    const response = await api.get(`/api/cameras/${cameraId}/stream/url`, { params });
    return response.data;
  }

  /**
   * Get all active streams
   * @returns {Promise} - Promise with active streams list
   */
  async getActiveStreams() {
    const response = await api.get("/api/cameras/streams/active");
    return response.data;
  }

  /**
   * Get stream dashboard statistics
   * @returns {Promise} - Promise with dashboard stats
   */
  async getStreamDashboardStats() {
    const response = await api.get("/api/cameras/streams/dashboard-stats");
    return response.data;
  }

  /**
   * Client disconnected from stream
   * @param {string} clientId - Client ID
   * @returns {Promise} - Promise with disconnect result
   */
  async clientDisconnect(clientId) {
    const response = await api.post("/api/cameras/streams/client-disconnect", { clientId });
    return response.data;
  }

  /**
   * Clean up inactive streams (Admin only)
   * @returns {Promise} - Promise with cleanup result
   */
  async cleanupInactiveStreams() {
    const response = await api.post("/api/cameras/streams/cleanup");
    return response.data;
  }
}

export const cameraApi = new CameraApi();