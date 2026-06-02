import api from "../api";

class ParentApi {
  /**
   * Login parent/guardian
   * @param {Object} credentials - { identifier, password }
   * @returns {Promise} - Login response with guardian data and streams
   */
  async login(credentials) {
    const response = await api.post("/api/guardians/login", credentials);
    return response.data;
  }

  /**
   * Logout parent/guardian
   * @returns {Promise} - Logout response
   */
  async logout() {
    const response = await api.post("/api/guardians/logout");
    return response.data;
  }

  /**
   * Get all streams for logged-in parent
   * @returns {Promise} - Streams data
   */
  async getStreams() {
    const response = await api.get("/api/parent/streams");
    return response.data;
  }

  /**
   * Start a specific camera stream
   * @param {string} cameraId - Camera ID
   * @returns {Promise} - Stream configuration
   */
  async startStream(cameraId) {
    const response = await api.post(`/api/parent/streams/start/${cameraId}`);
    return response.data;
  }

  /**
   * Stop a stream
   * @param {string} streamKey - Stream key
   * @returns {Promise} - Stop response
   */
  async stopStream(streamKey) {
    const response = await api.post(`/api/parent/streams/stop/${streamKey}`);
    return response.data;
  }

  /**
   * Get stream status
   * @param {string} streamKey - Stream key
   * @returns {Promise} - Stream status
   */
  async getStreamStatus(streamKey) {
    const response = await api.get(`/api/parent/streams/status/${streamKey}`);
    return response.data;
  }
}

export const parentApi = new ParentApi();