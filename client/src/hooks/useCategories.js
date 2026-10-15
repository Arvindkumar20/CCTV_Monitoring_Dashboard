// // hooks/useCategories.js
// import { categoryApi } from "@/services/api/category.api";
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2"; // Make sure the path is correct
// export const useCategories = () => {
//   const [categories, setCategories] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     limit: 10,
//     totalPages: 0,
//   });

//   // Load categories with pagination support
//   const loadCategories = async (page = 1, limit = 10, filters = {}) => {
//     try {
//       setLoading(true);
//       const response = await categoryApi.getAllCategories({
//         page,
//         limit,
//         ...filters,
//       });
//       console.log(response.data);
//       // Handle different response structures
//       if (response && response.data) {
//         setCategories(response.data);
//         if (response.data.pagination) {
//           setPagination(response.data.pagination);
//         }
//       } else if (Array.isArray(response)) {
//         setCategories(response.data);
//       } else {
//         setCategories([]);
//       }

//       setError(null);
//       return response;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to load categories";
//       setError(errorMessage);

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//       });

//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load categories on mount
//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // Get my categories (for non-admin users)
//   const loadMyCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await categoryApi.getMyCategories();

//       if (response && response.data) {
//         setCategories(response.data);
//       } else if (Array.isArray(response)) {
//         setCategories(response);
//       }

//       setError(null);
//       return response;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to load your categories";
//       setError(errorMessage);

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//       });

//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create category
//   const addCategory = async (data) => {
//     console.log(data);
//     try {
//       setIsSubmitting(true);
//       const response = await categoryApi.createCategory(data);
//       console.log(response);
//       // Handle response (could be the created category or wrapped in data property)
//       const newCategory = response.data;

//       setCategories((prev) => ({
//         ...prev,
//         categories: [newCategory, ...prev.categories],
//       }));

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Category created successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to create category";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//       });

//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Update category
//   const editCategory = async (id, data) => {
//     try {
//       setIsSubmitting(true);
//       const response = await categoryApi.updateCategory(id, data);

//       // Handle response
//       const updatedCategory =
//         response?.data?.data || response?.data || response;

//       setCategories((prev) => ({
//         ...prev,
//         categories: prev.categories.map((cat) =>
//           cat._id === id || cat.id === id
//             ? { ...cat, ...updatedCategory }
//             : cat,
//         ),
//       }));

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Category updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to update category";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//       });

//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Delete category
//   const removeCategory = async (id) => {
//     try {
//       // Ask for confirmation
//       // const result = await Swal.fire({
//       //   title: "Are you sure?",
//       //   text: "You won't be able to revert this!",
//       //   icon: "warning",
//       //   showCancelButton: true,
//       //   confirmButtonColor: "#d33",
//       //   cancelButtonColor: "#3085d6",
//       //   confirmButtonText: "Yes, delete it!",
//       // });

//       // if (!result.isConfirmed) {
//       //   return false;
//       // }

//       await categoryApi.deleteCategory(id);

//       // Handle both id and _id
//       setCategories((prev) => ({
//         ...prev,
//         categories: prev.categories.filter(
//           (cat) => cat.id !== id && cat._id !== id,
//         ),
//         pagination: {
//           ...prev.pagination,
//           total: prev.pagination.total - 1,
//         },
//       }));

//       Swal.fire({
//         icon: "success",
//         title: "Deleted!",
//         text: "Category has been deleted.",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to delete category";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//       });

//       return false;
//     }
//   };

//   // Bulk delete categories
//   const bulkDeleteCategories = async (categoryIds) => {
//     try {
//       if (!categoryIds || categoryIds.length === 0) {
//         Swal.fire({
//           icon: "warning",
//           title: "Warning",
//           text: "No categories selected",
//         });
//         return false;
//       }

//       const result = await Swal.fire({
//         title: "Are you sure?",
//         text: `You are about to delete ${categoryIds.length} categories. This action cannot be undone!`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#d33",
//         cancelButtonColor: "#3085d6",
//         confirmButtonText: "Yes, delete them!",
//       });

