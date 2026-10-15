import api from "../api";

class AlertService {
  /**
   * ✅ Get all alerts (paginated)
   */
  async list(params = {}) {
    const { data } = await api.get("/api/alert",{params});
    console.log(data)
    return data;
  }

  /**
   * ✅ Get single alert
   */
  async getById(id) {
    const { data } = await api.get(`/api/alert/${id}`);
    return data;
  }

  /**
   * ✅ Get stats
   */
  async stats(days = 7) {
    const { data } = await api.get("/api/alert/stats", { params: { days } });
    return data;
  }

  /**
   * ✅ Get failed alerts
   */
  async failed(hours = 24) {
    const { data } = await api.get("/api/alert/failed", { params: { hours } });
    return data;
  }

  /**
   * ✅ Acknowledge alert
   */
  async acknowledge(id, notes = "") {
    const { data } = await api.patch(`/api/alert/${id}/acknowledge`, { notes });
    return data;
  }

  /**
   * ✅ Retry failed channels
   */
  async retry(id) {
    const { data } = await api.post(`/api/alert/${id}/retry`);
    return data;
  }

  /**
   * ✅ Delete alert
   */
  async remove(id) {
    const { data } = await api.delete(`/api/alert/${id}`);
    return data;
  }

  // ═══════════════════════════════════════════════════════════
  // NOTIFICATIONS (in-app)
  // ═══════════════════════════════════════════════════════════

  async notifications(params = {}) {
    const { data } = await api.get("/api/notifications", { params });
    return data;
  }

  async markRead(id) {
    const { data } = await api.patch(`/api/notifications/${id}/read`);
    return data;
  }

  async markAllRead() {
    const { data } = await api.patch("/api/notifications/read-all");
    return data;
  }

  async deleteNotification(id) {
    const { data } = await api.delete(`/api/notifications/${id}`);
    return data;
  }
}

export default new AlertService();