import api from "../api";


class NestedSubCategoryApi {
  /**
   * Get all nested sub categories with pagination
   */
  async getAll(params = {}) {
    const response = await api.get("/api/nested-subcategories", { params });
    return response.data;
  }

  /**
   * Get nested sub category by ID
   */
  async getById(id) {
    const response = await api.get(`/api/nested-subcategories/${id}`);
    return response.data;
  }

  /**
   * Create new nested sub category
   */
  async create(data) {
    const response = await api.post("/api/nested-subcategories", data);
    return response.data;
  }

  /**
   * Update nested sub category
   */
  async update(id, data) {
    const response = await api.put(`/api/nested-subcategories/${id}`, data);
    return response.data;
  }

  /**
   * Delete nested sub category
   */
  async delete(id) {
    const response = await api.delete(`/api/nested-subcategories/${id}`);
    return response.data;
  }

  /**
   * Get by sub category
   */
  async getBySubCategory(subCategoryId) {
    const response = await api.get(`/api/nested-subcategories/by-sub-category/${subCategoryId}`);
    return response.data;
  }

  /**
   * Get by main category
   */
  async getByMainCategory(mainCategoryId) {
    const response = await api.get(`/api/nested-subcategories/by-main-category/${mainCategoryId}`);
    return response.data;
  }

  /**
   * Toggle status
   */
  async toggleStatus(id) {
    const response = await api.patch(`/api/nested-subcategories/${id}/toggle-status`);
    return response.data;
  }

  /**
   * Bulk delete
   */
  async bulkDelete(ids) {
    const response = await api.post("/api/nested-subcategories/bulk-delete", { 
      nestedSubCategoryIds: ids 
    });
    return response.data;
  }

  /**
   * Search
   */
  async search(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await api.get("/api/nested-subcategories/search", { params });
    return response.data;
  }

  /**
   * Get statistics
   */
  async getStats() {
    const response = await api.get("/api/nested-subcategories/stats");
    return response.data;
  }

  /**
   * Get tree for a sub category
   */
  async getTree(subCategoryId) {
    const response = await api.get(`/api/nested-subcategories/tree/${subCategoryId}`);
    return response.data;
  }

  /**
   * Get hierarchy
   */
  async getHierarchy(id) {
    const response = await api.get(`/api/nested-subcategories/${id}/hierarchy`);
    return response.data;
  }

  /**
   * Move nested sub category
   */
  async move(id, data) {
    const response = await api.post(`/api/nested-subcategories/${id}/move`, data);
    return response.data;
  }
}

export const nestedSubCategoryApi = new NestedSubCategoryApi();