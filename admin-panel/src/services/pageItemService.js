import BaseService from "./baseService";

class PageItemService extends BaseService {
  async getAll() {
    return this.request("/api/page-items");
  }

  async create(data) {
    return this.request("/api/page-items", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
  }

  async updateSingle(id, data) {
    return this.request(`/api/page-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async delete(id) {
    return this.request(`/api/page-items/${id}`, { method: "DELETE" });
  }
}

export default new PageItemService();