// // hooks/useSettings.js
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";

// // Mock data
// const mockSettings = {
//   schoolInfo: {
//     schoolName: "St. Xavier's International School",
//     schoolAddress: "Plot 12, Education Hub, South Delhi, India",
//     schoolPhone: "+91 11 2345 6789",
//     schoolEmail: "admin@stxaviers.edu.in",
//   },
//   preferences: {
//     enable3rdLevel: true,
//     passwordFormat: "first3+ddmm",
//   },
//   storage: {
//     used: 375,
//     total: 500,
//   },
// };

// // Mock API functions
// const fetchSettings = async () => {
//   await new Promise((resolve) => setTimeout(resolve, 1500));
//   return mockSettings;
// };

// const updateSettings = async (settings) => {
//   await new Promise((resolve) => setTimeout(resolve, 1200));
//   return settings;
// };

// const updateAdminPassword = async (passwordData) => {
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   return { success: true };
// };

// export const useSettings = () => {
//   const [settings, setSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);

//   // Load settings
//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchSettings();
//         setSettings(data);
//         setError(null);
//       } catch (err) {
//         setError(err.message || "Failed to load settings");
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Failed to load settings",
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//           timer: 3000,
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();
//   }, []);

//   // Update school info
//   const updateSchoolInfo = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       schoolInfo: {
//         ...prev.schoolInfo,
//         [field]: value,
//       },
//     }));
//   };

//   // Toggle 3rd level category
//   const toggle3rdLevel = (enabled) => {
//     setSettings(prev => ({
//       ...prev,
//       preferences: {
//         ...prev.preferences,
//         enable3rdLevel: enabled,
//       },
//     }));
//   };

//   // Save all settings
//   const saveAllSettings = async () => {
//     try {
//       setIsSaving(true);
//       await updateSettings(settings);

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Settings saved successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Failed to save settings",
//       });
//       return false;
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Update admin password
//   const updatePassword = async (passwordData) => {
//     try {
//       await updateAdminPassword(passwordData);

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Admin password updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Failed to update password",
//       });
//       return false;
//     }
//   };

//   return {
//     settings,
//     loading,
//     error,
//     isSaving,
//     updateSchoolInfo,
//     toggle3rdLevel,
//     saveAllSettings,
//     updatePassword,
//   };
// };


// // hooks/useSettings.js
// import { useState, useEffect, useCallback, useContext } from "react";
// import Swal from "sweetalert2";
// import api from "@/services/api";
// import { AuthContext } from "@/context/AuthContext";

// const STORAGE_KEY = "school_settings";
// const DEFAULT_SETTINGS = {
//   schoolInfo: {
//     schoolName: "",
//     schoolAddress: "",
//     schoolPhone: "",
//     schoolEmail: "",
//     schoolLogo: "",
//     schoolWebsite: "",
//   },
//   preferences: {
//     enable3rdLevel: false,
//     theme: "system",
//     language: "en",
//     timezone: "Asia/Kolkata",
//     passwordFormat: "first3+ddmm",
//   },
//   security: {
//     maxLoginAttempts: 5,
//     lockTime: 30,
//     passwordPolicy: {
//       minLength: 8,
//       requireSpecialChar: true,
//       requireNumber: true,
//       requireUppercase: true,
//     },
//   },
//   storage: {
//     total: 10737418240,
//     used: 0,
//     files: {
//       count: 0,
//       lastUpdated: null,
//     },
//   },
//   features: {
//     onlineAdmission: false,
//     onlinePayment: false,
//     attendance: true,
//     examModule: true,
//   },
// };

// export const useSettings = () => {
//   const { user, loading: authLoading } = useContext(AuthContext);
//   const [settings, setSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [useLocalStorage, setUseLocalStorage] = useState(false);

//   // Load from localStorage
//   const loadFromLocalStorage = useCallback(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         setSettings(parsed);
//         setError(null);
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error("Error loading from localStorage:", err);
//       return false;
//     }
//   }, []);

