import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class NavigationService extends BaseService {
  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.NAVIGATION.GET, {
      method: "GET",
    });
  }

  async add(type) {
    return this.request(API_CONFIG.ENDPOINTS.NAVIGATION.ADD, {
      method: "POST",
      body: JSON.stringify(type),
    });
  }

  async update(type) {
    return this.request(`${API_CONFIG.ENDPOINTS.NAVIGATION.UPDATE}${type.id}`, {
      method: "PUT",
      body: JSON.stringify(type),
    });
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.NAVIGATION.DELETE}${id}`, {
      method: "DELETE",
    });
  }
}

export default new NavigationService();
