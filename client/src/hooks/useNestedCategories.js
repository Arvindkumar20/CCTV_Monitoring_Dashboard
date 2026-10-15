// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { nestedSubCategoryApi } from '@/services/api/nestedSubCategory.api';
// import { categoryApi } from '@/services/api/category.api';
// import { subCategoryApi } from '@/services/api/subCategory.api';
// import Swal from 'sweetalert2';
// import { useAuth } from './useAuth';

// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// export const useNestedSubCategories = (initialFilters = {}) => {
//   const [nestedSubCategories, setNestedSubCategories] = useState([]);
//   const [mainCategories, setMainCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [stats, setStats] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 0
//   });
//   const [filters, setFilters] = useState(initialFilters);
//   const [tree, setTree] = useState([]);
//   const [selectedMainCategory, setSelectedMainCategory] = useState(null);

//   const cacheRef = useRef(new Map());
//   const { user, isAuthenticated } = useAuth();
//   const abortControllerRef = useRef(null);

//   // Abort previous requests
//   const abortPreviousRequest = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();
//     return abortControllerRef.current;
//   }, []);

//   // Load main categories
//   const loadMainCategories = useCallback(async (skipCache = false) => {
//     const cacheKey = `mainCategories-${user?.id}`;

//     if (!skipCache && cacheRef.current.has(cacheKey)) {
//       const cached = cacheRef.current.get(cacheKey);
//       if (Date.now() - cached.timestamp < CACHE_DURATION) {
//         setMainCategories(cached.data);
//         return cached.data;
//       }
//     }

//     try {
//       const response = await categoryApi.getAllCategories({ limit: 100 });
//       // Fix: Handle different response structures
//       const data = response?.data?.categories || response?.data || response || [];
//       setMainCategories(data);
      
//       // Update cache
//       cacheRef.current.set(cacheKey, {
//         data,
//         timestamp: Date.now()
//       });
      
//       return data;
//     } catch (err) {
//       console.error('Failed to load main categories:', err);
//       return [];
//     }
//   }, [user?.id]);

//   // Load sub categories
//   const loadSubCategories = useCallback(async (mainCategoryId = null, skipCache = false) => {
//     const cacheKey = `subCategories-${mainCategoryId || 'all'}-${user?.id}`;

//     if (!skipCache && cacheRef.current.has(cacheKey)) {
//       const cached = cacheRef.current.get(cacheKey);
//       if (Date.now() - cached.timestamp < CACHE_DURATION) {
//         setSubCategories(cached.data);
//         return cached.data;
//       }
//     }

//     try {
//       const params = mainCategoryId ? { mainCategoryId } : {};
//       const response = await subCategoryApi.getAllSubCategories(params);
//       // Fix: Handle different response structures
//       const data = response?.data?.subCategories || response?.data || response || [];
//       setSubCategories(data);
      
//       // Update cache
//       cacheRef.current.set(cacheKey, {
//         data,
//         timestamp: Date.now()
//       });
      
//       return data;
//     } catch (err) {
//       console.error('Failed to load sub categories:', err);
//       return [];
//     }
//   }, [user?.id]);

//   // Load nested sub categories
//   const loadNestedSubCategories = useCallback(async (page = 1, limit = 10, newFilters = {}) => {
//     if (!isAuthenticated) {
//       setError('Session expired');
//       setLoading(false);
//       return null;
//     }

//     const controller = abortPreviousRequest();
//     const cacheKey = `nested-${page}-${limit}-${JSON.stringify(newFilters)}-${user?.id}`;

