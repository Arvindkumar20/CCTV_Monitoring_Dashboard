// import { cameraApi } from "@/services/api/camera.api";
// import { useState, useEffect, useCallback } from "react";
// import Swal from "sweetalert2";

// export const useCameras = () => {
//   const [cameras, setCameras] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [cameraStatus, setCameraStatus] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 0,
//   });
//   const [filters, setFilters] = useState({});
//   const [stats, setStats] = useState(null);

//   // Initial Load
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         setLoading(true);

//         const [camerasRes, statsRes] = await Promise.all([
//           cameraApi.getAll({ page: 1, limit: 10 }),
//           cameraApi.getStats(),
//         ]);

//         if (camerasRes?.success) {
//           setCameras(camerasRes.data?.cameras || camerasRes.data || []);
//           if (camerasRes.pagination) {
//             setPagination(camerasRes.pagination);
//           }
//         }

//         if (statsRes?.success) {
//           setStats(statsRes.data);
//         }

//         setError(null);
//       } catch (err) {
//         setError(err.message || "Failed to load camera data");
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: err.message || "Failed to load camera data",
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//           timer: 3000,
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadInitialData();
//   }, []);

//   // Fetch Cameras
//   const fetchCameras = useCallback(
//     async (params = {}) => {
//       try {
//         setLoading(true);

//         const queryParams = {
//           page: params.page || pagination.page,
//           limit: params.limit || pagination.limit,
//           ...filters,
//           ...params,
//         };

//         const response = await cameraApi.getAll(queryParams);

//         if (response?.success) {
//           setCameras(response.data?.cameras || response.data || []);
//           if (response.pagination) {
//             setPagination(response.pagination);
//           }
//         }

//         return response;
//       } catch (err) {
//         setError(err.message);
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: err.message || "Failed to fetch cameras",
//         });
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [filters, pagination.page, pagination.limit],
//   );

//   // Create Camera
//   const addCamera = async (data) => {
//     try {
//       setIsSubmitting(true);
//       const response = await cameraApi.create(data);

//       if (response?.success) {
//         await fetchCameras();
//         await fetchStats();

//         Swal.fire({
//           icon: "success",
//           title: "Success!",
//           text: response.message || "Camera added successfully",
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         return true;
//       }
//       return false;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Failed to add camera",
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Update Camera
//   const editCamera = async (id, data) => {
//     try {
//       setIsSubmitting(true);
//       const response = await cameraApi.update(id, data);

//       if (response?.success) {
//         setCameras((prev) =>
//           prev.map((cam) =>
//             cam._id === id ? { ...cam, ...response.data } : cam,
//           ),
//         );

//         await fetchStats();

//         Swal.fire({
//           icon: "success",
//           title: "Updated!",
//           text: response.message || "Camera updated successfully",
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         return true;
//       }
//       return false;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Failed to update camera",
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Delete Camera
//   const removeCamera = async (id) => {
//     try {
//       const result = await Swal.fire({
//         title: "Are you sure?",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#d33",
//         confirmButtonText: "Yes, delete it!",
//       });

//       if (!result.isConfirmed) return false;

//       const response = await cameraApi.delete(id);

//       if (response?.success) {
//         setCameras((prev) => prev.filter((cam) => cam._id !== id));
//         await fetchStats();

//         Swal.fire({
//           icon: "success",
//           title: "Deleted!",
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         return true;
//       }
//       return false;
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.message || "Failed to delete camera",
//       });
//       return false;
//     }
//   };

//   // Fetch Stats
//   const fetchStats = async () => {
//     try {
//       const response = await cameraApi.getStats();
//       if (response?.success) {
//         setStats(response.data);
//         return response.data;
//       }
//     } catch (err) {
//       console.error("Failed to fetch stats:", err);
//     }
//   };

//   // Helpers
//   const getOnlineCount = () =>
//     cameras.filter((cam) => cam.streamStatus === "online").length;

//   const getOfflineCount = () =>
//     cameras.filter((cam) => cam.streamStatus === "offline").length;

//   const getActiveCount = () =>
//     cameras.filter((cam) => cam.status === "active").length;

//   const getInactiveCount = () =>
//     cameras.filter((cam) => cam.status === "inactive").length;

//   const statusToggle = async (id) => {
   
//     const res = await cameraApi.toggleStatus(id);
//     // console.log(res.data.status);
//      setCameraStatus(res.data.status);
//      fetchCameras();
//      return res.data.status;
//   };
//   return {
//     cameras,
//     loading,
//     error,
//     isSubmitting,
//     pagination,
//     filters,
//     stats,

