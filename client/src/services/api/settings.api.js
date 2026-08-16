// services/api/api/settings.api.js
import api from "../api"; // Your base API instance

export const settingsApi = {
  // Get settings
  getSettings: async () => {
    try {
      const response = await api.get("/api/settings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create default settings
  createSettings: async (data) => {
    try {
      const response = await api.post("/api/settings", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update all settings
  updateSettings: async (data) => {
    try {
      const response = await api.put("/api/settings", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle 3rd level
  toggle3rdLevel: async (enabled) => {
    try {
      const response = await api.put("/api/settings/toggle-3rd-level", {
        enabled,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await api.put("/api/settings/change-password", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update storage
  updateStorage: async (fileSize) => {
    try {
      const response = await api.put("/api/settings/storage", { fileSize });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