//     // Check cache
//     if (cacheRef.current.has(cacheKey)) {
//       const cached = cacheRef.current.get(cacheKey);
//       if (Date.now() - cached.timestamp < CACHE_DURATION) {
//         setNestedSubCategories(cached.data.items || []);
//         if (cached.data.pagination) {
//           setPagination(cached.data.pagination);
//         }
//         setLoading(false);
//         return cached.data;
//       }
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await nestedSubCategoryApi.getAll({
//         page,
//         limit,
//         ...filters,
//         ...newFilters
//       }, { signal: controller.signal });

//       // Fix: Handle different response structures
//       const responseData = response?.data || response;
//       const items = responseData.nestedSubCategories || responseData.items || responseData || [];
//       const responsePagination = responseData.pagination || {
//         page,
//         limit,
//         total: items.length,
//         pages: Math.ceil(items.length / limit)
//       };

//       setNestedSubCategories(items);
//       setPagination(responsePagination);

//       // Update cache
//       cacheRef.current.set(cacheKey, {
//         data: { items, pagination: responsePagination },
//         timestamp: Date.now()
//       });

//       return { items, pagination: responsePagination };
//     } catch (err) {
//       if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
//         return null;
//       }
//       const message = err.response?.data?.message || 'Failed to load nested sub categories';
//       setError(message);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, isAuthenticated, user?.id]);

//   // Load tree
//   const loadTree = useCallback(async (subCategoryId = null) => {
//     if (!subCategoryId) return [];
    
//     try {
//       const response = await nestedSubCategoryApi.getTree(subCategoryId);
//       // Fix: Handle different response structures
//       const data = response?.data || response || [];
//       setTree(data);
//       return data;
//     } catch (err) {
//       console.error('Failed to load tree:', err);
//       return [];
//     }
//   }, []);

//   // Load stats
//   const loadStats = useCallback(async () => {
//     try {
//       const response = await nestedSubCategoryApi.getStats();
//       // Fix: Handle different response structures
//       const data = response?.data || response || null;
//       setStats(data);
//       return data;
//     } catch (err) {
//       return null;
//     }
//   }, []);

//   // Create
//   const addNestedSubCategory = useCallback(async (data) => {
//     // console.log(data)
//     try {
//       setIsSubmitting(true);

//       // Optimistic update
//       const tempId = `temp-${Date.now()}`;
//       const optimisticItem = {
//         id: tempId,
//         _id: tempId,
//         ...data,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         isOptimistic: true
//       };

//       setNestedSubCategories(prev => [optimisticItem, ...prev]);

//       const response = await nestedSubCategoryApi.create(data);
//       console.log(response)
//       // Fix: Handle different response structures
//       const newItem = response?.data || response;

//       // Replace optimistic with real
//       setNestedSubCategories(prev =>
//         prev.map(item => 
//           (item.id === tempId || item._id === tempId) ? newItem : item
//         )
//       );

//       // Clear cache
//       cacheRef.current.clear();

//       // Refresh related data
//       loadStats();
//       if (data.subCategoryId) {
//         loadTree(data.subCategoryId);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Nested sub category created successfully',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       return true;
//     } catch (err) {
//       console.log(err)
//       // Rollback
//       setNestedSubCategories(prev => prev.filter(item => !item.isOptimistic));

//       const message = err.response?.data?.message || 'Failed to create';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: message
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [loadStats, loadTree]);

//   // Update
//   const updateNestedSubCategory = useCallback(async (id, data) => {
//     try {
//       setIsSubmitting(true);

//       // Store original for rollback
//       const originalItems = [...nestedSubCategories];

//       // Optimistic update
//       setNestedSubCategories(prev =>
//         prev.map(item =>
//           (item.id === id || item._id === id) 
//             ? { ...item, ...data, isOptimistic: true } 
//             : item
//         )
//       );

//       const response = await nestedSubCategoryApi.update(id, data);
//       // Fix: Handle different response structures
//       const updatedItem = response?.data || response;

//       setNestedSubCategories(prev =>
//         prev.map(item => (item.id === id || item._id === id) ? updatedItem : item)
//       );

//       // Clear cache
//       cacheRef.current.clear();
      
//       loadStats();
//       if (data.subCategoryId) {
//         loadTree(data.subCategoryId);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Updated successfully',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       return true;
//     } catch (err) {
//       // Rollback
//       setNestedSubCategories(originalItems);

//       const message = err.response?.data?.message || 'Failed to update';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: message
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [nestedSubCategories, loadStats, loadTree]);

//   // Delete
//   const deleteNestedSubCategory = useCallback(async (id) => {
//     const itemToDelete = nestedSubCategories.find(
//       item => item.id === id || item._id === id
//     );

//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       html: itemToDelete 
//         ? `You are about to delete <strong>"${itemToDelete.name}"</strong><br/>This action cannot be undone!`
//         : "You won't be able to revert this!",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!'
//     });

