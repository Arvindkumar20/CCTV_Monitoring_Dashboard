// hooks/useCategories.js
import { categoryApi } from "@/services/api/category.api";
import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Make sure the path is correct
export const useCategories = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Load categories with pagination support
  const loadCategories = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      const response = await categoryApi.getAllCategories({
        page,
        limit,
        ...filters,
      });
      console.log(response.data);
      // Handle different response structures
      if (response && response.data) {
        setCategories(response.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else if (Array.isArray(response)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }

      setError(null);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load categories";
      setError(errorMessage);

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
    } finally {
      setLoading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Get my categories (for non-admin users)
  const loadMyCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getMyCategories();

      if (response && response.data) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }

      setError(null);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load your categories";
      setError(errorMessage);

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
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const addCategory = async (data) => {
    console.log(data);
    try {
      setIsSubmitting(true);
      const response = await categoryApi.createCategory(data);
      console.log(response);
      // Handle response (could be the created category or wrapped in data property)
      const newCategory = response.data;

      setCategories((prev) => ({
        ...prev,
        categories: [newCategory, ...prev.categories],
      }));

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Category created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create category";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update category
  const editCategory = async (id, data) => {
    try {
      setIsSubmitting(true);
      const response = await categoryApi.updateCategory(id, data);

      // Handle response
      const updatedCategory =
        response?.data?.data || response?.data || response;

      setCategories((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat._id === id || cat.id === id
            ? { ...cat, ...updatedCategory }
            : cat,
        ),
      }));

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Category updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update category";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const removeCategory = async (id) => {
    try {
      // Ask for confirmation
      // const result = await Swal.fire({
      //   title: "Are you sure?",
      //   text: "You won't be able to revert this!",
      //   icon: "warning",
      //   showCancelButton: true,
      //   confirmButtonColor: "#d33",
      //   cancelButtonColor: "#3085d6",
      //   confirmButtonText: "Yes, delete it!",
      // });

      // if (!result.isConfirmed) {
      //   return false;
      // }

      await categoryApi.deleteCategory(id);

      // Handle both id and _id
      setCategories((prev) => ({
        ...prev,
        categories: prev.categories.filter(
          (cat) => cat.id !== id && cat._id !== id,
        ),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1,
        },
      }));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Category has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete category";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    }
  };

  // Bulk delete categories
  const bulkDeleteCategories = async (categoryIds) => {
    try {
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

      if (!result.isConfirmed) {
        return false;
      }

      await categoryApi.bulkDeleteCategories(categoryIds);

      // Remove deleted categories from state
      setCategories((prev) =>
        prev.filter(
          (cat) =>
            !categoryIds.includes(cat.id) && !categoryIds.includes(cat._id),
        ),
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${categoryIds.length} categories have been deleted.`,
        timer: 2000,
        showConfirmButton: false,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete categories";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

      return false;
    }
  };

  // Search categories
  const searchCategories = async (query) => {
    try {
      setLoading(true);
      const response = await categoryApi.searchCategories(query);

      if (response && response.data) {
        setCategories(response.data.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }

      return response;
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
    } finally {
      setLoading(false);
    }
  };

  // Get single category by ID
  const getCategory = async (id) => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategoryById(id);
      return response.data.data || response;
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
    } finally {
      setLoading(false);
    }
  };

  // Change page
  const changePage = (newPage, filters = {}) => {
    loadCategories(newPage, pagination.limit, filters);
  };

  return {
    categories,
    loading,
    error,
    isSubmitting,
    pagination,
    addCategory,
    editCategory,
    removeCategory,
    loadCategories,
    loadMyCategories,
    searchCategories,
    getCategory,
    bulkDeleteCategories,
    changePage,
  };
};