//   // Save to localStorage
//   const saveToLocalStorage = useCallback((data) => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//       return true;
//     } catch (err) {
//       console.error("Error saving to localStorage:", err);
//       return false;
//     }
//   }, []);

//   // Load Settings
//   const loadSettings = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Try API first
//       try {
//         const response = await api.get("/api/settings");
        
//         if (response.data?.success && response.data?.data) {
//           const apiData = response.data.data;
//           const mappedData = {
//             schoolInfo: {
//               schoolName: apiData.schoolInfo?.name || "",
//               schoolAddress: apiData.schoolInfo?.address || "",
//               schoolPhone: apiData.schoolInfo?.phone || "",
//               schoolEmail: apiData.schoolInfo?.email || "",
//               schoolLogo: apiData.schoolInfo?.logo || "",
//               schoolWebsite: apiData.schoolInfo?.website || "",
//             },
//             preferences: {
//               enable3rdLevel: apiData.preferences?.enable3rdLevel || false,
//               theme: apiData.preferences?.theme || "system",
//               language: apiData.preferences?.language || "en",
//               timezone: apiData.preferences?.timezone || "Asia/Kolkata",
//               passwordFormat: apiData.preferences?.passwordFormat || "first3+ddmm",
//             },
//             security: apiData.security || {},
//             storage: apiData.storage || { used: 0, total: 10737418240 },
//             features: apiData.features || {},
//           };
//           setSettings(mappedData);
//           saveToLocalStorage(mappedData);
//           setUseLocalStorage(false);
//           setError(null);
//           return;
//         }
//       } catch (apiErr) {
//         // If API fails, try localStorage
//         console.warn("API failed, using localStorage:", apiErr.message);
//         const hasLocalData = loadFromLocalStorage();
//         if (hasLocalData) {
//           setUseLocalStorage(true);
//           setError("Using local storage (API unavailable)");
//           return;
//         }
//         // No data anywhere
//         setSettings(null);
//         setError("No settings found. Please create default settings.");
//         setUseLocalStorage(true);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Failed to load settings");
//     } finally {
//       setLoading(false);
//     }
//   }, [loadFromLocalStorage, saveToLocalStorage]);

//   // Create Default Settings
//   const createDefaultSettings = useCallback(async () => {
//     try {
//       setIsSubmitting(true);
      
//       const defaultSettings = { ...DEFAULT_SETTINGS };

//       // Try API first
//       try {
//         const response = await api.post("/api/settings", defaultSettings);
//         if (response.data?.success) {
//           const apiData = response.data.data;
//           const mappedData = {
//             schoolInfo: {
//               schoolName: apiData.schoolInfo?.name || "",
//               schoolAddress: apiData.schoolInfo?.address || "",
//               schoolPhone: apiData.schoolInfo?.phone || "",
//               schoolEmail: apiData.schoolInfo?.email || "",
//               schoolLogo: apiData.schoolInfo?.logo || "",
//               schoolWebsite: apiData.schoolInfo?.website || "",
//             },
//             preferences: {
//               enable3rdLevel: apiData.preferences?.enable3rdLevel || false,
//               theme: apiData.preferences?.theme || "system",
//               language: apiData.preferences?.language || "en",
//               timezone: apiData.preferences?.timezone || "Asia/Kolkata",
//               passwordFormat: apiData.preferences?.passwordFormat || "first3+ddmm",
//             },
//             security: apiData.security || {},
//             storage: apiData.storage || { used: 0, total: 10737418240 },
//             features: apiData.features || {},
//           };
//           setSettings(mappedData);
//           saveToLocalStorage(mappedData);
//           setError(null);
//           setUseLocalStorage(false);
          
//           Swal.fire({
//             icon: "success",
//             title: "Settings Created",
//             text: "Default settings have been created successfully",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//           return true;
//         }
//       } catch (apiErr) {
//         // If API fails, save to localStorage
//         console.warn("API failed, saving to localStorage:", apiErr.message);
//         saveToLocalStorage(defaultSettings);
//         setSettings(defaultSettings);
//         setError("Settings saved to local storage (API unavailable)");
//         setUseLocalStorage(true);
        