//     if (!result.isConfirmed) return false;

//     try {
//       // Store original for rollback
//       const originalItems = [...nestedSubCategories];

//       // Optimistic delete
//       setNestedSubCategories(prev => 
//         prev.filter(item => item.id !== id && item._id !== id)
//       );

//       await nestedSubCategoryApi.delete(id);

//       // Clear cache
//       cacheRef.current.clear();
      
//       loadStats();
//       if (itemToDelete?.subCategoryId) {
//         loadTree(itemToDelete.subCategoryId);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Deleted!',
//         text: 'Nested sub category has been deleted.',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       return true;
//     } catch (err) {
//       // Rollback
//       setNestedSubCategories(originalItems);

//       const message = err.response?.data?.message || 'Failed to delete';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: message
//       });
//       return false;
//     }
//   }, [nestedSubCategories, loadStats, loadTree]);

//   // Toggle status
//   const toggleStatus = useCallback(async (id) => {
//     try {
//       const response = await nestedSubCategoryApi.toggleStatus(id);
//       // Fix: Handle different response structures
//       const updated = response?.data || response;

//       setNestedSubCategories(prev =>
//         prev.map(item => 
//           (item.id === id || item._id === id) ? updated : item
//         )
//       );

//       // Clear cache
//       cacheRef.current.clear();
      
//       return true;
//     } catch (err) {
//       const message = err.response?.data?.message || 'Failed to toggle status';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: message
//       });
//       return false;
//     }
//   }, []);

//   // Search
//   const search = useCallback(async (query, searchFilters = {}) => {
//     if (!query || query.length < 2) {
//       loadNestedSubCategories(1, pagination.limit, filters);
//       return [];
//     }

//     try {
//       setLoading(true);
//       const response = await nestedSubCategoryApi.search(query, searchFilters);
//       // Fix: Handle different response structures
//       const results = response?.data || response || [];
//       setNestedSubCategories(results);
//       return results;
//     } catch (err) {
//       const message = err.response?.data?.message || 'Search failed';
//       setError(message);
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, pagination.limit, loadNestedSubCategories]);

//   // Get by main category
//   const getByMainCategory = useCallback(async (mainCategoryId) => {
//     try {
//       const response = await nestedSubCategoryApi.getByMainCategory(mainCategoryId);
//       // Fix: Handle different response structures
//       return response?.data || response;
//     } catch (err) {
//       return null;
//     }
//   }, []);

//   // Get by sub category
//   const getBySubCategory = useCallback(async (subCategoryId) => {
//     try {
//       const response = await nestedSubCategoryApi.getBySubCategory(subCategoryId);
//       // Fix: Handle different response structures
//       return response?.data || response;
//     } catch (err) {
//       return null;
//     }
//   }, []);

//   // Get hierarchy
//   const getHierarchy = useCallback(async (id) => {
//     try {
//       const response = await nestedSubCategoryApi.getHierarchy(id);
//       // Fix: Handle different response structures
//       return response?.data || response || [];
//     } catch (err) {
//       return [];
//     }
//   }, []);

//   // Move item
//   const moveNestedSubCategory = useCallback(async (id, moveData) => {
//     try {
//       setIsSubmitting(true);

//       const response = await nestedSubCategoryApi.move(id, moveData);
//       // Fix: Handle different response structures
//       const movedItem = response?.data || response;

//       setNestedSubCategories(prev =>
//         prev.map(item => 
//           (item.id === id || item._id === id) ? movedItem : item
//         )
//       );

//       // Clear cache
//       cacheRef.current.clear();
      
//       loadStats();
//       if (moveData.newSubCategoryId) {
//         loadTree(moveData.newSubCategoryId);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Item moved successfully',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       return true;
//     } catch (err) {
//       const message = err.response?.data?.message || 'Failed to move';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: message
//       });
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [loadStats, loadTree]);

//   // Load all data on mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       Promise.all([
//         loadMainCategories(),
//         loadSubCategories(),
//         loadNestedSubCategories(1, 10, filters),
//         loadStats()
//       ]);
//     }

//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [isAuthenticated]);

