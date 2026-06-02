// hooks/useSettings.js
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Mock data
const mockSettings = {
  schoolInfo: {
    schoolName: "St. Xavier's International School",
    schoolAddress: "Plot 12, Education Hub, South Delhi, India",
    schoolPhone: "+91 11 2345 6789",
    schoolEmail: "admin@stxaviers.edu.in",
  },
  preferences: {
    enable3rdLevel: true,
    passwordFormat: "first3+ddmm",
  },
  storage: {
    used: 375,
    total: 500,
  },
};

// Mock API functions
const fetchSettings = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return mockSettings;
};

const updateSettings = async (settings) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return settings;
};

const updateAdminPassword = async (passwordData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchSettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load settings");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load settings",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update school info
  const updateSchoolInfo = (field, value) => {
    setSettings(prev => ({
      ...prev,
      schoolInfo: {
        ...prev.schoolInfo,
        [field]: value,
      },
    }));
  };

  // Toggle 3rd level category
  const toggle3rdLevel = (enabled) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        enable3rdLevel: enabled,
      },
    }));
  };

  // Save all settings
  const saveAllSettings = async () => {
    try {
      setIsSaving(true);
      await updateSettings(settings);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Settings saved successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to save settings",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update admin password
  const updatePassword = async (passwordData) => {
    try {
      await updateAdminPassword(passwordData);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Admin password updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update password",
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    isSaving,
    updateSchoolInfo,
    toggle3rdLevel,
    saveAllSettings,
    updatePassword,
  };
};