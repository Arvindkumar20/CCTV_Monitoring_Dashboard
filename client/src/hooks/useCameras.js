
// frontend/src/hooks/useCameras.js
import { cameraApi } from "@/services/api/camera.api";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// ============================================
// QUERY KEYS (Centralized)
// ============================================

export const cameraKeys = {
  all: ["cameras"],
  lists: () => [...cameraKeys.all, "list"],
  list: (params) => [...cameraKeys.lists(), params],
  details: () => [...cameraKeys.all, "detail"],
  detail: (id) => [...cameraKeys.details(), id],
  stats: () => [...cameraKeys.all, "stats"],
  streamStats: () => [...cameraKeys.all, "stream-stats"],
  byCategory: (type, id) => [...cameraKeys.all, "category", type, id],
};

// ============================================
// API FUNCTIONS (Already in camera.api.js)
// ============================================

const fetchCamerasFn = async (params) => {
  const response = await cameraApi.getAll(params);
  if (!response?.success) throw new Error("Failed to fetch cameras");
  return {
    cameras: response.data?.cameras || response.data || [],
    pagination: response.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
  };
};

const fetchStatsFn = async () => {
  const response = await cameraApi.getStats();
  if (!response?.success) throw new Error("Failed to fetch stats");
  return response.data;
};

const fetchStreamStatsFn = async () => {
  const response = await cameraApi.getStreamDashboardStats();
  if (!response?.success) throw new Error("Failed to fetch stream stats");
  return response.data;
};

// ============================================
// MAIN HOOK
// ============================================