//       if (!result.isConfirmed) {
//         return false;
//       }

//       await categoryApi.bulkDeleteCategories(categoryIds);

//       // Remove deleted categories from state
//       setCategories((prev) =>
//         prev.filter(
//           (cat) =>
//             !categoryIds.includes(cat.id) && !categoryIds.includes(cat._id),
//         ),
//       );

//       Swal.fire({
//         icon: "success",
//         title: "Deleted!",
//         text: `${categoryIds.length} categories have been deleted.`,
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       return true;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to delete categories";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//       });

//       return false;
//     }
//   };

//   // Search categories
//   const searchCategories = async (query) => {
//     try {
//       setLoading(true);
//       const response = await categoryApi.searchCategories(query);

//       if (response && response.data) {
//         setCategories(response.data.data);
//       } else if (Array.isArray(response)) {
//         setCategories(response);
//       }

//       return response;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to search categories";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//       });

//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get single category by ID
//   const getCategory = async (id) => {
//     try {
//       setLoading(true);
//       const response = await categoryApi.getCategoryById(id);
//       return response.data.data || response;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch category";

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: errorMessage,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//       });

//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Change page
//   const changePage = (newPage, filters = {}) => {
//     loadCategories(newPage, pagination.limit, filters);
//   };

//   return {
//     categories,
//     loading,
//     error,
//     isSubmitting,
//     pagination,
//     addCategory,
//     editCategory,
//     removeCategory,
//     loadCategories,
//     loadMyCategories,
//     searchCategories,
//     getCategory,
//     bulkDeleteCategories,
//     changePage,
//   };
// };






// frontend/src/hooks/useCategories.js
import { categoryApi } from "@/services/api/category.api";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// ============================================
// QUERY KEYS
// ============================================

export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (params) => [...categoryKeys.lists(), params],
  my: () => [...categoryKeys.all, "my"],
  details: () => [...categoryKeys.all, "detail"],
  detail: (id) => [...categoryKeys.details(), id],
  search: (query) => [...categoryKeys.all, "search", query],
};

// ============================================
// FETCH FUNCTIONS
// ============================================

const fetchCategoriesFn = async (params) => {
  const response = await categoryApi.getAllCategories(params);

  // Handle different response structures
  let categoriesData = [];
  let paginationData = null;

  if (response?.data) {
    // If response.data has nested structure
    if (response.data.categories) {
      categoriesData = response.data.categories;
      paginationData = response.data.pagination || response.pagination;
    } else if (Array.isArray(response.data)) {
      categoriesData = response.data;
      paginationData = response.pagination;
    } else {
      categoriesData = response.data;
    }
  } else if (Array.isArray(response)) {
    categoriesData = response;
  }

  return {
    categories: categoriesData,
    pagination: paginationData || {
      total: categoriesData.length,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 1,
    },
  };
};

