import api from "../api";

class GuardianApi {
  /**
   * Get all guardians with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with guardians data
   */
  async getAll(params = {}) {
    const response = await api.get("/api/guardians", { params });
    return response.data;
  }

  /**
   * Get guardian by ID
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with guardian data
   */
  async getById(id) {
    const response = await api.get(`/api/guardians/${id}`);
    return response.data;
  }

  /**
   * Create new guardian
   * @param {Object} data - Guardian data
   * @returns {Promise} - Promise with created guardian
   */
  async create(data) {
    const response = await api.post("/api/guardians", data);
    return response.data;
  }

  /**
   * Update guardian
   * @param {string} id - Guardian ID
   * @param {Object} data - Updated guardian data
   * @returns {Promise} - Promise with updated guardian
   */
  async update(id, data) {
    const response = await api.patch(`/api/guardians/${id}`, data);
    return response.data;
  }

  /**
   * Delete guardian
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with deletion result
   */
  async delete(id) {
    const response = await api.delete(`/api/guardians/${id}`);
    return response.data;
  }

  /**
   * Login guardian
   * @param {Object} credentials - Login credentials (identifier, password)
   * @returns {Promise} - Promise with login result
   */
  async login(credentials) {
    const response = await api.post("/api/guardians/login", credentials);
    return response.data;
  }

  /**
   * Get login history for a guardian
   * @param {string} id - Guardian ID
   * @param {Object} params - Query parameters (page, limit, status, fromDate, toDate)
   * @returns {Promise} - Promise with login history
   */
  async getLoginHistory(id, params = {}) {
    const response = await api.get(`/api/guardians/${id}/login-history`, { params });
    return response.data;
  }

  /**
   * Toggle guardian status
   * @param {string} id - Guardian ID
   * @param {string} status - New status (pending/active/inactive/locked/suspended)
   * @returns {Promise} - Promise with updated guardian
   */
  async toggleStatus(id, status) {
    const response = await api.patch(`/api/guardians/${id}/toggle-status`, { status });
    return response.data;
  }

  /**
   * Reset guardian password
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with reset result (new password)
   */
  async resetPassword(id,password) {
    const response = await api.post(`/api/guardians/${id}/reset-password`,{password});
    return response.data;
  }

  /**
   * Bulk delete guardians
   * @param {Array} guardianIds - Array of guardian IDs
   * @returns {Promise} - Promise with bulk delete result
   */
  async bulkDelete(guardianIds) {
    const response = await api.post("/api/guardians/bulk-delete", { 
      guardianIds 
    });
    return response.data;
  }

  /**
   * Bulk update guardian status
   * @param {Array} guardianIds - Array of guardian IDs
   * @param {string} status - New status (pending/active/inactive/locked/suspended)
   * @returns {Promise} - Promise with bulk update result
   */
  async bulkUpdateStatus(guardianIds, status) {
    const response = await api.patch("/api/guardians/bulk-status", { 
      guardianIds, 
      status 
    });
    return response.data;
  }

  /**
   * Bulk upload guardians from array
   * @param {Array} guardians - Array of guardian objects
   * @returns {Promise} - Promise with upload result
   */
  async bulkUpload(guardians) {
    const response = await api.post("/api/guardians/bulk-upload", { 
      guardians 
    });
    return response.data;
  }

  /**
   * Import guardians from file (Excel/CSV)
   * @param {File} file - File object (Excel or CSV)
   * @returns {Promise} - Promise with import result
   */
  async importFromFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/api/guardians/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Export guardians
   * @param {string} format - Export format (json/csv/excel)
   * @param {Object} filters - Export filters
   * @returns {Promise} - Promise with exported data
   */
  async exportGuardians(format = "json", filters = {}) {
    const params = { format, ...filters };
    const response = await api.get("/api/guardians/export", { params });
    return response.data;
  }

  /**
   * Search guardians
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters (class, section, status)
   * @returns {Promise} - Promise with search results
   */
  async search(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await api.get("/api/guardians/search", { params });
    return response.data;
  }

  /**
   * Get guardian statistics
   * @returns {Promise} - Promise with statistics
   */
  async getStats() {
    const response = await api.get("/api/guardians/stats");
    return response.data;
  }

