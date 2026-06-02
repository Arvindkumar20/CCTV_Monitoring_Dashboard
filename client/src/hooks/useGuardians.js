import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { guardianApi } from "@/services/api/guardian.api";

export const useGuardians = () => {
  const [guardians, setGuardians] = useState([]);
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

  // Load guardians
  useEffect(() => {
    const loadGuardians = async () => {
      try {
        setLoading(true);

        // Fetch guardians and stats in parallel
        const [guardiansRes, statsRes] = await Promise.all([
          guardianApi.getAll({ page: 1, limit: 10 }),
          guardianApi.getStats(),
        ]);

        if (guardiansRes?.success) {
          setGuardians(guardiansRes.data?.guardians || guardiansRes.data || []);
          if (guardiansRes.pagination) {
            setPagination(guardiansRes.pagination);
          }
        }

        if (statsRes?.success) {
          setStats(statsRes.data);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load guardians:", err);
        setError(err.message || "Failed to load guardians");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load guardians",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadGuardians();
  }, []);

  // Fetch guardians with filters
  const fetchGuardians = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);

        const queryParams = {
          page: params.page || pagination.page,
          limit: params.limit || pagination.limit,
          ...filters,
          ...params,
        };

        const response = await guardianApi.getAll(queryParams);

        if (response?.success) {
          setGuardians(response.data?.guardians || response.data || []);
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
          text: err.message || "Failed to fetch guardians",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit],
  );

  // Create guardian
  const addGuardian = async (data) => {
    try {
      setIsSubmitting(true);

      // Format data for API
      const guardianData = {
        name: data.guardianName || data.name,
        mobile: data.mobile || data.phone?.replace(/\s+/g, ""),
        email: data.email,
        studentName: data.studentName || data.student?.name,
        dob: data.dob,
        classId: data.Class,
        sectionId: data.section,
        groupId: data.group || null,
        relationship: data.relationship || "guardian",
        address: data.address,
        occupation: data.occupation,
        alternatePhone: data.alternatePhone,
        emergencyContact: data.emergencyContact,
      };

      const response = await guardianApi.create(guardianData);

      if (response?.success) {
        // Refresh guardians list
        await fetchGuardians();

        // Refresh stats
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Guardian added successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to add guardian",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update guardian
  const editGuardian = async (id, data) => {
    console.log(data);
    try {
      setIsSubmitting(true);

      // Format data for API
      const guardianData = {
        guardianName: data.guardianName || data.name,
        mobile: data.mobile || data.phone?.replace(/\s+/g, ""),
        email: data.email,
        studentName: data.studentName || data.student?.name,
        dob: data.dob,
        Class: data.mainCategoryId,
        section: data.subCategoryId,
        group: data.subSubCategoryId || null,
        relationship: data.relationship || "Parent",
        status: data.status,
        address: data.address,
        occupation: data.occupation,
        alternatePhone: data.alternatePhone,
        emergencyContact: data.emergencyContact,
      };

      const response = await guardianApi.update(id, guardianData);

      if (response?.success) {
        // Update local state
        setGuardians((prev) =>
          prev.map((g) =>
            g._id === id || g.id === id ? { ...g, ...response.data } : g,
          ),
        );

        // Refresh stats
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Guardian updated successfully",
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
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update guardian",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete guardian
  const removeGuardian = async (id) => {
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

      const response = await guardianApi.delete(id);

      if (response?.success) {
        // Update local state
        setGuardians((prev) => prev.filter((g) => g._id !== id && g.id !== id));

        // Refresh stats
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.message || "Guardian has been removed.",
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
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete guardian",
      });
      return false;
    }
  };

  // Reset password
  const resetPassword = async (id, password) => {
    try {
      const response = await guardianApi.resetPassword(id, password);

      if (response?.success) {
        // Show temporary password
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          html: `
            <p>Temporary password has been generated:</p>
            <div class="mt-3 p-3 bg-slate-100 rounded-lg font-mono text-lg font-bold">
              ${response.data?.newPassword}
            </div>
            <p class="text-xs text-slate-500 mt-2">User must change password on next login</p>
          `,
          confirmButtonColor: "#2563eb",
        });

        return true;
      }
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to reset password",
      });
      return false;
    }
  };

  // Bulk upload guardians - UPDATED to use guardianApi.bulkUpload
  const bulkUploadGuardians = async (guardiansData) => {
    try {
      setIsSubmitting(true);

      // Format data for API - API expects { guardians: [...] }
      const formattedData = guardiansData.map((data) => ({
        guardianName: data.guardianName || data.name,
        mobile: data.mobile || data.phone?.replace(/\s+/g, ""),
        email: data.email,
        studentName: data.studentName || data.student?.name,
        dob: data.dob,
        class: data.class,
        section: data.section,
        group: data.group || null,
        relationship: data.relationship || "Parent",
      }));

      const response = await guardianApi.bulkUpload({
        guardians: formattedData,
      });

      if (response?.success) {
        // Refresh guardians list
        await fetchGuardians();

        // Refresh stats
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `
            <p>Bulk upload completed:</p>
            <div class="mt-2 text-left">
              <p class="text-green-600">✅ Successful: ${response.data?.success?.length || 0}</p>
              <p class="text-red-600">❌ Failed: ${response.data?.failed?.length || 0}</p>
              <p class="text-blue-600">📊 Total: ${response.data?.total || guardiansData.length}</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      }
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to process bulk upload",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Import from file (Excel/CSV) - UPDATED to use guardianApi.importFromFile
  const importFromFile = async (file) => {
    // console.log(object)
    try {
      setIsSubmitting(true);

      const response = await guardianApi.importFromFile(file);
      console.log(response);
      if (response?.success) {
        // Refresh guardians list
        await fetchGuardians();

        // Refresh stats
        await fetchStats();

        Swal.fire({
          icon: "success",
          title: "Import Successful",
          html: `
            <p>File import completed:</p>
            <div class="mt-2 text-left">
              <p class="text-green-600">✅ Imported: ${response.data?.success?.length || 0}</p>
              <p class="text-red-600">❌ Failed: ${response.data?.failed?.length || 0}</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        });

        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message || err.message || "Failed to import file",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export guardians
  const exportGuardians = async (format = "json", exportFilters = {}) => {
    try {
      const response = await guardianApi.exportGuardians(format, exportFilters);

      if (response?.success || response) {
        let filename, blob;

        if (format === "csv") {
          // Handle CSV download
          blob = new Blob([response], { type: "text/csv" });
          filename = `guardians_${new Date().toISOString()}.csv`;
        } else if (format === "excel") {
          // Handle Excel download
          blob = new Blob([response], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          filename = `guardians_${new Date().toISOString()}.xlsx`;
        } else {
          // Handle JSON download
          const dataStr = JSON.stringify(response.data || response, null, 2);
          blob = new Blob([dataStr], { type: "application/json" });
          filename = `guardians_${new Date().toISOString()}.json`;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        Swal.fire({
          icon: "success",
          title: "Exported!",
          text: "Guardians exported successfully",
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
        text: err.message || "Failed to export guardians",
      });
      return false;
    }
  };

  // Get login history
  const getLoginHistory = async (guardianId, params = {}) => {
    try {
      const response = await guardianApi.getLoginHistory(guardianId, params);
      if (response?.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch login history:", err);
      return null;
    }
  };

  // Toggle guardian status
  const toggleStatus = async (id, status) => {
    try {
      const response = await guardianApi.toggleStatus(id, status);

      if (response?.success) {
        // Update local state
        setGuardians((prev) =>
          prev.map((g) => (g._id === id || g.id === id ? { ...g, status } : g)),
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Guardian status changed to ${status}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        return response.data;
      }
      return false;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update status",
      });
      return false;
    }
  };

  // Unlock guardian account
  const unlockAccount = async (id) => {
    try {
      const response = await guardianApi.unlockAccount(id);

      if (response?.success) {
        // Update local state
        setGuardians((prev) =>
          prev.map((g) =>
            g._id === id || g.id === id ? { ...g, status: "active" } : g,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Account Unlocked",
          text: response.message || "Account unlocked successfully",
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
        text: err.message || "Failed to unlock account",
      });
      return false;
    }
  };

  // Get device history
  const getDeviceHistory = async (id) => {
    try {
      const response = await guardianApi.getDeviceHistory(id);
      if (response?.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch device history:", err);
      return [];
    }
  };

  // Revoke device access
  const revokeDevice = async (guardianId, deviceId) => {
    try {
      const response = await guardianApi.revokeDevice(guardianId, deviceId);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Device Revoked",
          text: response.message || "Device access revoked successfully",
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
        text: err.message || "Failed to revoke device",
      });
      return false;
    }
  };

  // Search guardians
  const searchGuardians = async (query, additionalFilters = {}) => {
    try {
      const response = await guardianApi.search(query, additionalFilters);
      if (response?.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Search failed:", err);
      return [];
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await guardianApi.getStats();
      if (response?.success) {
        setStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Lookup guardian by mobile/email
  const lookupGuardian = async (identifier) => {
    try {
      const response = await guardianApi.lookup(identifier);
      if (response?.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Lookup failed:", err);
      return null;
    }
  };

  // Download sample import file
  const downloadSampleFile = async (format = "csv") => {
    try {
      const blob = await guardianApi.downloadSampleFile(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guardians_sample.${format === "excel" ? "xlsx" : "csv"}`;
      a.click();

      return true;
    } catch (err) {
      console.error("Failed to download sample:", err);
      return false;
    }
  };

  // Validate import data
  const validateImport = async (guardiansData) => {
    try {
      const response = await guardianApi.validateImport(guardiansData);
      if (response?.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Validation failed:", err);
      return null;
    }
  };

  // Get guardians by class
  const getByClass = async (className, params = {}) => {
    try {
      const response = await guardianApi.getByClass(className, params);
      if (response?.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch by class:", err);
      return [];
    }
  };

  // Get guardians by section
  const getBySection = async (section, params = {}) => {
    try {
      const response = await guardianApi.getBySection(section, params);
      if (response?.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch by section:", err);
      return [];
    }
  };

  // Get guardians by status
  const getByStatus = async (status, params = {}) => {
    try {
      const response = await guardianApi.getByStatus(status, params);
      if (response?.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch by status:", err);
      return [];
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    fetchGuardians({ page: 1 });
  };

  // Change page
  const changePage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchGuardians({ page });
  };

  // Change limit
  const changeLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
    fetchGuardians({ limit, page: 1 });
  };

  // Get counts
  const getActiveCount = () => {
    return guardians.filter((g) => g.status === "active").length;
  };

  const getInactiveCount = () => {
    return guardians.filter((g) => g.status === "inactive").length;
  };

  const getPendingCount = () => {
    return guardians.filter((g) => g.status === "pending").length;
  };

  const getLockedCount = () => {
    return guardians.filter((g) => g.status === "locked").length;
  };

  const getSuspendedCount = () => {
    return guardians.filter((g) => g.status === "suspended").length;
  };

  return {
    // Data
    guardians,
    loading,
    error,
    isSubmitting,
    pagination,
    filters,
    stats,

    // CRUD Operations
    addGuardian,
    editGuardian,
    removeGuardian,
    resetPassword,
    toggleStatus,
    unlockAccount,

    // Bulk Operations - UPDATED (but function signatures remain same)
    bulkUploadGuardians,
    importFromFile,
    exportGuardians,

    // Fetch operations
    fetchGuardians,
    fetchStats,

    // Login & Device History
    getLoginHistory,
    getDeviceHistory,
    revokeDevice,

    // Search & Lookup
    searchGuardians,
    lookupGuardian,
    validateImport,
    downloadSampleFile,

    // Category-based fetches
    getByClass,
    getBySection,
    getByStatus,

    // Helper functions
    getActiveCount,
    getInactiveCount,
    getPendingCount,
    getLockedCount,
    getSuspendedCount,

    // Filter & Pagination
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
  };
};
