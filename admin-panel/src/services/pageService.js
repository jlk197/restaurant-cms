import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class PageService extends BaseService {
  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.PAGES.GET, {
      method: "GET",
    });
  }

  async add(page) {
    return this.request(API_CONFIG.ENDPOINTS.PAGES.ADD, {
      method: "POST",
      body: JSON.stringify(page),
    });
  }

  async update(page) {
    return this.request(`${API_CONFIG.ENDPOINTS.PAGES.UPDATE}${page.id}`, {
      method: "PUT",
      body: JSON.stringify(page),
    });
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.PAGES.DELETE}${id}`, {
      method: "DELETE",
    });
  }
}

export default new PageService();

