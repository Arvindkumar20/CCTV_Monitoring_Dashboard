// // context/SettingsContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
// import { useSettings } from "@/hooks/useSettings";

// const SettingsContext = createContext();

// export const SettingsProvider = ({ children }) => {
//   const [settingsCache, setSettingsCache] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [useLocalStorage, setUseLocalStorage] = useState(false);

//   // Only initialize once
//   const {
//     loadSettings: loadSettingsAPI,
//     saveAllSettings: saveAllSettingsAPI,
//     updateSchoolInfo: updateSchoolInfoAPI,
//     updateBranding: updateBrandingAPI,
//     updateProfile: updateProfileAPI,
//     updatePreferences: updatePreferencesAPI,
//     updateSecurity: updateSecurityAPI,
//     updateFeatures: updateFeaturesAPI,
//     toggle3rdLevel: toggle3rdLevelAPI,
//     updatePassword: updatePasswordAPI,
//     updateStorageUsage: updateStorageUsageAPI,
//     createDefaultSettings: createDefaultSettingsAPI,
//     resetToDefaults: resetToDefaultsAPI,
//     clearLocalStorage: clearLocalStorageAPI,
//     exportSettings: exportSettingsAPI,
//     importSettings: importSettingsAPI,
//   } = useSettings();

//   // Load settings once on mount
//   useEffect(() => {
//     const initializeSettings = async () => {
//       if (!settingsCache) {
//         setLoading(true);
//         try {
//           const result = await loadSettingsAPI();
//           // The hook's state is updated internally, we need to get the latest
//           // We'll use a ref or use the settings from the hook
//         } catch (err) {
//           setError(err.message);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
//     initializeSettings();
//   }, []); // Empty dependency array - run only once

//   // Memoized context value to prevent unnecessary re-renders
//   const contextValue = useMemo(() => ({
//     settings: settingsCache,
//     loading,
//     error,
//     isSaving,
//     useLocalStorage,
//     loadSettings: loadSettingsAPI,
//     saveAllSettings: saveAllSettingsAPI,
//     updateSchoolInfo: updateSchoolInfoAPI,
//     updateBranding: updateBrandingAPI,
//     updateProfile: updateProfileAPI,
//     updatePreferences: updatePreferencesAPI,
//     updateSecurity: updateSecurityAPI,
//     updateFeatures: updateFeaturesAPI,
//     toggle3rdLevel: toggle3rdLevelAPI,
//     updatePassword: updatePasswordAPI,
//     updateStorageUsage: updateStorageUsageAPI,
//     createDefaultSettings: createDefaultSettingsAPI,
//     resetToDefaults: resetToDefaultsAPI,
//     clearLocalStorage: clearLocalStorageAPI,
//     exportSettings: exportSettingsAPI,
//     importSettings: importSettingsAPI,
//   }), [settingsCache, loading, error, isSaving, useLocalStorage]);

//   return (
//     <SettingsContext.Provider value={contextValue}>
//       {children}
//     </SettingsContext.Provider>
//   );
// };

// export const useSettingsContext = () => {
//   const context = useContext(SettingsContext);
//   if (!context) {
//     throw new Error("useSettingsContext must be used within SettingsProvider");
//   }
//   return context;
// };