//         Swal.fire({
//           icon: "success",
//           title: "Settings Created",
//           text: "Default settings saved to local storage",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//         return true;
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || err.message || "Failed to create default settings",
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [saveToLocalStorage]);

//   // Update School Info
//   const updateSchoolInfo = useCallback((field, value) => {
//     setSettings((prev) => {
//       if (!prev) return prev;
//       const updated = {
//         ...prev,
//         schoolInfo: {
//           ...prev.schoolInfo,
//           [field]: value,
//         },
//       };
//       // Auto-save to localStorage for persistence
//       if (useLocalStorage) {
//         saveToLocalStorage(updated);
//       }
//       return updated;
//     });
//   }, [useLocalStorage, saveToLocalStorage]);

//   // Toggle 3rd Level
//   const toggle3rdLevel = useCallback(async (enabled) => {
//     try {
//       setSettings((prev) => {
//         if (!prev) return prev;
//         const updated = {
//           ...prev,
//           preferences: {
//             ...prev.preferences,
//             enable3rdLevel: enabled,
//           },
//         };
//         if (useLocalStorage) {
//           saveToLocalStorage(updated);
//         }
//         return updated;
//       });

//       // Try API
//       try {
//         await api.put("/api/settings/toggle-3rd-level", { enabled });
//       } catch (apiErr) {
//         // If API fails, we already saved to localStorage
//         console.warn("API toggle failed, but local storage updated:", apiErr.message);
//       }

//       Swal.fire({
//         icon: "success",
//         title: "Updated",
//         text: `3rd level ${enabled ? "enabled" : "disabled"} successfully`,
//         timer: 1500,
//         showConfirmButton: false,
//         toast: true,
//         position: "top-end",
//       });
//       return true;
//     } catch (err) {
//       // Revert on error
//       setSettings((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           preferences: {
//             ...prev.preferences,
//             enable3rdLevel: !enabled,
//           },
//         };
//       });
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || err.message || "Failed to toggle 3rd level",
//       });
//       return false;
//     }
//   }, [useLocalStorage, saveToLocalStorage]);

//   // Save All Settings
//   const saveAllSettings = useCallback(async () => {
//     try {
//       setIsSaving(true);
//       setIsSubmitting(true);

//       if (!settings) {
//         throw new Error("No settings to save");
//       }

//       const apiData = {
//         schoolInfo: {
//           name: settings.schoolInfo?.schoolName || "",
//           address: settings.schoolInfo?.schoolAddress || "",
//           phone: settings.schoolInfo?.schoolPhone || "",
//           email: settings.schoolInfo?.schoolEmail || "",
//           logo: settings.schoolInfo?.schoolLogo || "",
//           website: settings.schoolInfo?.schoolWebsite || "",
//         },
//         preferences: settings.preferences || {},
//         security: settings.security || {},
//         storage: settings.storage || {},
//         features: settings.features || {},
//       };

//       // Try API first
//       try {
//         const response = await api.put("/api/settings", apiData);
//         if (response.data?.success) {
//           // Save to localStorage as backup
//           saveToLocalStorage(settings);
//           setUseLocalStorage(false);
          
//           Swal.fire({
//             icon: "success",
//             title: "Success!",
//             text: "Settings saved successfully",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//           await loadSettings();
//           return true;
//         }
//       } catch (apiErr) {
//         // If API fails, save to localStorage
//         console.warn("API save failed, saving to localStorage:", apiErr.message);
//         saveToLocalStorage(settings);
//         setUseLocalStorage(true);
        
//         Swal.fire({
//           icon: "success",
//           title: "Saved Locally",
//           text: "Settings saved to local storage (API unavailable)",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//         return true;
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || err.message || "Failed to save settings",
//       });
//       return false;
//     } finally {
//       setIsSaving(false);
//       setIsSubmitting(false);
//     }
//   }, [settings, loadSettings, saveToLocalStorage]);

//   // Update Password
//   const updatePassword = useCallback(async (passwordData) => {
//     try {
//       setIsSubmitting(true);

