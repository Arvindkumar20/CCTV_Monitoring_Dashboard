import { cameraApi } from "@/services/api/camera.api";
import { useState, useEffect, useCallback } from "react";
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

  // Initial Load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const [camerasRes, statsRes] = await Promise.all([
          cameraApi.getAll({ page: 1, limit: 10 }),
          cameraApi.getStats(),
        ]);

        if (camerasRes?.success) {
          setCameras(camerasRes.data?.cameras || camerasRes.data || []);
          if (camerasRes.pagination) {
            setPagination(camerasRes.pagination);
          }
        }

        if (statsRes?.success) {
          setStats(statsRes.data);
        }

        setError(null);
      } catch (err) {
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
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch Cameras
  const fetchCameras = useCallback(async (params = {}) => {
    try {
      setLoading(true);

      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params,
      };

      const response = await cameraApi.getAll(queryParams);

      if (response?.success) {
        setCameras(response.data?.cameras || response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }

      return response;
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to fetch cameras",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Create Camera
  const addCamera = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await cameraApi.create(data);

      if (response?.success) {
        await fetchCameras();
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Camera added successfully",
          timer: 2000,
          showConfirmButton: false,
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
        setCameras((prev) =>
          prev.map((cam) => (cam._id === id ? { ...cam, ...response.data } : cam))
        );

        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: response.message || "Camera updated successfully",
          timer: 2000,
          showConfirmButton: false,
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
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return false;

      const response = await cameraApi.delete(id);

      if (response?.success) {
        setCameras((prev) => prev.filter((cam) => cam._id !== id));
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 2000,
          showConfirmButton: false,
        });

        return true;
      }
      return false;
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
      if (response?.success) {
        setStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Helpers
  const getOnlineCount = () =>
    cameras.filter((cam) => cam.streamStatus === "online").length;

  const getOfflineCount = () =>
    cameras.filter((cam) => cam.streamStatus === "offline").length;

  const getActiveCount = () =>
    cameras.filter((cam) => cam.status === "active").length;

  const getInactiveCount = () =>
    cameras.filter((cam) => cam.status === "inactive").length;

  return {
    cameras,
    loading,
    error,
    isSubmitting,
    pagination,
    filters,
    stats,

    addCamera,
    editCamera,
    removeCamera,
    fetchCameras,
    fetchStats,

    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
  };
};