
// hooks/useSubCategories.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import { subCategoryApi } from "@/services/api/subCategory.api";
import { categoryApi } from "@/services/api/category.api";
import { useAuth } from "./useAuth";

// Constants
const ERROR_MESSAGES = {
  LOAD_FAILED: "Failed to load sub categories",
  CREATE_FAILED: "Failed to create sub category",
  UPDATE_FAILED: "Failed to update sub category",
  DELETE_FAILED: "Failed to delete sub category",
  SEARCH_FAILED: "Failed to search sub categories",
  FETCH_FAILED: "Failed to fetch sub category",
  BULK_DELETE_FAILED: "Failed to delete sub categories",
  REORDER_FAILED: "Failed to reorder sub categories",
  MAIN_CATEGORIES_FAILED: "Failed to load main categories",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
};

const TOAST_CONFIG = {
  icon: "error",
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubCategories = (initialFilters = {}) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");

  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const { isAuthenticated, user } = useAuth();

  // Abort previous requests
  const abortPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  // Load main categories
  const loadMainCategories = useCallback(async (skipCache = false) => {
    if (!isAuthenticated) {
      setError(ERROR_MESSAGES.SESSION_EXPIRED);
      return [];
    }

    const cacheKey = `mainCategories-${user?.id}`;

    if (!skipCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        setMainCategories(cached.data);
        return cached.data;
      }
    }

    try {
      const response = await categoryApi.getAllCategories({ limit: 100 });
  
      const categories = response?.data?.categories || response?.data || [];

      // Update cache
      cacheRef.current.set(cacheKey, {
        data: categories,
        timestamp: Date.now()
      });

      setMainCategories(categories);
      return categories;
    } catch (err) {
      console.error("Failed to load main categories:", err);
      return [];
    }
  }, [isAuthenticated, user?.id]);

  // Load sub categories with pagination
  const loadSubCategories = useCallback(async (page = 1, limit = 10, newFilters = {}, skipCache = false) => {
    if (!isAuthenticated) {
      setError(ERROR_MESSAGES.SESSION_EXPIRED);
      setLoading(false);
      return null;
    }

    const controller = abortPreviousRequest();
    const cacheKey = `subCategories-${page}-${limit}-${JSON.stringify(newFilters)}-${user?.id}`;

    if (!skipCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubCategories(cached.data.subCategories || []);
        setGroupedData(cached.data.groupedByCategory || []);
        if (cached.data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...cached.data.pagination,
            hasNextPage: cached.data.pagination.page < cached.data.pagination.pages,
            hasPrevPage: cached.data.pagination.page > 1,
          }));
        }
        setLoading(false);
        setInitialized(true);
        return cached.data;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(page === pagination.page);

      const response = await subCategoryApi.getAllSubCategories({
        page,
        limit,
        ...filters,
        ...newFilters,
      });