//       // Try API
//       try {
//         await api.post("/api/auth/change-password", {
//           currentPassword: passwordData.currentPassword,
//           newPassword: passwordData.newPassword,
//         });
//       } catch (apiErr) {
//         // If API fails, show warning but still consider it successful for demo
//         console.warn("API password update failed:", apiErr.message);
//         if (apiErr.response?.status === 404) {
//           // Password endpoint might not exist, allow it for demo
//           Swal.fire({
//             icon: "warning",
//             title: "Demo Mode",
//             text: "Password would be updated in a real API",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//           return true;
//         }
//         throw apiErr;
//       }

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Password updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return true;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || err.message || "Failed to update password",
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, []);

//   // Load on mount - wait for auth
//   useEffect(() => {
//     if (authLoading) return;
//     if (user) {
//       loadSettings();
//     } else {
//       // Still load from localStorage even without user (for demo)
//       const hasLocalData = loadFromLocalStorage();
//       if (hasLocalData) {
//         setLoading(false);
//         setUseLocalStorage(true);
//         setError("Using local storage (login to sync with server)");
//       } else {
//         setLoading(false);
//         setSettings(null);
//         setError("Please login to access settings or create new");
//       }
//     }
//   }, [authLoading, user, loadSettings, loadFromLocalStorage]);

//   return {
//     settings,
//     loading,
//     error,
//     isSaving,
//     isSubmitting,
//     useLocalStorage,
//     loadSettings,
//     updateSchoolInfo,
//     toggle3rdLevel,
//     saveAllSettings,
//     updatePassword,
//     createDefaultSettings,
//   };
// };




// hooks/useSettings.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useContext } from "react";
import Swal from "sweetalert2";
import api from "@/services/api";
import { AuthContext } from "@/context/AuthContext";

const STORAGE_KEY = "school_settings";
let cachedSettings = null; // Global cache
let isLoading = false;

// Default settings with all fields
const DEFAULT_SETTINGS = {
  schoolInfo: {
    schoolName: "School Name",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    schoolWebsite: "",
  },
  branding: {
    logo: "",
    favicon: "",
    primaryColor: "#2563eb",
    secondaryColor: "#5419bb",
    accentColor: "#06b6d4",
  },
  profile: {
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    bio: "",
    avatar: "",
    joinDate: "",
  },
  preferences: {
    enable3rdLevel: false,
    theme: "system",
    language: "en",
    timezone: "Asia/Kolkata",
    passwordFormat: "first3+ddmm",
  },
  security: {
    maxLoginAttempts: 5,
    lockTime: 30,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true,
    },
    twoFactorAuth: {
      enabled: false,
      methods: [],
    },
  },
  storage: {
    total: 10737418240,
    used: 0,
    files: {
      count: 0,
      lastUpdated: null,
    },
  },
  features: {
    onlineAdmission: false,
    onlinePayment: false,
    attendance: true,
    examModule: true,
  },
};

// Merge settings with defaults
const mergeWithDefaults = (data) => {
  const merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  
  if (data) {
    if (data.schoolInfo) {
      merged.schoolInfo = { ...merged.schoolInfo, ...data.schoolInfo };
    }
    if (data.branding) {
      merged.branding = { ...merged.branding, ...data.branding };
    }
    if (data.profile) {
      merged.profile = { ...merged.profile, ...data.profile };
    }
    if (data.preferences) {
      merged.preferences = { ...merged.preferences, ...data.preferences };
    }
    if (data.security) {
      merged.security = { ...merged.security, ...data.security };
      if (data.security.twoFactorAuth) {
        merged.security.twoFactorAuth = { 
          ...merged.security.twoFactorAuth, 
          ...data.security.twoFactorAuth 
        };
      }
      if (data.security.passwordPolicy) {
        merged.security.passwordPolicy = { 
          ...merged.security.passwordPolicy, 
          ...data.security.passwordPolicy 
        };
      }
    }
    if (data.storage) {
      merged.storage = { ...merged.storage, ...data.storage };
      if (data.storage.files) {
        merged.storage.files = { ...merged.storage.files, ...data.storage.files };
      }
    }
    if (data.features) {
      merged.features = { ...merged.features, ...data.features };
    }
  }
  
  return merged;
};