const fetchMyCategoriesFn = async () => {
  const response = await categoryApi.getMyCategories();
  if (response?.data) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const fetchCategoryByIdFn = async (id) => {
  const response = await categoryApi.getCategoryById(id);
  return response?.data?.data || response?.data || response;
};

const searchCategoriesFn = async (query) => {
  const response = await categoryApi.searchCategories(query);
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

// ============================================
// MAIN HOOK
// ============================================

export const useCategories = (initialParams = {}) => {
  const queryClient = useQueryClient();

  // Local state for params
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // QUERIES
  // ============================================

  // ✅ Main categories list
  const categoriesQuery = useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => fetchCategoriesFn(params),
    staleTime: 2 * 60 * 1000,          // 2 min fresh
    gcTime: 10 * 60 * 1000,             // 10 min cache
    refetchOnWindowFocus: false,        // Categories rarely change
    keepPreviousData: true,             // ✅ Pagination smooth
    retry: 2,
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // ✅ Create
  const createMutation = useMutation({
    mutationFn: (data) => categoryApi.createCategory(data),
    onSuccess: (response) => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Category created successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to create category",
      });
    },
  });

  // ✅ Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: (response, { id }) => {
      // Optimistic update in cache
      queryClient.setQueryData(categoryKeys.list(params), (old) => {
        if (!old) return old;
        const updated = response?.data?.data || response?.data || response;
        return {
          ...old,
          categories: old.categories.map((cat) =>
            cat._id === id || cat.id === id ? { ...cat, ...updated } : cat,
          ),
        };
      });

      // Invalidate to be safe
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Category updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update category",
      });
    },
  });

  // ✅ Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

      // Snapshot for rollback
      const previousData = queryClient.getQueryData(categoryKeys.list(params));

      // Optimistic remove
      queryClient.setQueryData(categoryKeys.list(params), (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.filter(
            (cat) => cat._id !== id && cat.id !== id,
          ),
          pagination: {
            ...old.pagination,
            total: Math.max(0, (old.pagination?.total || 1) - 1),
          },
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Category has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err, id, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(
          categoryKeys.list(params),
          context.previousData,
        );
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete category",
      });
    },
  });

  // ✅ Bulk Delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => categoryApi.bulkDeleteCategories(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${ids.length} categories have been deleted.`,
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete categories",
      });
    },
  });

  // ============================================
  // WRAPPER FUNCTIONS (Compatible with old API)
  // ============================================

  /**
   * Load categories - updates params, React Query auto-refetches
   */
  const loadCategories = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      setParams({ page, limit, ...filters });
      // Return current data (React Query will refetch in background)
      return categoriesQuery.data;
    },
    [categoriesQuery.data],
  );

  /**
   * Load my categories (for non-admin users)
   */
  const loadMyCategories = useCallback(async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: categoryKeys.my(),
        queryFn: fetchMyCategoriesFn,
        staleTime: 2 * 60 * 1000,
      });
      return { data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load your categories";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return null;
    }
  }, [queryClient]);

  /**
   * Add category
   */
  const addCategory = useCallback(
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

  /**
   * Edit category
   */
  const editCategory = useCallback(
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

  /**
   * Remove category
   */
  const removeCategory = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  /**
   * Bulk delete
   */
  const bulkDeleteCategories = useCallback(
    async (categoryIds) => {
      if (!categoryIds || categoryIds.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "No categories selected",
        });
        return false;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete ${categoryIds.length} categories. This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete them!",
      });

      if (!result.isConfirmed) return false;

      try {
        await bulkDeleteMutation.mutateAsync(categoryIds);
        return true;
      } catch {
        return false;
      }
    },
    [bulkDeleteMutation],
  );

  /**
   * Search categories
   */
  const searchCategories = useCallback(
    async (query) => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: categoryKeys.search(query),
          queryFn: () => searchCategoriesFn(query),
          staleTime: 30 * 1000,
        });
        return { data };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to search categories";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return null;
      }
    },
    [queryClient],
  );

  /**
   * Get single category
   */
  const getCategory = useCallback(
    async (id) => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: categoryKeys.detail(id),
          queryFn: () => fetchCategoryByIdFn(id),
          staleTime: 5 * 60 * 1000,
        });
        return data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch category";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        return null;
      }
    },
    [queryClient],
  );

  /**
   * Change page
   */
  const changePage = useCallback(
    (newPage, filters = {}) => {
      setParams((prev) => ({
        ...prev,
        ...filters,
        page: newPage,
      }));
    },
    [],
  );

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  }, [queryClient]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    categories: categoriesQuery.data || { categories: [], pagination: null },
    pagination: categoriesQuery.data?.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },

    // Loading states
    loading: categoriesQuery.isLoading,
    isFetching: categoriesQuery.isFetching,
    isSubmitting,

    // Error
    error: categoriesQuery.error?.message || null,

    // Actions (backward compatible)
    addCategory,
    editCategory,
    removeCategory,
    loadCategories,
    loadMyCategories,
    searchCategories,
    getCategory,
    bulkDeleteCategories,
    changePage,

    // New
    refresh,
    setParams,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};