//   // Load when filters/pagination change
//   useEffect(() => {
//     if (isAuthenticated) {
//       loadNestedSubCategories(pagination.page, pagination.limit, filters);
//     }
//   }, [pagination.page, pagination.limit, filters, isAuthenticated]);

//   // Filtered sub categories based on selected main category
//   const getSubCategoriesByMainCategory = useCallback((mainCategoryId) => {
//     if (!mainCategoryId) return [];
    
//     return subCategories.filter(sub => {
//       const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
//       return String(subMainId) === String(mainCategoryId);
//     });
//   }, [subCategories]);

//   // Get sub category by ID
//   const getSubCategoryById = useCallback((subCategoryId) => {
//     return subCategories.find(sub => 
//       String(sub._id || sub.id) === String(subCategoryId)
//     );
//   }, [subCategories]);

//   // Get main category by ID
//   const getMainCategoryById = useCallback((mainCategoryId) => {
//     return mainCategories.find(cat => 
//       String(cat._id || cat.id) === String(mainCategoryId)
//     );
//   }, [mainCategories]);

//   // Grouped by main category
//   const groupedByMainCategory = useMemo(() => {
//     const grouped = {};
    
//     nestedSubCategories.forEach(item => {
//       const catId = item.mainCategoryId?._id || item.mainCategoryId;
//       if (!catId) return;
      
//       if (!grouped[catId]) {
//         grouped[catId] = {
//           mainCategory: getMainCategoryById(catId),
//           items: []
//         };
//       }
//       grouped[catId].items.push(item);
//     });

//     return Object.values(grouped).filter(g => g.items.length > 0);
//   }, [nestedSubCategories, getMainCategoryById]);

//   // Grouped by sub category
//   const groupedBySubCategory = useMemo(() => {
//     const grouped = {};
    
//     nestedSubCategories.forEach(item => {
//       const subId = item.subCategoryId?._id || item.subCategoryId;
//       if (!subId) return;
      
//       if (!grouped[subId]) {
//         grouped[subId] = {
//           subCategory: getSubCategoryById(subId),
//           items: []
//         };
//       }
//       grouped[subId].items.push(item);
//     });

//     return Object.values(grouped).filter(g => g.items.length > 0);
//   }, [nestedSubCategories, getSubCategoryById]);

//   return {
//     // Data
//     nestedSubCategories,
//     mainCategories,
//     subCategories,
//     tree,
//     stats,
//     groupedByMainCategory,
//     groupedBySubCategory,

//     // Status
//     loading,
//     error,
//     isSubmitting,

//     // Pagination
//     pagination,
//     changePage: (page) => {
//       if (page >= 1 && page <= pagination.pages) {
//         setPagination(prev => ({ ...prev, page }));
//       }
//     },
//     changeLimit: (limit) => {
//       setPagination(prev => ({ ...prev, limit, page: 1 }));
//     },

//     // Filters
//     filters,
//     setFilters,
//     selectedMainCategory,
//     setSelectedMainCategory,
//     applyFilters: (newFilters) => {
//       setFilters(prev => ({ ...prev, ...newFilters }));
//       setPagination(prev => ({ ...prev, page: 1 }));
//     },
//     resetFilters: () => {
//       setFilters(initialFilters);
//       setSelectedMainCategory(null);
//       setPagination(prev => ({ ...prev, page: 1 }));
//     },

//     // Actions
//     addNestedSubCategory,
//     updateNestedSubCategory,
//     deleteNestedSubCategory,
//     toggleStatus,
//     moveNestedSubCategory,
//     search,
//     getByMainCategory,
//     getBySubCategory,
//     getHierarchy,
//     getSubCategoriesByMainCategory,
//     getSubCategoryById,
//     getMainCategoryById,

//     // Refresh
//     refresh: () => {
//       cacheRef.current.clear();
//       loadMainCategories(true);
//       loadSubCategories(null, true);
//       loadNestedSubCategories(pagination.page, pagination.limit, filters);
//       loadStats();
//       if (selectedMainCategory) {
//         loadTree(selectedMainCategory);
//       }
//     },

//     // Utilities
//     loadNestedSubCategories,
//     loadStats,
//     loadTree,
//   };
// };