// context/SettingsContext.jsx
import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const settingsHook = useSettings();

  // Query for fetching settings - cached automatically by React Query
  const {
    data: settings,
    isLoading: loading,
    error,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const result = await settingsHook.loadSettingsAPI();
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 1,
    onError: (err) => {
      console.error("Failed to load settings:", err);
    },
  });

  // Mutations for each update - invalidates cache on success
  const saveAllMutation = useMutation({
    mutationFn: settingsHook.saveAllSettingsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateSchoolInfoMutation = useMutation({
    mutationFn: settingsHook.updateSchoolInfoAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateBrandingMutation = useMutation({
    mutationFn: settingsHook.updateBrandingAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: settingsHook.updateProfileAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: settingsHook.updatePreferencesAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateSecurityMutation = useMutation({
    mutationFn: settingsHook.updateSecurityAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateFeaturesMutation = useMutation({
    mutationFn: settingsHook.updateFeaturesAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const toggle3rdLevelMutation = useMutation({
    mutationFn: settingsHook.toggle3rdLevelAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: settingsHook.updatePasswordAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateStorageUsageMutation = useMutation({
    mutationFn: settingsHook.updateStorageUsageAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const createDefaultSettingsMutation = useMutation({
    mutationFn: settingsHook.createDefaultSettingsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: settingsHook.resetToDefaultsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const importSettingsMutation = useMutation({
    mutationFn: settingsHook.importSettingsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Optimistic update helper for mutations
  const optimisticUpdate = (updateFn) => {
    const previous = queryClient.getQueryData(["settings"]);
    queryClient.setQueryData(["settings"], updateFn(previous));
    return previous;
  };

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      settings,
      loading,
      error: error?.message || null,
      isSaving:
        saveAllMutation.isLoading ||
        updateSchoolInfoMutation.isLoading ||
        updateBrandingMutation.isLoading ||
        updateProfileMutation.isLoading ||
        updatePreferencesMutation.isLoading ||
        updateSecurityMutation.isLoading ||
        updateFeaturesMutation.isLoading ||
        toggle3rdLevelMutation.isLoading ||
        updatePasswordMutation.isLoading ||
        updateStorageUsageMutation.isLoading,

      // Data fetching
      loadSettings: refetchSettings,

      // Mutations with optimistic updates (optional)
      saveAllSettings: saveAllMutation.mutateAsync,
      updateSchoolInfo: updateSchoolInfoMutation.mutateAsync,
      updateBranding: updateBrandingMutation.mutateAsync,
      updateProfile: updateProfileMutation.mutateAsync,
      updatePreferences: updatePreferencesMutation.mutateAsync,
      updateSecurity: updateSecurityMutation.mutateAsync,
      updateFeatures: updateFeaturesMutation.mutateAsync,
      toggle3rdLevel: toggle3rdLevelMutation.mutateAsync,
      updatePassword: updatePasswordMutation.mutateAsync,
      updateStorageUsage: updateStorageUsageMutation.mutateAsync,
      createDefaultSettings: createDefaultSettingsMutation.mutateAsync,
      resetToDefaults: resetToDefaultsMutation.mutateAsync,
      importSettings: importSettingsMutation.mutateAsync,

      // Additional utilities
      clearLocalStorage: settingsHook.clearLocalStorageAPI, // If you still need this
      exportSettings: settingsHook.exportSettingsAPI, // Should this be a mutation?
    }),
    [
      settings,
      loading,
      error,
      saveAllMutation.isLoading,
      updateSchoolInfoMutation.isLoading,
      updateBrandingMutation.isLoading,
      updateProfileMutation.isLoading,
      updatePreferencesMutation.isLoading,
      updateSecurityMutation.isLoading,
      updateFeaturesMutation.isLoading,
      toggle3rdLevelMutation.isLoading,
      updatePasswordMutation.isLoading,
      updateStorageUsageMutation.isLoading,
      refetchSettings,
      saveAllMutation.mutateAsync,
      updateSchoolInfoMutation.mutateAsync,
      updateBrandingMutation.mutateAsync,
      updateProfileMutation.mutateAsync,
      updatePreferencesMutation.mutateAsync,
      updateSecurityMutation.mutateAsync,
      updateFeaturesMutation.mutateAsync,
      toggle3rdLevelMutation.mutateAsync,
      updatePasswordMutation.mutateAsync,
      updateStorageUsageMutation.mutateAsync,
      createDefaultSettingsMutation.mutateAsync,
      resetToDefaultsMutation.mutateAsync,
      importSettingsMutation.mutateAsync,
      settingsHook.clearLocalStorageAPI,
      settingsHook.exportSettingsAPI,
    ],
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within SettingsProvider");
  }
  return context;
};