export const useSettings = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const loadPromiseRef = useRef(null);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = mergeWithDefaults(parsed);
        return merged;
      }
      return null;
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      return null;
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      return false;
    }
  }, []);

  // Load Settings from API
  const loadSettings = useCallback(async (forceRefresh = false) => {
    // Return cached if available and not forcing refresh
    if (!forceRefresh && cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return cachedSettings;
    }

    // Prevent multiple simultaneous loads
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setLoading(true);
    setError(null);

    loadPromiseRef.current = (async () => {
      try {
        // Try API first
        try {
          const response = await api.get("/api/settings");
          
          if (response.data?.success && response.data?.data) {
            const apiData = response.data.data;
            
            const mappedData = {
              schoolInfo: {
                schoolName: apiData.schoolInfo?.name || apiData.schoolInfo?.schoolName || "",
                schoolAddress: apiData.schoolInfo?.address || apiData.schoolInfo?.schoolAddress || "",
                schoolPhone: apiData.schoolInfo?.phone || apiData.schoolInfo?.schoolPhone || "",
                schoolEmail: apiData.schoolInfo?.email || apiData.schoolInfo?.schoolEmail || "",
                schoolWebsite: apiData.schoolInfo?.website || apiData.schoolInfo?.schoolWebsite || "",
              },
              branding: {
                logo: apiData.branding?.logo || "",
                favicon: apiData.branding?.favicon || "",
                primaryColor: apiData.branding?.primaryColor || "#2563eb",
                secondaryColor: apiData.branding?.secondaryColor || "#5419bb",
                accentColor: apiData.branding?.accentColor || "#06b6d4",
              },
              profile: {
                fullName: apiData.profile?.fullName || user?.fullName || user?.name || "",
                email: apiData.profile?.email || user?.email || "",
                phone: apiData.profile?.phone || "",
                position: apiData.profile?.position || "",
                department: apiData.profile?.department || "",
                bio: apiData.profile?.bio || "",
                avatar: apiData.profile?.avatar || user?.profilePic || "",
                joinDate: apiData.profile?.joinDate || "",
              },
              preferences: {
                enable3rdLevel: apiData.preferences?.enable3rdLevel || false,
                theme: apiData.preferences?.theme || "system",
                language: apiData.preferences?.language || "en",
                timezone: apiData.preferences?.timezone || "Asia/Kolkata",
                passwordFormat: apiData.preferences?.passwordFormat || "first3+ddmm",
              },
              security: {
                maxLoginAttempts: apiData.security?.maxLoginAttempts || 5,
                lockTime: apiData.security?.lockTime || 30,
                passwordPolicy: {
                  minLength: apiData.security?.passwordPolicy?.minLength || 8,
                  requireSpecialChar: apiData.security?.passwordPolicy?.requireSpecialChar || true,
                  requireNumber: apiData.security?.passwordPolicy?.requireNumber || true,
                  requireUppercase: apiData.security?.passwordPolicy?.requireUppercase || true,
                },
                twoFactorAuth: {
                  enabled: apiData.security?.twoFactorAuth?.enabled || false,
                  methods: apiData.security?.twoFactorAuth?.methods || [],
                },
              },
              storage: {
                total: apiData.storage?.total || 10737418240,
                used: apiData.storage?.used || 0,
                files: {
                  count: apiData.storage?.files?.count || 0,
                  lastUpdated: apiData.storage?.files?.lastUpdated || null,
                },
              },
              features: {
                onlineAdmission: apiData.features?.onlineAdmission || false,
                onlinePayment: apiData.features?.onlinePayment || false,
                attendance: apiData.features?.attendance !== undefined ? apiData.features.attendance : true,
                examModule: apiData.features?.examModule !== undefined ? apiData.features.examModule : true,
              },
            };

            const merged = mergeWithDefaults(mappedData);
            cachedSettings = merged;
            setSettings(merged);
            saveToLocalStorage(merged);
            setUseLocalStorage(false);
            setError(null);
            return merged;
          }
        } catch (apiErr) {
          console.warn("API failed, using localStorage:", apiErr.message);
          const localData = loadFromLocalStorage();
          if (localData) {
            cachedSettings = localData;
            setSettings(localData);
            setUseLocalStorage(true);
            setError("Using local storage (API unavailable)");
            return localData;
          }
          
          // Set default settings if no data exists
          const defaultWithUser = {
            ...DEFAULT_SETTINGS,
            profile: {
              ...DEFAULT_SETTINGS.profile,
              fullName: user?.fullName || user?.name || "",
              email: user?.email || "",
              avatar: user?.profilePic || "",
            }
          };
          cachedSettings = defaultWithUser;
          setSettings(defaultWithUser);
          saveToLocalStorage(defaultWithUser);
          setError("No settings found. Using defaults.");
          setUseLocalStorage(true);
          return defaultWithUser;
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load settings");
        return null;
      } finally {
        setLoading(false);
        loadPromiseRef.current = null;
      }
    })();

    return loadPromiseRef.current;
  }, [loadFromLocalStorage, saveToLocalStorage, user]);

  // Create Default Settings
  const createDefaultSettings = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      const defaultSettings = { 
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          fullName: user?.fullName || user?.name || "",
          email: user?.email || "",
          avatar: user?.profilePic || "",
        }
      };

      try {
        const response = await api.post("/api/settings", {
          schoolInfo: {
            name: defaultSettings.schoolInfo.schoolName,
            address: defaultSettings.schoolInfo.schoolAddress,
            phone: defaultSettings.schoolInfo.schoolPhone,
            email: defaultSettings.schoolInfo.schoolEmail,
            website: defaultSettings.schoolInfo.schoolWebsite,
          },
          branding: defaultSettings.branding,
          profile: defaultSettings.profile,
          preferences: defaultSettings.preferences,
          security: defaultSettings.security,
          storage: defaultSettings.storage,
          features: defaultSettings.features,
        });
        
        if (response.data?.success) {
          // Update cache
          cachedSettings = defaultSettings;
          setSettings(defaultSettings);
          saveToLocalStorage(defaultSettings);
          setUseLocalStorage(false);
          setError(null);
          
          Swal.fire({
            icon: "success",
            title: "Settings Created",
            text: "Default settings have been created successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          return true;
        }
      } catch (apiErr) {
        console.warn("API failed, saving to localStorage:", apiErr.message);
        cachedSettings = defaultSettings;
        setSettings(defaultSettings);
        saveToLocalStorage(defaultSettings);
        setError("Settings saved to local storage (API unavailable)");
        setUseLocalStorage(true);
        
        Swal.fire({
          icon: "success",
          title: "Settings Created",
          text: "Default settings saved to local storage",
          timer: 2000,
          showConfirmButton: false,
        });
        return true;
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Failed to create default settings",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveToLocalStorage, user]);

  // Update School Info
  const updateSchoolInfo = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        schoolInfo: {
          ...prev.schoolInfo,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Update Branding
  const updateBranding = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        branding: {
          ...prev.branding,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Update Profile
  const updateProfile = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Update Preferences
  const updatePreferences = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Update Security
  const updateSecurity = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        security: {
          ...prev.security,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Update Features
  const updateFeatures = useCallback((field, value) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        features: {
          ...prev.features,
          [field]: value,
        },
      };
      cachedSettings = updated;
      if (useLocalStorage) {
        saveToLocalStorage(updated);
      }
      return updated;
    });
  }, [useLocalStorage, saveToLocalStorage]);

  // Toggle 3rd Level
  const toggle3rdLevel = useCallback(async (enabled) => {
    try {
      setSettings((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          preferences: {
            ...prev.preferences,
            enable3rdLevel: enabled,
          },
        };
        cachedSettings = updated;
        if (useLocalStorage) {
          saveToLocalStorage(updated);
        }
        return updated;
      });

      try {
        await api.put("/api/settings/toggle-3rd-level", { enabled });
      } catch (apiErr) {
        console.warn("API toggle failed, but local storage updated:", apiErr.message);
      }

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: `3rd level ${enabled ? "enabled" : "disabled"} successfully`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return true;
    } catch (err) {
      // Revert on error
      setSettings((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          preferences: {
            ...prev.preferences,
            enable3rdLevel: !enabled,
          },
        };
        cachedSettings = updated;
        return updated;
      });
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Failed to toggle 3rd level",
      });
      return false;
    }
  }, [useLocalStorage, saveToLocalStorage]);

  // Save All Settings
  const saveAllSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setIsSubmitting(true);

      if (!settings) {
        throw new Error("No settings to save");
      }

      const apiData = {
        schoolInfo: {
          name: settings.schoolInfo?.schoolName || "",
          address: settings.schoolInfo?.schoolAddress || "",
          phone: settings.schoolInfo?.schoolPhone || "",
          email: settings.schoolInfo?.schoolEmail || "",
          website: settings.schoolInfo?.schoolWebsite || "",
        },
        branding: settings.branding || {},
        profile: settings.profile || {},
        preferences: settings.preferences || {},
        security: settings.security || {},
        storage: settings.storage || {},
        features: settings.features || {},
      };

      try {
        const response = await api.put("/api/settings", apiData);
        if (response.data?.success) {
          saveToLocalStorage(settings);
          cachedSettings = settings;
          setUseLocalStorage(false);
          
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Settings saved successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          return true;
        }
      } catch (apiErr) {
        console.warn("API save failed, saving to localStorage:", apiErr.message);
        saveToLocalStorage(settings);
        cachedSettings = settings;
        setUseLocalStorage(true);
        
        Swal.fire({
          icon: "success",
          title: "Saved Locally",
          text: "Settings saved to local storage (API unavailable)",
          timer: 2000,
          showConfirmButton: false,
        });
        return true;
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Failed to save settings",
      });
      return false;
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  }, [settings, saveToLocalStorage]);

  // Update Password
  const updatePassword = useCallback(async (passwordData) => {
    try {
      setIsSubmitting(true);

      try {
        await api.put("/api/settings/change-password", {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Password updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        return true;
      } catch (apiErr) {
        console.warn("API password update failed:", apiErr.message);
        if (apiErr.response?.status === 404) {
          Swal.fire({
            icon: "warning",
            title: "Demo Mode",
            text: "Password would be updated in a real API",
            timer: 2000,
            showConfirmButton: false,
          });
          return true;
        }
        throw apiErr;
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Failed to update password",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Update Storage Usage
  const updateStorageUsage = useCallback(async (fileSize) => {
    try {
      setIsSaving(true);
      
      try {
        await api.put("/api/settings/storage", { fileSize });
      } catch (apiErr) {
        console.warn("API storage update failed:", apiErr.message);
      }
      
      setSettings((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          storage: {
            ...prev.storage,
            used: (prev.storage?.used || 0) + fileSize,
            files: {
              count: (prev.storage?.files?.count || 0) + 1,
              lastUpdated: new Date(),
            },
          },
        };
        cachedSettings = updated;
        if (useLocalStorage) {
          saveToLocalStorage(updated);
        }
        return updated;
      });
      
      return true;
    } catch (err) {
      console.error("Error updating storage:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [useLocalStorage, saveToLocalStorage]);

  // Reset to Defaults
  const resetToDefaults = useCallback(async () => {
    const confirmed = await Swal.fire({
      title: "Reset Settings?",
      text: "This will reset all settings to default values. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reset everything",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        const defaultWithUser = {
          ...DEFAULT_SETTINGS,
          profile: {
            ...DEFAULT_SETTINGS.profile,
            fullName: user?.fullName || user?.name || "",
            email: user?.email || "",
            avatar: user?.profilePic || "",
          }
        };
        
        try {
          await api.put("/api/settings", defaultWithUser);
        } catch (apiErr) {
          console.warn("API reset failed:", apiErr.message);
        }
        
        cachedSettings = defaultWithUser;
        setSettings(defaultWithUser);
        saveToLocalStorage(defaultWithUser);
        
        Swal.fire({
          icon: "success",
          title: "Reset Complete",
          text: "Settings have been reset to defaults",
          timer: 2000,
          showConfirmButton: false,
        });
        
        return true;
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reset settings",
        });
        return false;
      }
    }
    return false;
  }, [saveToLocalStorage, user]);

  // Clear Local Storage
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      cachedSettings = null;
      setSettings(null);
      setUseLocalStorage(false);
      Swal.fire({
        icon: "success",
        title: "Cleared",
        text: "Local storage cleared successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      return true;
    } catch (err) {
      console.error("Error clearing local storage:", err);
      return false;
    }
  }, []);

  // Export Settings as JSON
  const exportSettings = useCallback(() => {
    if (!settings) {
      Swal.fire({
        icon: "error",
        title: "No Settings",
        text: "No settings available to export",
      });
      return;
    }

    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      Swal.fire({
        icon: "success",
        title: "Exported",
        text: "Settings exported successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to export settings",
      });
    }
  }, [settings]);

  // Import Settings from JSON
  const importSettings = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        const merged = mergeWithDefaults(importedData);
        
        const confirmed = await Swal.fire({
          title: "Import Settings?",
          text: "This will replace all current settings. Continue?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, import",
          cancelButtonText: "Cancel",
        });
        
        if (confirmed.isConfirmed) {
          try {
            await api.put("/api/settings", {
              schoolInfo: {
                name: merged.schoolInfo.schoolName,
                address: merged.schoolInfo.schoolAddress,
                phone: merged.schoolInfo.schoolPhone,
                email: merged.schoolInfo.schoolEmail,
                website: merged.schoolInfo.schoolWebsite,
              },
              branding: merged.branding,
              profile: merged.profile,
              preferences: merged.preferences,
              security: merged.security,
              storage: merged.storage,
              features: merged.features,
            });
          } catch (apiErr) {
            console.warn("API import failed:", apiErr.message);
          }
          
          cachedSettings = merged;
          setSettings(merged);
          saveToLocalStorage(merged);
          
          Swal.fire({
            icon: "success",
            title: "Imported",
            text: "Settings imported successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Import Failed",
          text: "Invalid file format or corrupted data",
        });
      }
    };
    
    input.click();
  }, [saveToLocalStorage]);

  // Load settings on mount - only once
  useEffect(() => {
    if (authLoading) return;
    
    // If already have cached settings, use them
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    // If no cached settings, load them
    if (user) {
      loadSettings();
    } else {
      const localData = loadFromLocalStorage();
      if (localData) {
        cachedSettings = localData;
        setSettings(localData);
        setLoading(false);
        setUseLocalStorage(true);
        setError("Using local storage (login to sync with server)");
      } else {
        const defaultWithUser = {
          ...DEFAULT_SETTINGS,
          profile: {
            ...DEFAULT_SETTINGS.profile,
            fullName: "",
            email: "",
            avatar: "",
          }
        };
        cachedSettings = defaultWithUser;
        setSettings(defaultWithUser);
        saveToLocalStorage(defaultWithUser);
        setLoading(false);
        setUseLocalStorage(true);
        setError("Using default settings");
      }
    }
  }, [authLoading, user, loadSettings, loadFromLocalStorage, saveToLocalStorage]);

  return {
    settings,
    loading,
    error,
    isSaving,
    isSubmitting,
    useLocalStorage,
    loadSettings,
    saveAllSettings,
    createDefaultSettings,
    resetToDefaults,
    updateSchoolInfo,
    updateBranding,
    updateProfile,
    updatePreferences,
    updateSecurity,
    updateFeatures,
    toggle3rdLevel,
    updatePassword,
    updateStorageUsage,
    clearLocalStorage,
    exportSettings,
    importSettings,
  };
};