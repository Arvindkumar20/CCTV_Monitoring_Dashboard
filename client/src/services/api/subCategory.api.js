import api from "../api";


class SubCategoryApi {
  /**
   * Get all sub categories with pagination and filters
   */
  async getAllSubCategories(params = {}) {
    const response = await api.get('/api/sub-categories', { params });
    return response.data;
  }

  /**
   * Get sub categories by main category
   */
  async getByMainCategory(mainCategoryId) {
    const response = await api.get(`/api/sub-categories/by-main-category/${mainCategoryId}`);
    return response.data;
  }

  /**
   * Get sub category by ID
   */
  async getSubCategoryById(id) {
    const response = await api.get(`/api/sub-categories/${id}`);
    return response.data;
  }

  /**
   * Create new sub category
   */
  async createSubCategory(data) {
    const response = await api.post('/api/sub-categories', data);
    return response.data;
  }

  /**
   * Update sub category
   */
  async updateSubCategory(id, data) {
    const response = await api.put(`/api/sub-categories/${id}`, data);
    return response.data;
  }

  /**
   * Delete sub category
   */
  async deleteSubCategory(id) {
    const response = await api.delete(`/api/sub-categories/${id}`);
    return response.data;
  }

  /**
   * Bulk delete sub categories
   */
  async bulkDeleteSubCategories(subCategoryIds) {
    const response = await api.post('/api/sub-categories/bulk-delete', { subCategoryIds });
    return response.data;
  }

  /**
   * Toggle sub category status
   */
  async toggleStatus(id) {
    const response = await api.patch(`/api/sub-categories/${id}/toggle-status`);
    return response.data;
  }

  /**
   * Reorder sub categories
   */
  async reorderSubCategories(mainCategoryId, orderedIds) {
    const response = await api.post(`/api/sub-categories/reorder/${mainCategoryId}`, { orderedIds });
    return response.data;
  }

  /**
   * Search sub categories
   */
  async searchSubCategories(query, mainCategoryId = null) {
    const params = { q: query };
    if (mainCategoryId) params.mainCategoryId = mainCategoryId;
    
    const response = await api.get('/api/sub-categories/search', { params });
    return response.data;
  }

  /**
   * Get statistics
   */
  async getStats() {
    const response = await api.get('/api/sub-categories/stats');
    return response.data;
  }

  /**
   * Duplicate sub category
   */
  async duplicateSubCategory(id) {
    const response = await api.post(`/api/sub-categories/${id}/duplicate`);
    return response.data;
  }

  /**
   * Export sub categories
   */
  async exportSubCategories(mainCategoryId = null) {
    const params = mainCategoryId ? { mainCategoryId } : {};
    const response = await api.get('/api/sub-categories/export', { params });
    return response.data;
  }

  /**
   * Import sub categories
   */
  async importSubCategories(data) {
    const response = await api.post('/api/sub-categories/import', { data });
    return response.data;
  }
}

export const subCategoryApi = new SubCategoryApi();