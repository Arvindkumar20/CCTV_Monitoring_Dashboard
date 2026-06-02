import api from "../api";


class CategoryApi {
  /**
   * Get all categories with pagination and filters
   */
  async getAllCategories(params = {}) {
    const response = await api.get('/api/categories', { params });
    return response.data;
  }

  /**
   * Get current user's categories
   */
  async getMyCategories() {
    const response = await api.get('/api/categories/my-categories');
    return response.data;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  }

  /**
   * Create new category
   */
  async createCategory(data) {
    const response = await api.post('/api/categories', data);
    return response.data;
  }

  /**
   * Update category
   */
  async updateCategory(id, data) {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  }

  /**
   * Delete category
   */
  async deleteCategory(id) {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  }

  /**
   * Bulk delete categories (admin only)
   */
  async bulkDeleteCategories(categoryIds) {
    const response = await api.post('/api/categories/bulk-delete', { categoryIds });
    return response.data;
  }

  /**
   * Search categories
   */
  async searchCategories(query) {
    const response = await api.get('/api/categories/search', { params: { q: query } });
    return response.data;
  }
}

export const categoryApi = new CategoryApi();