console.log(response)
      const responseData = response?.data || response;
      const subCats = responseData.subCategories || [];
      const grouped = responseData.groupedByCategory || [];
      const responsePagination = responseData.pagination;

      // Update cache
      cacheRef.current.set(cacheKey, {
        data: { 
          subCategories: subCats, 
          groupedByCategory: grouped, 
          pagination: responsePagination 
        },
        timestamp: Date.now()
      });

      setSubCategories(subCats);
      setGroupedData(grouped);
      
      if (responsePagination) {
        setPagination({
          ...responsePagination,
          hasNextPage: responsePagination.page < responsePagination.pages,
          hasPrevPage: responsePagination.page > 1,
        });
      }

      setInitialized(true);
      return responseData;
    } catch (err) {
      if (err.name === 'AbortError') return null;

      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.LOAD_FAILED;
      setError(errorMessage);

      Swal.fire({
        ...TOAST_CONFIG,
        title: "Error",
        text: errorMessage,
      });

      return null;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, isAuthenticated, pagination.page, user?.id]);

  // Load by main category
  const loadByMainCategory = useCallback(async (mainCategoryId) => {
    if (!isAuthenticated || !mainCategoryId) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await subCategoryApi.getByMainCategory(mainCategoryId);
      console.log(subCategories)
      const data = response?.data || response;

      setSubCategories(data.subCategories || []);
      setGroupedData([{
        category: data.mainCategory,
        subCategories: data.subCategories || []
      }]);

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.LOAD_FAILED;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create sub category
  const addSubCategory = useCallback(async (data) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: ERROR_MESSAGES.SESSION_EXPIRED,
      });
      return false;
    }

    try {
      setIsSubmitting(true);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticSub = {
        id: tempId,
        _id: tempId,
        ...data,
        mainCategoryId: mainCategories.find(c => c.id === data.mainCategoryId || c._id === data.mainCategoryId),
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setSubCategories(prev => [optimisticSub, ...prev]);

      const response = await subCategoryApi.createSubCategory(data);
      console.log(response)
      const newSubCategory = response?.data || response;

      // Replace optimistic with real
      setSubCategories(prev => 
        prev.map(sub => 
          (sub.id === tempId || sub._id === tempId) ? newSubCategory : sub
        )
      );

      // Clear cache
      cacheRef.current.clear();

      // Refresh main categories if needed
      loadMainCategories(true);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Sub category created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      console.log(err.errors)
      // Rollback optimistic update
      setSubCategories(prev => prev.filter(sub => !sub.isOptimistic));

      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.CREATE_FAILED;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, mainCategories, loadMainCategories]);

  // Update sub category
  const editSubCategory = useCallback(async (id, data) => {
    if (!isAuthenticated) return false;

    try {
      setIsSubmitting(true);

      // Store original for rollback
      const originalSubs = [...subCategories];

      // Optimistic update
      setSubCategories(prev => 
        prev.map(sub => 
          (sub.id === id || sub._id === id) 
            ? { ...sub, ...data, isOptimistic: true }
            : sub
        )
      );

      const response = await subCategoryApi.updateSubCategory(id, data);
      console.log(response)
      const updatedSubCategory = response?.data || response;

      setSubCategories(prev => 
        prev.map(sub => 
          (sub.id === id || sub._id === id) ? updatedSubCategory : sub
        )
      );

      cacheRef.current.clear();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Sub category updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      // Rollback to original
      setSubCategories(originalSubs);

      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.UPDATE_FAILED;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, subCategories]);

  // Delete sub category
  const removeSubCategory = useCallback(async (id) => {
    // Find sub category name for confirmation
    const subToDelete = subCategories.find(s => s.id === id || s._id === id);

   let originalSubs;
    try {
      // Optimistic delete
       originalSubs = [...subCategories];
      setSubCategories(prev => prev.filter(sub => sub.id !== id && sub._id !== id));

      await subCategoryApi.deleteSubCategory(id);

      cacheRef.current.clear();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Sub category has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      // Rollback
      setSubCategories(originalSubs);

      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.DELETE_FAILED;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    }
  }, [subCategories]);

  // Bulk delete
  const bulkDeleteSubCategories = useCallback(async (ids) => {
    if (!ids?.length) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "No sub categories selected",
      });
      return false;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${ids.length} sub categories. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (!result.isConfirmed) return false;

    try {
      await subCategoryApi.bulkDeleteSubCategories(ids);

      setSubCategories(prev => 
        prev.filter(sub => !ids.includes(sub.id) && !ids.includes(sub._id))
      );
      setSelectedSubCategories(new Set());

      cacheRef.current.clear();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${ids.length} sub categories deleted.`,
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.BULK_DELETE_FAILED;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    }
  }, []);

  // Toggle status
  const toggleStatus = useCallback(async (id) => {
    try {
      const response = await subCategoryApi.toggleStatus(id);
      const updated = response?.data || response;

      setSubCategories(prev => 
        prev.map(sub => 
          (sub.id === id || sub._id === id) ? updated : sub
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to toggle status";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return false;
    }
  }, []);

  // Reorder
  const reorderSubCategories = useCallback(async (mainCategoryId, orderedIds) => {
    try {
      const response = await subCategoryApi.reorderSubCategories(mainCategoryId, orderedIds);
      const data = response?.data || response;

      setSubCategories(data.subCategories || subCategories);
      setGroupedData(data.groupedByCategory || groupedData);

      cacheRef.current.clear();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Order updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.REORDER_FAILED;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return false;
    }
  }, [subCategories, groupedData]);

  // Search
  const searchSubCategories = useCallback(async (query, mainCategoryId = null) => {
    setSearchQuery(query);

    if (!query || query.length < 2) {
      loadSubCategories(1, pagination.limit, filters);
      return;
    }

    try {
      setLoading(true);
      const response = await subCategoryApi.searchSubCategories(query, mainCategoryId);
      const results = response?.data || response;

      setSubCategories(Array.isArray(results) ? results : []);
      return results;
    } catch (err) {
      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.SEARCH_FAILED;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, loadSubCategories]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await subCategoryApi.getStats();
      const statsData = response?.data || response;
      setStats(statsData);
      return statsData;
    } catch (err) {
      return null;
    }
  }, []);

  // Duplicate
  const duplicateSubCategory = useCallback(async (id) => {
    try {
      const response = await subCategoryApi.duplicateSubCategory(id);
      const newSubCategory = response?.data || response;

      setSubCategories(prev => [newSubCategory, ...prev]);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Sub category duplicated",
        timer: 1500,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to duplicate";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return false;
    }
  }, []);

  // Export
  const exportSubCategories = useCallback(async (mainCategoryId = null) => {
    try {
      const response = await subCategoryApi.exportSubCategories(mainCategoryId);
      const data = response?.data || response;

      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sub-categories-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Exported!",
        text: "Data exported successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to export";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return false;
    }
  }, []);

  // Import
  const importSubCategories = useCallback(async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await subCategoryApi.importSubCategories(data);
      const result = response?.data || response;

      // Refresh data
      loadSubCategories(1, pagination.limit, filters, true);

      Swal.fire({
        icon: "success",
        title: "Imported!",
        text: `Successfully imported ${result.created?.length || 0} sub categories`,
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to import";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return false;
    }
  }, [filters, pagination.limit, loadSubCategories]);

  // Selection helpers
  const toggleSelection = useCallback((id) => {
    setSelectedSubCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedSubCategories(prev => {
      if (prev.size === subCategories.length) {
        return new Set();
      }
      const allIds = new Set(
        subCategories.map(sub => sub._id || sub.id).filter(Boolean)
      );
      return allIds;
    });
  }, [subCategories]);

  const clearSelection = useCallback(() => {
    setSelectedSubCategories(new Set());
  }, []);

  // Pagination
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Filters
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchQuery("");
  }, [initialFilters]);

  // Refresh
  const refresh = useCallback(() => {
    cacheRef.current.clear();
    loadMainCategories(true);
    loadSubCategories(pagination.page, pagination.limit, filters, true);
    loadStats();
  }, [pagination.page, pagination.limit, filters, loadMainCategories, loadSubCategories, loadStats]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        loadMainCategories(),
        loadSubCategories(pagination.page, pagination.limit, filters),
        loadStats(),
      ]);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated]);

  // Load when pagination/filters change
  useEffect(() => {
    if (isAuthenticated && initialized) {
      loadSubCategories(pagination.page, pagination.limit, filters);
    }
  }, [pagination.page, pagination.limit, filters, isAuthenticated, initialized]);

  // Memoized values
  const selectedCount = useMemo(() => selectedSubCategories.size, [selectedSubCategories]);
  const hasSelected = useMemo(() => selectedCount > 0, [selectedCount]);
  const allSelected = useMemo(
    () => subCategories.length > 0 && selectedCount === subCategories.length,
    [subCategories.length, selectedCount]
  );

  // Group sub categories by main category for display
  const subCategoriesByCategory = useMemo(() => {
    if (groupedData.length > 0) {
      return groupedData;
    }

    const grouped = {};
    subCategories.forEach(sub => {
      const mainCatId = sub.mainCategoryId?._id || sub.mainCategoryId;
      const mainCatName = sub.mainCategoryId?.name || 'Uncategorized';
      const mainCatColor = sub.mainCategoryId?.color || '#3b82f6';

      if (!grouped[mainCatId]) {
        grouped[mainCatId] = {
          category: {
            _id: mainCatId,
            name: mainCatName,
            color: mainCatColor,
          },
          subCategories: []
        };
      }
      grouped[mainCatId].subCategories.push(sub);
    });

    return Object.values(grouped);
  }, [subCategories, groupedData]);

  // Get main category by ID
  const getMainCategoryById = useCallback((id) => {
    return mainCategories.find(cat => cat.id === id || cat._id === id);
  }, [mainCategories]);

  return {
    // Data
    mainCategories,
    subCategories,
    groupedData: subCategoriesByCategory,
    stats,
    
    // Status
    loading,
    error,
    isSubmitting,
    isRefreshing,
    initialized,
    
    // Selection
    selectedSubCategories: Array.from(selectedSubCategories),
    selectedCount,
    hasSelected,
    allSelected,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    
    // Pagination
    pagination,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
    totalPages: pagination.totalPages,
    changePage,
    changeLimit,
    
    // Search
    searchQuery,
    setSearchQuery,
    searchSubCategories,
    
    // Filters
    filters,
    applyFilters,
    resetFilters,
    
    // CRUD Operations
    addSubCategory,
    editSubCategory,
    removeSubCategory,
    bulkDeleteSubCategories,
    toggleStatus,
    
    // Advanced Operations
    reorderSubCategories,
    duplicateSubCategory,
    exportSubCategories,
    importSubCategories,
    
    // Utilities
    refresh,
    loadByMainCategory,
    getMainCategoryById,
    loadStats,
  };
};