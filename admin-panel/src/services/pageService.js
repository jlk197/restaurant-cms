import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class PageService extends BaseService {
  async getAll() {
    return this.request("/api/pages");
  }

  async getById(id) {
    return this.request(`/api/pages/${id}`);
  }

  async create(data) {
    return this.request("/api/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(id, data) {
    return this.request(`/api/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

async delete(id) {
  return this.request(`/api/pages/${id}`, { method: "DELETE" });
}

  async getAvailableContent() {
    return this.request("/api/content/available");
  }
}

export default new PageService();

