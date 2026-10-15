// import { useState, useEffect } from "react";
// import { dashboardApi } from "@/services/api/dashboard.api";

// export const useDashboardData = () => {
//   const [data, setData] = useState({
//     stats: [],
//     cameras: {
//       total: 0,
//       active: 0,
//       online: 0,
//       offline: 0,
//       byStatus: {},
//       byStream: {}
//     },
//     guardians: {
//       total: 0,
//       active: 0,
//       pending: 0,
//       locked: 0,
//       suspended: 0
//     },
//     categories: {
//       total: 0,
//       subCategories: 0,
//       nestedSubCategories: 0
//     },
//     activeUsers: 0,
//     storage: {
//       total: 100,
//       used: 0,
//       free: 100,
//       percentage: 0
//     },
//     activities: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const response = await dashboardApi.getDashboardData();
//         console.log(response)
//         if (response?.success) {
//           setData(response.data);
//         }
        
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch dashboard data:", err);
//         setError(err.message || "Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   return { data, loading, error };
// };




// frontend/src/hooks/useDashboardData.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api/dashboard.api";

// ============================================
// QUERY KEYS
// ============================================

export const dashboardKeys = {
  all: ["dashboard"],
  data: () => [...dashboardKeys.all, "data"],
  stats: () => [...dashboardKeys.all, "stats"],
  cameras: () => [...dashboardKeys.all, "cameras"],
  guardians: () => [...dashboardKeys.all, "guardians"],
  storage: () => [...dashboardKeys.all, "storage"],
  activities: () => [...dashboardKeys.all, "activities"],
};

// ============================================
// DEFAULT DATA (Fallback)
// ============================================

const DEFAULT_DATA = {
  stats: [],
  cameras: {
    total: 0,
    active: 0,
    online: 0,
    offline: 0,
    byStatus: {},
    byStream: {},
  },
  guardians: {
    total: 0,
    active: 0,
    pending: 0,
    locked: 0,
    suspended: 0,
  },
  categories: {
    total: 0,
    subCategories: 0,
    nestedSubCategories: 0,
  },
  activeUsers: 0,
  storage: {
    total: 100,
    used: 0,
    free: 100,
    percentage: 0,
  },
  activities: [],
};

// ============================================
// FETCH FUNCTION
// ============================================

const fetchDashboardData = async () => {
  const response = await dashboardApi.getDashboardData();

  if (!response?.success) {
    throw new Error(response?.message || "Failed to fetch dashboard data");
  }

  // ✅ Merge with defaults to handle missing fields
  return {
    ...DEFAULT_DATA,
    ...response.data,
    cameras: { ...DEFAULT_DATA.cameras, ...response.data?.cameras },
    guardians: { ...DEFAULT_DATA.guardians, ...response.data?.guardians },
    categories: { ...DEFAULT_DATA.categories, ...response.data?.categories },
    storage: { ...DEFAULT_DATA.storage, ...response.data?.storage },
  };
};

// ============================================
// MAIN HOOK
// ============================================

export const useDashboardData = (options = {}) => {
  const queryClient = useQueryClient();

  const {
    autoRefresh = true,
    refetchInterval = 60 * 1000, // 1 min default
    enabled = true,
  } = options;

  // ============================================
  // MAIN QUERY
  // ============================================

  const query = useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: fetchDashboardData,
    enabled,
    
    // ✅ Caching
    staleTime: 30 * 1000,              // 30 sec fresh
    gcTime: 10 * 60 * 1000,            // 10 min cache
    
    // ✅ Auto refetch
    refetchInterval: autoRefresh ? refetchInterval : false,
    refetchIntervalInBackground: false, // Only when tab visible
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // ✅ Retry on failure
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // ✅ Keep old data during refetch (no loading flash)
    placeholderData: (previousData) => previousData,
  });

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Manual refresh
   */
  const refresh = async () => {
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  /**
   * Force refetch immediately
   */
  const refetch = async () => {
    return query.refetch();
  };

  /**
   * Update dashboard data locally (optimistic)
   */
  const updateData = (updater) => {
    queryClient.setQueryData(dashboardKeys.data(), (old) => {
      if (!old) return old;
      const updated = typeof updater === "function" ? updater(old) : updater;
      return { ...old, ...updated };
    });
  };

  /**
   * Update specific section
   */
  const updateSection = (section, updater) => {
    queryClient.setQueryData(dashboardKeys.data(), (old) => {
      if (!old) return old;
      const currentSection = old[section] || {};
      const updated =
        typeof updater === "function" ? updater(currentSection) : updater;
      return { ...old, [section]: { ...currentSection, ...updated } };
    });
  };

  /**
   * Reset to default (clear cache)
   */
  const reset = () => {
    queryClient.setQueryData(dashboardKeys.data(), DEFAULT_DATA);
  };

  /**
   * Invalidate specific section
   * (useful when e.g. camera data changes elsewhere)
   */
  const invalidateSection = (section) => {
    // Since it's a single query, just invalidate whole thing
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data - with fallback to DEFAULT_DATA
    data: query.data || DEFAULT_DATA,

    // Loading states
    loading: query.isLoading,          // Only initial load
    isFetching: query.isFetching,      // Any fetch (incl. background)
    isRefetching: query.isRefetching,  // Background refetch
    isPending: query.isPending,        // Alias

    // Error
    error: query.error?.message || null,
    isError: query.isError,

    // Query metadata
    status: query.status,              // 'pending' | 'error' | 'success'
    fetchStatus: query.fetchStatus,    // 'idle' | 'fetching' | 'paused'
    dataUpdatedAt: query.dataUpdatedAt, // Timestamp
    errorUpdatedAt: query.errorUpdatedAt,

    // Actions
    refetch,
    refresh,                            // Alias for invalidate
    updateData,
    updateSection,
    invalidateSection,
    reset,

    // Convenience accessors
    stats: query.data?.stats || [],
    cameras: query.data?.cameras || DEFAULT_DATA.cameras,
    guardians: query.data?.guardians || DEFAULT_DATA.guardians,
    categories: query.data?.categories || DEFAULT_DATA.categories,
    activeUsers: query.data?.activeUsers || 0,
    storage: query.data?.storage || DEFAULT_DATA.storage,
    activities: query.data?.activities || [],
  };
};