  /**
   * Lookup guardian by mobile or email
   * @param {string} identifier - Mobile number or email
   * @returns {Promise} - Promise with guardian data
   */
  async lookup(identifier) {
    const response = await api.get("/api/guardians/lookup", { 
      params: { identifier } 
    });
    return response.data;
  }

  /**
   * Get recent guardians
   * @param {number} limit - Number of guardians to fetch
   * @returns {Promise} - Promise with recent guardians
   */
  async getRecent(limit = 10) {
    const response = await api.get("/api/guardians/recent", { 
      params: { limit } 
    });
    return response.data;
  }

  /**
   * Get guardians by class
   * @param {string} className - Class name
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Promise with guardians data
   */
  async getByClass(className, params = {}) {
    const response = await api.get(`/api/guardians/by-class/${className}`, { params });
    return response.data;
  }

  /**
   * Get guardians by section
   * @param {string} section - Section
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Promise with guardians data
   */
  async getBySection(section, params = {}) {
    const response = await api.get(`/api/guardians/by-section/${section}`, { params });
    return response.data;
  }

  /**
   * Get guardians by status
   * @param {string} status - Status (pending/active/inactive/locked/suspended)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Promise with guardians data
   */
  async getByStatus(status, params = {}) {
    const response = await api.get(`/api/guardians/by-status/${status}`, { params });
    return response.data;
  }

  /**
   * Get active guardians count
   * @returns {Promise} - Promise with count
   */
  async getActiveCount() {
    const response = await api.get("/api/guardians/stats/active");
    return response.data;
  }

  /**
   * Get pending guardians count
   * @returns {Promise} - Promise with count
   */
  async getPendingCount() {
    const response = await api.get("/api/guardians/stats/pending");
    return response.data;
  }

  /**
   * Get locked guardians count
   * @returns {Promise} - Promise with count
   */
  async getLockedCount() {
    const response = await api.get("/api/guardians/stats/locked");
    return response.data;
  }

  /**
   * Verify guardian email
   * @param {string} token - Verification token
   * @returns {Promise} - Promise with verification result
   */
  async verifyEmail(token) {
    const response = await api.post("/api/guardians/verify-email", { token });
    return response.data;
  }

  /**
   * Verify guardian mobile
   * @param {string} token - Verification token
   * @returns {Promise} - Promise with verification result
   */
  async verifyMobile(token) {
    const response = await api.post("/api/guardians/verify-mobile", { token });
    return response.data;
  }

  /**
   * Resend verification email
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with result
   */
  async resendVerificationEmail(id) {
    const response = await api.post(`/api/guardians/${id}/resend-verification-email`);
    return response.data;
  }

  /**
   * Resend verification SMS
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with result
   */
  async resendVerificationSms(id) {
    const response = await api.post(`/api/guardians/${id}/resend-verification-sms`);
    return response.data;
  }

  /**
   * Unlock guardian account
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with result
   */
  async unlockAccount(id) {
    const response = await api.post(`/api/guardians/${id}/unlock`);
    return response.data;
  }

  /**
   * Get login attempts summary
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with login attempts summary
   */
  async getLoginAttemptsSummary(id) {
    const response = await api.get(`/api/guardians/${id}/login-attempts-summary`);
    return response.data;
  }

  /**
   * Get device history
   * @param {string} id - Guardian ID
   * @returns {Promise} - Promise with device history
   */
  async getDeviceHistory(id) {
    const response = await api.get(`/api/guardians/${id}/devices`);
    return response.data;
  }

  /**
   * Revoke device access
   * @param {string} id - Guardian ID
   * @param {string} deviceId - Device ID
   * @returns {Promise} - Promise with result
   */
  async revokeDevice(id, deviceId) {
    const response = await api.delete(`/api/guardians/${id}/devices/${deviceId}`);
    return response.data;
  }

  /**
   * Download sample import file
   * @param {string} format - File format (csv/excel)
   * @returns {Promise} - Promise with file data
   */
  async downloadSampleFile(format = "csv") {
    const response = await api.get("/api/guardians/sample-import", { 
      params: { format },
      responseType: "blob" 
    });
    return response.data;
  }

  /**
   * Validate import data before upload
   * @param {Array} guardians - Array of guardian objects to validate
   * @returns {Promise} - Promise with validation results
   */
  async validateImport(guardians) {
    const response = await api.post("/api/guardians/validate-import", { guardians });
    return response.data;
  }
}

export const guardianApi = new GuardianApi();