//     addCamera,
//     editCamera,
//     removeCamera,
//     fetchCameras,
//     fetchStats,
//     cameraStatus,
//     statusToggle,
//     getOnlineCount,
//     getOfflineCount,
//     getActiveCount,
//     getInactiveCount,
//   };
// };

// hooks/useCameras.js
import { cameraApi } from "@/services/api/camera.api";
import { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";

export const useCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [streamStats, setStreamStats] = useState(null);
  
  const pollingInterval = useRef(null);
  const isMounted = useRef(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    isMounted.current = true;
    
    // Start polling
    pollingInterval.current = setInterval(() => {
      if (isMounted.current) {
        refreshData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      isMounted.current = false;
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Refresh data in background
  const refreshData = useCallback(async () => {
    try {
      const [camerasRes, statsRes, streamStatsRes] = await Promise.all([
        cameraApi.getAll({ page: pagination.page, limit: pagination.limit }),
        cameraApi.getStats(),
        cameraApi.getStreamDashboardStats(),
      ]);

      if (camerasRes?.success && isMounted.current) {
        setCameras(camerasRes.data?.cameras || camerasRes.data || []);
        if (camerasRes.pagination) {
          setPagination(camerasRes.pagination);
        }
      }

      if (statsRes?.success && isMounted.current) {
        setStats(statsRes.data);
      }

      if (streamStatsRes?.success && isMounted.current) {
        setStreamStats(streamStatsRes.data);
      }
    } catch (err) {
      // Silent refresh - don't show errors
      console.debug("Background refresh failed:", err);
    }
  }, [pagination.page, pagination.limit]);

  // Initial Load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [camerasRes, statsRes, streamStatsRes] = await Promise.all([
          cameraApi.getAll({ page: 1, limit: 10 }),
          cameraApi.getStats(),
          cameraApi.getStreamDashboardStats(),
        ]);

        if (camerasRes?.success && isMounted.current) {
          setCameras(camerasRes.data?.cameras || camerasRes.data || []);
          if (camerasRes.pagination) {
            setPagination(camerasRes.pagination);
          }
        }

        if (statsRes?.success && isMounted.current) {
          setStats(statsRes.data);
        }

        if (streamStatsRes?.success && isMounted.current) {
          setStreamStats(streamStatsRes.data);
        }

        setError(null);
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "Failed to load camera data");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message || "Failed to load camera data",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, []);

  // Fetch Cameras
  const fetchCameras = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const queryParams = {
          page: params.page || pagination.page,
          limit: params.limit || pagination.limit,
          ...filters,
          ...params,
        };

        const response = await cameraApi.getAll(queryParams);

        if (response?.success && isMounted.current) {
          setCameras(response.data?.cameras || response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }

        return response;
      } catch (err) {
        if (isMounted.current) {
          setError(err.message);
        }
        throw err;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [filters, pagination.page, pagination.limit],
  );

  // Create Camera
  const addCamera = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.create(data);

      if (response?.success) {
        await fetchCameras();
        await fetchStats();
        await fetchStreamStats();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Camera added successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return true;
      }
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to add camera",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Camera
  const editCamera = async (id, data) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.update(id, data);

      if (response?.success) {
        // Optimistic update
        setCameras((prev) =>
          prev.map((cam) =>
            cam._id === id ? { ...cam, ...response.data } : cam,
          ),
        );

        await fetchStats();
        await fetchStreamStats();

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: response.message || "Camera updated successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return true;
      }
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update camera",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Camera
  const removeCamera = async (id) => {
    try {
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

      // Optimistic delete
      const deletedCamera = cameras.find(cam => cam._id === id);
      setCameras((prev) => prev.filter((cam) => cam._id !== id));

      const response = await cameraApi.delete(id);

      if (response?.success) {
        await fetchStats();
        await fetchStreamStats();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return true;
      } else {
        // Revert on error
        if (deletedCamera) {
          setCameras((prev) => [...prev, deletedCamera]);
        }
        throw new Error("Delete failed");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to delete camera",
      });
      return false;
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await cameraApi.getStats();
      if (response?.success && isMounted.current) {
        setStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Fetch Stream Stats
  const fetchStreamStats = async () => {
    try {
      const response = await cameraApi.getStreamDashboardStats();
      if (response?.success && isMounted.current) {
        setStreamStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch stream stats:", err);
    }
  };

  // Toggle Status with optimistic update
  const statusToggle = useCallback(async (id) => {
    try {
      // Find camera to update
      const cameraToUpdate = cameras.find(cam => cam._id === id);
      if (!cameraToUpdate) return;

      // Calculate new status
      const newStatus = cameraToUpdate.status === "active" ? "inactive" : "active";
      const newStreamStatus = newStatus === "active" ? "online" : "offline";

      // Optimistic update - update UI immediately
      setCameras(prev => 
        prev.map(cam => 
          cam._id === id 
            ? { ...cam, status: newStatus, streamStatus: newStreamStatus }
            : cam
        )
      );

      // Update stats optimistically
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          active: newStatus === "active" ? (prev.active || 0) + 1 : (prev.active || 0) - 1,
          inactive: newStatus === "inactive" ? (prev.inactive || 0) + 1 : (prev.inactive || 0) - 1,
        };
      });

      // Make API call
      const res = await cameraApi.toggleStatus(id);
      
      // If API returns different status, sync back
      if (res?.data?.status !== newStatus) {
        await fetchCameras();
        await fetchStats();
        await fetchStreamStats();
      }

      return res?.data?.status;
    } catch (err) {
      // Revert on error - fetch fresh data
      await fetchCameras();
      await fetchStats();
      await fetchStreamStats();
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to toggle camera status",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }, [cameras, fetchCameras, fetchStats]);

  /**
   * ============================================
   * STREAM MANAGEMENT FUNCTIONS
   * ============================================
   */

  // Start stream
  const startStream = useCallback(async (cameraId) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.startStream(cameraId);

      if (response?.success) {
        // Update camera in list
        setCameras(prev => 
          prev.map(cam => 
            cam._id === cameraId 
              ? { ...cam, hlsUrl: response.data.hlsUrl, isStreaming: true, streamStatus: 'streaming' }
              : cam
          )
        );
        
        await fetchStreamStats();

        Swal.fire({
          icon: "success",
          title: "Stream Started",
          text: "Camera stream started successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return response.data;
      }
      return null;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to start stream",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Stop stream
  const stopStream = useCallback(async (cameraId) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.stopStream(cameraId);

      if (response?.success) {
        // Update camera in list
        setCameras(prev => 
          prev.map(cam => 
            cam._id === cameraId 
              ? { ...cam, hlsUrl: null, isStreaming: false, streamStatus: 'stopped' }
              : cam
          )
        );
        
        await fetchStreamStats();

        Swal.fire({
          icon: "info",
          title: "Stream Stopped",
          text: "Camera stream stopped successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return response.data;
      }
      return null;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to stop stream",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Restart stream
  const restartStream = useCallback(async (cameraId) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.restartStream(cameraId);

      if (response?.success) {
        // Update camera in list
        setCameras(prev => 
          prev.map(cam => 
            cam._id === cameraId 
              ? { ...cam, hlsUrl: response.data.hlsUrl, isStreaming: true, streamStatus: 'streaming' }
              : cam
          )
        );
        
        await fetchStreamStats();

        Swal.fire({
          icon: "success",
          title: "Stream Restarted",
          text: "Camera stream restarted successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        return response.data;
      }
      return null;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to restart stream",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Get stream status
  const getStreamStatus = useCallback(async (cameraId) => {
    try {
      const response = await cameraApi.getStreamStatus(cameraId);
      if (response?.success) {
        // Update camera in list
        setCameras(prev => 
          prev.map(cam => 
            cam._id === cameraId 
              ? { ...cam, ...response.data }
              : cam
          )
        );
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to get stream status:", err);
      return null;
    }
  }, []);

  // Get all active streams
  const fetchActiveStreams = useCallback(async () => {
    try {
      const response = await cameraApi.getActiveStreams();
      if (response?.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch active streams:", err);
      return null;
    }
  }, []);

  // Helper functions
  const getOnlineCount = useCallback(() => 
    cameras.filter((cam) => cam.streamStatus === "online").length, 
    [cameras]
  );
  
  const getOfflineCount = useCallback(() => 
    cameras.filter((cam) => cam.streamStatus === "offline").length, 
    [cameras]
  );
  
  const getActiveCount = useCallback(() => 
    cameras.filter((cam) => cam.status === "active").length, 
    [cameras]
  );
  
  const getInactiveCount = useCallback(() => 
    cameras.filter((cam) => cam.status === "inactive").length, 
    [cameras]
  );

  const getStreamingCount = useCallback(() => 
    cameras.filter((cam) => cam.streamStatus === "streaming").length, 
    [cameras]
  );

  return {
    cameras,
    loading,
    error,
    isSubmitting,
    pagination,
    filters,
    stats,
    streamStats,

    addCamera,
    editCamera,
    removeCamera,
    fetchCameras,
    fetchStats,
    fetchStreamStats,
    statusToggle,
    
    // Stream management functions
    startStream,
    stopStream,
    restartStream,
    getStreamStatus,
    fetchActiveStreams,
    
    // Helper functions
    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
    getStreamingCount,
    refreshData,
  };
};