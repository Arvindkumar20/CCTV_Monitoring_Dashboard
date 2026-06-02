import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { nestedSubCategoryApi } from '@/services/api/nestedSubCategory.api';
import { categoryApi } from '@/services/api/category.api';
import { subCategoryApi } from '@/services/api/subCategory.api';
import Swal from 'sweetalert2';
import { useAuth } from './useAuth';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNestedSubCategories = (initialFilters = {}) => {
  const [nestedSubCategories, setNestedSubCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const [tree, setTree] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);

  const cacheRef = useRef(new Map());
  const { user, isAuthenticated } = useAuth();
  const abortControllerRef = useRef(null);

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
      // Fix: Handle different response structures
      const data = response?.data?.categories || response?.data || response || [];
      setMainCategories(data);
      
      // Update cache
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (err) {
      console.error('Failed to load main categories:', err);
      return [];
    }
  }, [user?.id]);

  // Load sub categories
  const loadSubCategories = useCallback(async (mainCategoryId = null, skipCache = false) => {
    const cacheKey = `subCategories-${mainCategoryId || 'all'}-${user?.id}`;

    if (!skipCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubCategories(cached.data);
        return cached.data;
      }
    }

    try {
      const params = mainCategoryId ? { mainCategoryId } : {};
      const response = await subCategoryApi.getAllSubCategories(params);
      // Fix: Handle different response structures
      const data = response?.data?.subCategories || response?.data || response || [];
      setSubCategories(data);
      
      // Update cache
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (err) {
      console.error('Failed to load sub categories:', err);
      return [];
    }
  }, [user?.id]);

  // Load nested sub categories
  const loadNestedSubCategories = useCallback(async (page = 1, limit = 10, newFilters = {}) => {
    if (!isAuthenticated) {
      setError('Session expired');
      setLoading(false);
      return null;
    }

    const controller = abortPreviousRequest();
    const cacheKey = `nested-${page}-${limit}-${JSON.stringify(newFilters)}-${user?.id}`;

    // Check cache
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        setNestedSubCategories(cached.data.items || []);
        if (cached.data.pagination) {
          setPagination(cached.data.pagination);
        }
        setLoading(false);
        return cached.data;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await nestedSubCategoryApi.getAll({
        page,
        limit,
        ...filters,
        ...newFilters
      }, { signal: controller.signal });

      // Fix: Handle different response structures
      const responseData = response?.data || response;
      const items = responseData.nestedSubCategories || responseData.items || responseData || [];
      const responsePagination = responseData.pagination || {
        page,
        limit,
        total: items.length,
        pages: Math.ceil(items.length / limit)
      };

      setNestedSubCategories(items);
      setPagination(responsePagination);

      // Update cache
      cacheRef.current.set(cacheKey, {
        data: { items, pagination: responsePagination },
        timestamp: Date.now()
      });

      return { items, pagination: responsePagination };
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return null;
      }
      const message = err.response?.data?.message || 'Failed to load nested sub categories';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, user?.id]);

  // Load tree
  const loadTree = useCallback(async (subCategoryId = null) => {
    if (!subCategoryId) return [];
    
    try {
      const response = await nestedSubCategoryApi.getTree(subCategoryId);
      // Fix: Handle different response structures
      const data = response?.data || response || [];
      setTree(data);
      return data;
    } catch (err) {
      console.error('Failed to load tree:', err);
      return [];
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await nestedSubCategoryApi.getStats();
      // Fix: Handle different response structures
      const data = response?.data || response || null;
      setStats(data);
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  // Create
  const addNestedSubCategory = useCallback(async (data) => {
    // console.log(data)
    try {
      setIsSubmitting(true);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = {
        id: tempId,
        _id: tempId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOptimistic: true
      };

      setNestedSubCategories(prev => [optimisticItem, ...prev]);

      const response = await nestedSubCategoryApi.create(data);
      console.log(response)
      // Fix: Handle different response structures
      const newItem = response?.data || response;

      // Replace optimistic with real
      setNestedSubCategories(prev =>
        prev.map(item => 
          (item.id === tempId || item._id === tempId) ? newItem : item
        )
      );

      // Clear cache
      cacheRef.current.clear();

      // Refresh related data
      loadStats();
      if (data.subCategoryId) {
        loadTree(data.subCategoryId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Nested sub category created successfully',
        timer: 2000,
        showConfirmButton: false
      });

      return true;
    } catch (err) {
      console.log(err)
      // Rollback
      setNestedSubCategories(prev => prev.filter(item => !item.isOptimistic));

      const message = err.response?.data?.message || 'Failed to create';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadStats, loadTree]);

  // Update
  const updateNestedSubCategory = useCallback(async (id, data) => {
    try {
      setIsSubmitting(true);

      // Store original for rollback
      const originalItems = [...nestedSubCategories];

      // Optimistic update
      setNestedSubCategories(prev =>
        prev.map(item =>
          (item.id === id || item._id === id) 
            ? { ...item, ...data, isOptimistic: true } 
            : item
        )
      );

      const response = await nestedSubCategoryApi.update(id, data);
      // Fix: Handle different response structures
      const updatedItem = response?.data || response;

      setNestedSubCategories(prev =>
        prev.map(item => (item.id === id || item._id === id) ? updatedItem : item)
      );

      // Clear cache
      cacheRef.current.clear();
      
      loadStats();
      if (data.subCategoryId) {
        loadTree(data.subCategoryId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Updated successfully',
        timer: 2000,
        showConfirmButton: false
      });

      return true;
    } catch (err) {
      // Rollback
      setNestedSubCategories(originalItems);

      const message = err.response?.data?.message || 'Failed to update';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [nestedSubCategories, loadStats, loadTree]);

  // Delete
  const deleteNestedSubCategory = useCallback(async (id) => {
    const itemToDelete = nestedSubCategories.find(
      item => item.id === id || item._id === id
    );

    const result = await Swal.fire({
      title: 'Are you sure?',
      html: itemToDelete 
        ? `You are about to delete <strong>"${itemToDelete.name}"</strong><br/>This action cannot be undone!`
        : "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return false;

    try {
      // Store original for rollback
      const originalItems = [...nestedSubCategories];

      // Optimistic delete
      setNestedSubCategories(prev => 
        prev.filter(item => item.id !== id && item._id !== id)
      );

      await nestedSubCategoryApi.delete(id);

      // Clear cache
      cacheRef.current.clear();
      
      loadStats();
      if (itemToDelete?.subCategoryId) {
        loadTree(itemToDelete.subCategoryId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Nested sub category has been deleted.',
        timer: 2000,
        showConfirmButton: false
      });

      return true;
    } catch (err) {
      // Rollback
      setNestedSubCategories(originalItems);

      const message = err.response?.data?.message || 'Failed to delete';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
      return false;
    }
  }, [nestedSubCategories, loadStats, loadTree]);

  // Toggle status
  const toggleStatus = useCallback(async (id) => {
    try {
      const response = await nestedSubCategoryApi.toggleStatus(id);
      // Fix: Handle different response structures
      const updated = response?.data || response;

      setNestedSubCategories(prev =>
        prev.map(item => 
          (item.id === id || item._id === id) ? updated : item
        )
      );

      // Clear cache
      cacheRef.current.clear();
      
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle status';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
      return false;
    }
  }, []);

  // Search
  const search = useCallback(async (query, searchFilters = {}) => {
    if (!query || query.length < 2) {
      loadNestedSubCategories(1, pagination.limit, filters);
      return [];
    }

    try {
      setLoading(true);
      const response = await nestedSubCategoryApi.search(query, searchFilters);
      // Fix: Handle different response structures
      const results = response?.data || response || [];
      setNestedSubCategories(results);
      return results;
    } catch (err) {
      const message = err.response?.data?.message || 'Search failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, loadNestedSubCategories]);

  // Get by main category
  const getByMainCategory = useCallback(async (mainCategoryId) => {
    try {
      const response = await nestedSubCategoryApi.getByMainCategory(mainCategoryId);
      // Fix: Handle different response structures
      return response?.data || response;
    } catch (err) {
      return null;
    }
  }, []);

  // Get by sub category
  const getBySubCategory = useCallback(async (subCategoryId) => {
    try {
      const response = await nestedSubCategoryApi.getBySubCategory(subCategoryId);
      // Fix: Handle different response structures
      return response?.data || response;
    } catch (err) {
      return null;
    }
  }, []);

  // Get hierarchy
  const getHierarchy = useCallback(async (id) => {
    try {
      const response = await nestedSubCategoryApi.getHierarchy(id);
      // Fix: Handle different response structures
      return response?.data || response || [];
    } catch (err) {
      return [];
    }
  }, []);

  // Move item
  const moveNestedSubCategory = useCallback(async (id, moveData) => {
    try {
      setIsSubmitting(true);

      const response = await nestedSubCategoryApi.move(id, moveData);
      // Fix: Handle different response structures
      const movedItem = response?.data || response;

      setNestedSubCategories(prev =>
        prev.map(item => 
          (item.id === id || item._id === id) ? movedItem : item
        )
      );

      // Clear cache
      cacheRef.current.clear();
      
      loadStats();
      if (moveData.newSubCategoryId) {
        loadTree(moveData.newSubCategoryId);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Item moved successfully',
        timer: 2000,
        showConfirmButton: false
      });

      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to move';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadStats, loadTree]);

  // Load all data on mount
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        loadMainCategories(),
        loadSubCategories(),
        loadNestedSubCategories(1, 10, filters),
        loadStats()
      ]);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated]);

  // Load when filters/pagination change
  useEffect(() => {
    if (isAuthenticated) {
      loadNestedSubCategories(pagination.page, pagination.limit, filters);
    }
  }, [pagination.page, pagination.limit, filters, isAuthenticated]);

  // Filtered sub categories based on selected main category
  const getSubCategoriesByMainCategory = useCallback((mainCategoryId) => {
    if (!mainCategoryId) return [];
    
    return subCategories.filter(sub => {
      const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
      return String(subMainId) === String(mainCategoryId);
    });
  }, [subCategories]);

  // Get sub category by ID
  const getSubCategoryById = useCallback((subCategoryId) => {
    return subCategories.find(sub => 
      String(sub._id || sub.id) === String(subCategoryId)
    );
  }, [subCategories]);

  // Get main category by ID
  const getMainCategoryById = useCallback((mainCategoryId) => {
    return mainCategories.find(cat => 
      String(cat._id || cat.id) === String(mainCategoryId)
    );
  }, [mainCategories]);

  // Grouped by main category
  const groupedByMainCategory = useMemo(() => {
    const grouped = {};
    
    nestedSubCategories.forEach(item => {
      const catId = item.mainCategoryId?._id || item.mainCategoryId;
      if (!catId) return;
      
      if (!grouped[catId]) {
        grouped[catId] = {
          mainCategory: getMainCategoryById(catId),
          items: []
        };
      }
      grouped[catId].items.push(item);
    });

    return Object.values(grouped).filter(g => g.items.length > 0);
  }, [nestedSubCategories, getMainCategoryById]);

  // Grouped by sub category
  const groupedBySubCategory = useMemo(() => {
    const grouped = {};
    
    nestedSubCategories.forEach(item => {
      const subId = item.subCategoryId?._id || item.subCategoryId;
      if (!subId) return;
      
      if (!grouped[subId]) {
        grouped[subId] = {
          subCategory: getSubCategoryById(subId),
          items: []
        };
      }
      grouped[subId].items.push(item);
    });

    return Object.values(grouped).filter(g => g.items.length > 0);
  }, [nestedSubCategories, getSubCategoryById]);

  return {
    // Data
    nestedSubCategories,
    mainCategories,
    subCategories,
    tree,
    stats,
    groupedByMainCategory,
    groupedBySubCategory,

    // Status
    loading,
    error,
    isSubmitting,

    // Pagination
    pagination,
    changePage: (page) => {
      if (page >= 1 && page <= pagination.pages) {
        setPagination(prev => ({ ...prev, page }));
      }
    },
    changeLimit: (limit) => {
      setPagination(prev => ({ ...prev, limit, page: 1 }));
    },

    // Filters
    filters,
    setFilters,
    selectedMainCategory,
    setSelectedMainCategory,
    applyFilters: (newFilters) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
      setPagination(prev => ({ ...prev, page: 1 }));
    },
    resetFilters: () => {
      setFilters(initialFilters);
      setSelectedMainCategory(null);
      setPagination(prev => ({ ...prev, page: 1 }));
    },

    // Actions
    addNestedSubCategory,
    updateNestedSubCategory,
    deleteNestedSubCategory,
    toggleStatus,
    moveNestedSubCategory,
    search,
    getByMainCategory,
    getBySubCategory,
    getHierarchy,
    getSubCategoriesByMainCategory,
    getSubCategoryById,
    getMainCategoryById,

    // Refresh
    refresh: () => {
      cacheRef.current.clear();
      loadMainCategories(true);
      loadSubCategories(null, true);
      loadNestedSubCategories(pagination.page, pagination.limit, filters);
      loadStats();
      if (selectedMainCategory) {
        loadTree(selectedMainCategory);
      }
    },

    // Utilities
    loadNestedSubCategories,
    loadStats,
    loadTree,
  };
};