import api from "../api";

class DashboardApi {
  /**
   * Get complete dashboard data
   * @returns {Promise} - Promise with dashboard data
   */
  async getDashboardData() {
    const response = await api.get("/api/dashboard");
    return response.data;
  }

  /**
   * Get camera statistics only
   * @returns {Promise} - Promise with camera stats
   */
  async getCameraStats() {
    const response = await api.get("/api/dashboard/cameras");
    return response.data;
  }

  /**
   * Get guardian statistics only
   * @returns {Promise} - Promise with guardian stats
   */
  async getGuardianStats() {
    const response = await api.get("/api/dashboard/guardians");
    return response.data;
  }

  /**
   * Get category statistics only
   * @returns {Promise} - Promise with category stats
   */
  async getCategoryStats() {
    const response = await api.get("/api/dashboard/categories");
    return response.data;
  }

  /**
   * Get recent activities
   * @returns {Promise} - Promise with recent activities
   */
  async getRecentActivities() {
    const response = await api.get("/api/dashboard/activities");
    return response.data;
  }
}

export const dashboardApi = new DashboardApi();