// frontend/src/hooks/useNestedSubCategories.js
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { nestedSubCategoryApi } from "@/services/api/nestedSubCategory.api";
import { categoryApi } from "@/services/api/category.api";
import { subCategoryApi } from "@/services/api/subCategory.api";
import { useAuth } from "./useAuth";

// ============================================
// QUERY KEYS
// ============================================

export const nestedKeys = {
  all: ["nestedSubCategories"],
  lists: () => [...nestedKeys.all, "list"],
  list: (params) => [...nestedKeys.lists(), params],
  mainCategories: () => [...nestedKeys.all, "mainCategories"],
  subCategories: (mainCategoryId) => [
    ...nestedKeys.all,
    "subCategories",
    mainCategoryId || "all",
  ],
  tree: (subCategoryId) => [...nestedKeys.all, "tree", subCategoryId],
  stats: () => [...nestedKeys.all, "stats"],
  search: (query, filters) => [...nestedKeys.all, "search", query, filters],
  byMainCategory: (id) => [...nestedKeys.all, "byMainCategory", id],
  bySubCategory: (id) => [...nestedKeys.all, "bySubCategory", id],
  hierarchy: (id) => [...nestedKeys.all, "hierarchy", id],
};

// ============================================
// FETCH FUNCTIONS
// ============================================

const fetchMainCategoriesFn = async () => {
  const response = await categoryApi.getAllCategories({ limit: 100 });
  return response?.data?.categories || response?.data || response || [];
};

const fetchSubCategoriesFn = async (mainCategoryId = null) => {
  const params = mainCategoryId ? { mainCategoryId } : {};
  const response = await subCategoryApi.getAllSubCategories(params);
  return response?.data?.subCategories || response?.data || response || [];
};

const fetchNestedSubCategoriesFn = async (params) => {
  const response = await nestedSubCategoryApi.getAll(params);
  const responseData = response?.data || response;
  const items =
    responseData.nestedSubCategories ||
    responseData.items ||
    responseData ||
    [];

  const pagination = responseData.pagination || {
    page: params.page || 1,
    limit: params.limit || 10,
    total: items.length,
    pages: Math.ceil(items.length / (params.limit || 10)),
  };

  return { items: Array.isArray(items) ? items : [], pagination };
};

const fetchStatsFn = async () => {
  const response = await nestedSubCategoryApi.getStats();
  return response?.data || response || null;
};

const fetchTreeFn = async (subCategoryId) => {
  if (!subCategoryId) return [];
  const response = await nestedSubCategoryApi.getTree(subCategoryId);
  return response?.data || response || [];
};

const searchNestedFn = async ({ query, filters }) => {
  const response = await nestedSubCategoryApi.search(query, filters);
  return response?.data || response || [];
};

const fetchByMainCategoryFn = async (mainCategoryId) => {
  const response =
    await nestedSubCategoryApi.getByMainCategory(mainCategoryId);
  return response?.data || response;
};

const fetchBySubCategoryFn = async (subCategoryId) => {
  const response = await nestedSubCategoryApi.getBySubCategory(subCategoryId);
  return response?.data || response;
};

const fetchHierarchyFn = async (id) => {
  const response = await nestedSubCategoryApi.getHierarchy(id);
  return response?.data || response || [];
};

// ============================================
// MAIN HOOK
// ============================================