export const useCameras = (initialParams = {}) => {
  const queryClient = useQueryClient();

  // Local state for params (page, filters, etc.)
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // QUERIES (Auto-cached, dedup, background refetch)
  // ============================================

  // ✅ Cameras list - fetch when params change
  const camerasQuery = useQuery({
    queryKey: cameraKeys.list(params),
    queryFn: () => fetchCamerasFn(params),
    staleTime: 30 * 1000,        // 30 sec - data fresh
    gcTime: 5 * 60 * 1000,        // 5 min - keep in cache
    refetchInterval: 30 * 1000,   // Auto refetch every 30 sec
    refetchIntervalInBackground: false, // Only when tab visible
    refetchOnWindowFocus: true,   // Refresh on tab focus
    keepPreviousData: true,       // ✅ Pagination smooth
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // ✅ Stats - rarely changes, longer staleTime
  const statsQuery = useQuery({
    queryKey: cameraKeys.stats(),
    queryFn: fetchStatsFn,
    staleTime: 60 * 1000,         // 1 min
    refetchInterval: 60 * 1000,   // Auto refresh every min
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // ✅ Stream stats - changes often
  const streamStatsQuery = useQuery({
    queryKey: cameraKeys.streamStats(),
    queryFn: fetchStreamStatsFn,
    staleTime: 15 * 1000,          // 15 sec
    refetchInterval: 15 * 1000,    // Auto refresh every 15 sec
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // ============================================
  // MUTATIONS (CRUD with optimistic updates)
  // ============================================

  // ✅ Create camera
  const createMutation = useMutation({
    mutationFn: (data) => cameraApi.create(data),
    onSuccess: async (response) => {
      if (response?.success) {
        // Invalidate & refetch all camera queries
        await queryClient.invalidateQueries({ queryKey: cameraKeys.all });

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Camera added successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to add camera",
      });
    },
  });

  // ✅ Update camera
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => cameraApi.update(id, data),
    onSuccess: (response, { id }) => {
      if (response?.success) {
        // Optimistic update in cache
        queryClient.setQueryData(cameraKeys.list(params), (old) => {
          if (!old) return old;
          return {
            ...old,
            cameras: old.cameras.map((cam) =>
              cam._id === id ? { ...cam, ...response.data } : cam,
            ),
          };
        });

        // Invalidate stats
        queryClient.invalidateQueries({ queryKey: cameraKeys.stats() });
        queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: response.message || "Camera updated successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update camera",
      });
    },
  });

  // ✅ Delete camera
  const deleteMutation = useMutation({
    mutationFn: (id) => cameraApi.delete(id),
    onSuccess: async (response) => {
      if (response?.success) {
        await queryClient.invalidateQueries({ queryKey: cameraKeys.all });

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to delete camera",
      });
    },
  });

  // ✅ Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => cameraApi.toggleStatus(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cameraKeys.lists() });

      // Snapshot for rollback
      const previousData = queryClient.getQueryData(cameraKeys.list(params));

      // Optimistic update
      queryClient.setQueryData(cameraKeys.list(params), (old) => {
        if (!old) return old;
        const camera = old.cameras.find((c) => c._id === id);
        const newStatus = camera?.status === "active" ? "inactive" : "active";
        const newStreamStatus = newStatus === "active" ? "online" : "offline";

        return {
          ...old,
          cameras: old.cameras.map((cam) =>
            cam._id === id
              ? { ...cam, status: newStatus, streamStatus: newStreamStatus }
              : cam,
          ),
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(cameraKeys.list(params), context.previousData);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to toggle camera status",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: cameraKeys.stats() });
      queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });
    },
  });

  // ✅ Start stream
  const startStreamMutation = useMutation({
    mutationFn: (cameraId) => cameraApi.startStream(cameraId),
    onMutate: async (cameraId) => {
      await queryClient.cancelQueries({ queryKey: cameraKeys.lists() });
      const previousData = queryClient.getQueryData(cameraKeys.list(params));

      // Optimistic: mark as streaming
      queryClient.setQueryData(cameraKeys.list(params), (old) => {
        if (!old) return old;
        return {
          ...old,
          cameras: old.cameras.map((cam) =>
            cam._id === cameraId
              ? { ...cam, isStreaming: true, streamStatus: "streaming" }
              : cam,
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (response, cameraId, context) => {
      if (response?.success) {
        // Update with actual hlsUrl
        queryClient.setQueryData(cameraKeys.list(params), (old) => {
          if (!old) return old;
          return {
            ...old,
            cameras: old.cameras.map((cam) =>
              cam._id === cameraId
                ? {
                    ...cam,
                    hlsUrl: response.data?.hlsUrl || response.hlsUrl,
                    isStreaming: true,
                    streamStatus: "streaming",
                  }
                : cam,
            ),
          };
        });

        queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });
      }
    },
    onError: (err, cameraId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cameraKeys.list(params), context.previousData);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to start stream",
      });
    },
  });

  // ✅ Stop stream
  const stopStreamMutation = useMutation({
    mutationFn: (cameraId) => cameraApi.stopStream(cameraId),
    onMutate: async (cameraId) => {
      await queryClient.cancelQueries({ queryKey: cameraKeys.lists() });
      const previousData = queryClient.getQueryData(cameraKeys.list(params));

      queryClient.setQueryData(cameraKeys.list(params), (old) => {
        if (!old) return old;
        return {
          ...old,
          cameras: old.cameras.map((cam) =>
            cam._id === cameraId
              ? { ...cam, isStreaming: false, streamStatus: "stopped" }
              : cam,
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });
    },
    onError: (err, cameraId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cameraKeys.list(params), context.previousData);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to stop stream",
      });
    },
  });

  // ✅ Restart stream
  const restartStreamMutation = useMutation({
    mutationFn: (cameraId) => cameraApi.restartStream(cameraId),
    onSuccess: (response, cameraId) => {
      if (response?.success) {
        queryClient.setQueryData(cameraKeys.list(params), (old) => {
          if (!old) return old;
          return {
            ...old,
            cameras: old.cameras.map((cam) =>
              cam._id === cameraId
                ? {
                    ...cam,
                    hlsUrl: response.data?.hlsUrl || response.hlsUrl,
                    isStreaming: true,
                    streamStatus: "streaming",
                  }
                : cam,
            ),
          };
        });

        queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });
      }
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to restart stream",
      });
    },
  });

  // ============================================
  // WRAPPER FUNCTIONS (Compatible with existing code)
  // ============================================

  const addCamera = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        const response = await createMutation.mutateAsync(data);
        return response?.success || false;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createMutation],
  );

  const editCamera = useCallback(
    async (id, data) => {
      setIsSubmitting(true);
      try {
        const response = await updateMutation.mutateAsync({ id, data });
        return response?.success || false;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateMutation],
  );

  const removeCamera = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return false;

      try {
        const response = await deleteMutation.mutateAsync(id);
        return response?.success || false;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  const statusToggle = useCallback(
    async (id) => {
      try {
        const response = await toggleStatusMutation.mutateAsync(id);
        return response?.data?.status || null;
      } catch {
        return null;
      }
    },
    [toggleStatusMutation],
  );

  const startStream = useCallback(
    async (cameraId, silent = false) => {
      if (!silent) setIsSubmitting(true);
      try {
        const response = await startStreamMutation.mutateAsync(cameraId);

        if (!silent && response?.success) {
          Swal.fire({
            icon: "success",
            title: "Stream Started",
            text: "Camera stream started successfully",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }

        return response?.data || response;
      } catch {
        return null;
      } finally {
        if (!silent) setIsSubmitting(false);
      }
    },
    [startStreamMutation],
  );

  const stopStream = useCallback(
    async (cameraId, silent = false) => {
      if (!silent) setIsSubmitting(true);
      try {
        const response = await stopStreamMutation.mutateAsync(cameraId);

        if (!silent && response?.success) {
          Swal.fire({
            icon: "info",
            title: "Stream Stopped",
            text: "Camera stream stopped successfully",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }

        return response?.data || response;
      } catch {
        return null;
      } finally {
        if (!silent) setIsSubmitting(false);
      }
    },
    [stopStreamMutation],
  );

  const restartStream = useCallback(
    async (cameraId) => {
      setIsSubmitting(true);
      try {
        const response = await restartStreamMutation.mutateAsync(cameraId);

        if (response?.success) {
          Swal.fire({
            icon: "success",
            title: "Stream Restarted",
            text: "Camera stream restarted successfully",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }

        return response?.data || response;
      } catch {
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [restartStreamMutation],
  );

  // ✅ Bulk start all streams (uses fetch directly, not hook)
  const startAllStreams = useCallback(
    async (cameraIds) => {
      try {
        console.log(`🚀 Starting ${cameraIds.length} streams...`);

        const BATCH_SIZE = 5;
        const results = [];

        for (let i = 0; i < cameraIds.length; i += BATCH_SIZE) {
          const batch = cameraIds.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.allSettled(
            batch.map((id) => cameraApi.startStream(id)),
          );
          results.push(...batchResults);

          if (i + BATCH_SIZE < cameraIds.length) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        console.log(`✅ Started ${succeeded}, failed ${failed}`);

        // Invalidate to refresh
        await queryClient.invalidateQueries({ queryKey: cameraKeys.all });

        return { succeeded, failed };
      } catch (err) {
        console.error("Bulk start error:", err);
      }
    },
    [queryClient],
  );

  // ============================================
  // HELPERS
  // ============================================

  const cameras = camerasQuery.data?.cameras || [];
  const pagination = camerasQuery.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  };

  const getOnlineCount = useCallback(
    () => cameras.filter((cam) => cam.streamStatus === "online").length,
    [cameras],
  );
  const getOfflineCount = useCallback(
    () => cameras.filter((cam) => cam.streamStatus === "offline").length,
    [cameras],
  );
  const getActiveCount = useCallback(
    () => cameras.filter((cam) => cam.status === "active").length,
    [cameras],
  );
  const getInactiveCount = useCallback(
    () => cameras.filter((cam) => cam.status === "inactive").length,
    [cameras],
  );
  const getStreamingCount = useCallback(
    () => cameras.filter((cam) => cam.isStreaming).length,
    [cameras],
  );

  // ============================================
  // PARAMS CONTROL
  // ============================================

  const fetchCameras = useCallback(async (newParams = {}) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    // React Query automatically refetches when params change
    // No manual fetch needed
    return null;
  }, []);

  const setFilters = useCallback((newFilters) => {
    setParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Manual refresh helpers
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: cameraKeys.all });
  }, [queryClient]);

  const fetchStats = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: cameraKeys.stats() });
  }, [queryClient]);

  const fetchStreamStats = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: cameraKeys.streamStats() });
  }, [queryClient]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data (from React Query cache)
    cameras,
    pagination,
    stats: statsQuery.data || null,
    streamStats: streamStatsQuery.data || null,

    // Loading states
    loading: camerasQuery.isLoading,               // Only initial load
    isFetching: camerasQuery.isFetching,           // Any fetch (background)
    isStatsLoading: statsQuery.isLoading,
    isStreamStatsLoading: streamStatsQuery.isLoading,
    isSubmitting,

    // Errors
    error: camerasQuery.error?.message || null,
    statsError: statsQuery.error?.message || null,

    // Refetch functions
    fetchCameras,           // Updates params, auto-refetches
    fetchStats,             // Manual refetch stats
    fetchStreamStats,       // Manual refetch stream stats
    refreshData,            // Invalidate all

    // Filters
    filters: params,
    setFilters,

    // CRUD
    addCamera,
    editCamera,
    removeCamera,
    statusToggle,

    // Stream management
    startStream,
    stopStream,
    restartStream,
    startAllStreams,

    // Helpers
    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
    getStreamingCount,

    // Mutation states (optional advanced usage)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};