export const useNestedSubCategories = (initialFilters = {}) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // ============================================
  // LOCAL STATE
  // ============================================

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState(initialFilters);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // QUERIES
  // ============================================

  // ✅ Main categories
  const mainCategoriesQuery = useQuery({
    queryKey: nestedKeys.mainCategories(),
    queryFn: fetchMainCategoriesFn,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Sub categories (all)
  const subCategoriesQuery = useQuery({
    queryKey: nestedKeys.subCategories(null),
    queryFn: () => fetchSubCategoriesFn(null),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Nested sub categories list
  const nestedQuery = useQuery({
    queryKey: nestedKeys.list({ ...pagination, ...filters }),
    queryFn: () =>
      fetchNestedSubCategoriesFn({
        ...pagination,
        ...filters,
      }),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 2,
  });

  // ✅ Stats
  const statsQuery = useQuery({
    queryKey: nestedKeys.stats(),
    queryFn: fetchStatsFn,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // ✅ Create
  const createMutation = useMutation({
    mutationFn: (data) => nestedSubCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nestedKeys.all });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Nested sub category created successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to create",
      });
    },
  });

  // ✅ Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => nestedSubCategoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(
        nestedKeys.list({ ...pagination, ...filters }),
        (old) => {
          if (!old) return old;
          const updated = _.data || _;
          return {
            ...old,
            items: old.items.map((item) =>
              item._id === id || item.id === id ? { ...item, ...updated } : item,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: nestedKeys.all });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update",
      });
    },
  });

  // ✅ Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => nestedSubCategoryApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: nestedKeys.lists() });
      const previousData = queryClient.getQueryData(
        nestedKeys.list({ ...pagination, ...filters }),
      );

      queryClient.setQueryData(
        nestedKeys.list({ ...pagination, ...filters }),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter(
              (item) => item._id !== id && item.id !== id,
            ),
          };
        },
      );

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nestedKeys.all });
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Nested sub category has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          nestedKeys.list({ ...pagination, ...filters }),
          context.previousData,
        );
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete",
      });
    },
  });

  // ✅ Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => nestedSubCategoryApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nestedKeys.all });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to toggle status",
      });
    },
  });

  // ✅ Move
  const moveMutation = useMutation({
    mutationFn: ({ id, moveData }) =>
      nestedSubCategoryApi.move(id, moveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nestedKeys.all });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Item moved successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to move",
      });
    },
  });

  // ============================================
  // WRAPPER FUNCTIONS (Backward Compatible)
  // ============================================

  const addNestedSubCategory = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createMutation],
  );

  const updateNestedSubCategory = useCallback(
    async (id, data) => {
      setIsSubmitting(true);
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateMutation],
  );

  const deleteNestedSubCategory = useCallback(
    async (id) => {
      // Find item for confirmation message
      const items = nestedQuery.data?.items || [];
      const itemToDelete = items.find(
        (item) => item.id === id || item._id === id,
      );

      const result = await Swal.fire({
        title: "Are you sure?",
        html: itemToDelete
          ? `You are about to delete <strong>"${itemToDelete.name}"</strong><br/>This action cannot be undone!`
          : "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return false;

      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation, nestedQuery.data?.items],
  );

  const toggleStatus = useCallback(
    async (id) => {
      try {
        await toggleStatusMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [toggleStatusMutation],
  );

  const moveNestedSubCategory = useCallback(
    async (id, moveData) => {
      setIsSubmitting(true);
      try {
        await moveMutation.mutateAsync({ id, moveData });
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [moveMutation],
  );

  // ✅ Search (on-demand)
  const search = useCallback(
    async (query, searchFilters = {}) => {
      if (!query || query.length < 2) {
        return [];
      }

      try {
        return await queryClient.fetchQuery({
          queryKey: nestedKeys.search(query, searchFilters),
          queryFn: () => searchNestedFn({ query, filters: searchFilters }),
          staleTime: 30 * 1000,
        });
      } catch (err) {
        return [];
      }
    },
    [queryClient],
  );

  // ✅ Get by main category (on-demand)
  const getByMainCategory = useCallback(
    async (mainCategoryId) => {
      try {
        return await queryClient.fetchQuery({
          queryKey: nestedKeys.byMainCategory(mainCategoryId),
          queryFn: () => fetchByMainCategoryFn(mainCategoryId),
          staleTime: 2 * 60 * 1000,
        });
      } catch {
        return null;
      }
    },
    [queryClient],
  );

  // ✅ Get by sub category (on-demand)
  const getBySubCategory = useCallback(
    async (subCategoryId) => {
      try {
        return await queryClient.fetchQuery({
          queryKey: nestedKeys.bySubCategory(subCategoryId),
          queryFn: () => fetchBySubCategoryFn(subCategoryId),
          staleTime: 2 * 60 * 1000,
        });
      } catch {
        return null;
      }
    },
    [queryClient],
  );

  // ✅ Get hierarchy (on-demand)
  const getHierarchy = useCallback(
    async (id) => {
      try {
        return await queryClient.fetchQuery({
          queryKey: nestedKeys.hierarchy(id),
          queryFn: () => fetchHierarchyFn(id),
          staleTime: 5 * 60 * 1000,
        });
      } catch {
        return [];
      }
    },
    [queryClient],
  );

  // ✅ Load tree (on-demand)
  const loadTree = useCallback(
    async (subCategoryId) => {
      if (!subCategoryId) return [];
      try {
        return await queryClient.fetchQuery({
          queryKey: nestedKeys.tree(subCategoryId),
          queryFn: () => fetchTreeFn(subCategoryId),
          staleTime: 2 * 60 * 1000,
        });
      } catch {
        return [];
      }
    },
    [queryClient],
  );

  // ✅ Refresh
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: nestedKeys.all });
  }, [queryClient]);

  const loadStats = useCallback(() => {
    return statsQuery.refetch();
  }, [statsQuery]);

  // ============================================
  // PAGINATION & FILTERS
  // ============================================

  const changePage = useCallback(
    (page) => {
      const totalPages = nestedQuery.data?.pagination?.pages || 1;
      if (page >= 1 && page <= totalPages) {
        setPagination((prev) => ({ ...prev, page }));
      }
    },
    [nestedQuery.data?.pagination?.pages],
  );

  const changeLimit = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSelectedMainCategory(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [initialFilters]);

  // ============================================
  // DERIVED DATA
  // ============================================

  const mainCategories = mainCategoriesQuery.data || [];
  const subCategories = subCategoriesQuery.data || [];
  const nestedSubCategories = nestedQuery.data?.items || [];
  const stats = statsQuery.data || null;

  // ✅ Get sub category by ID
  const getSubCategoryById = useCallback(
    (subCategoryId) => {
      return subCategories.find(
        (sub) => String(sub._id || sub.id) === String(subCategoryId),
      );
    },
    [subCategories],
  );

  // ✅ Get main category by ID
  const getMainCategoryById = useCallback(
    (mainCategoryId) => {
      return mainCategories.find(
        (cat) => String(cat._id || cat.id) === String(mainCategoryId),
      );
    },
    [mainCategories],
  );

  // ✅ Filter sub categories by main category
  const getSubCategoriesByMainCategory = useCallback(
    (mainCategoryId) => {
      if (!mainCategoryId) return [];
      return subCategories.filter((sub) => {
        const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
        return String(subMainId) === String(mainCategoryId);
      });
    },
    [subCategories],
  );

  // ✅ Grouped by main category
  const groupedByMainCategory = useMemo(() => {
    const grouped = {};

    nestedSubCategories.forEach((item) => {
      const catId = item.mainCategoryId?._id || item.mainCategoryId;
      if (!catId) return;

      if (!grouped[catId]) {
        grouped[catId] = {
          mainCategory: getMainCategoryById(catId),
          items: [],
        };
      }
      grouped[catId].items.push(item);
    });

    return Object.values(grouped).filter((g) => g.items.length > 0);
  }, [nestedSubCategories, getMainCategoryById]);

  // ✅ Grouped by sub category
  const groupedBySubCategory = useMemo(() => {
    const grouped = {};

    nestedSubCategories.forEach((item) => {
      const subId = item.subCategoryId?._id || item.subCategoryId;
      if (!subId) return;

      if (!grouped[subId]) {
        grouped[subId] = {
          subCategory: getSubCategoryById(subId),
          items: [],
        };
      }
      grouped[subId].items.push(item);
    });

    return Object.values(grouped).filter((g) => g.items.length > 0);
  }, [nestedSubCategories, getSubCategoryById]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    nestedSubCategories,
    mainCategories,
    subCategories,
    tree: [], // Deprecated - use loadTree() on-demand
    stats,
    groupedByMainCategory,
    groupedBySubCategory,

    // Status
    loading: nestedQuery.isLoading,
    error:
      nestedQuery.error?.message ||
      mainCategoriesQuery.error?.message ||
      null,
    isSubmitting,

    // Pagination
    pagination: nestedQuery.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    changePage,
    changeLimit,

    // Filters
    filters,
    setFilters,
    selectedMainCategory,
    setSelectedMainCategory,
    applyFilters,
    resetFilters,

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
    refresh,

    // Utilities
    loadStats,
    loadTree,
    refetch: nestedQuery.refetch,

    // Query states
    isFetching: nestedQuery.isFetching,
  };
};