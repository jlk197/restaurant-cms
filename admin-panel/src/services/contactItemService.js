import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class ContactItemService extends BaseService {
  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_ITEMS.GET, {
      method: "GET",
    });
  }

  async add(type) {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_ITEMS.ADD, {
      method: "POST",
      body: JSON.stringify(type),
    });
  }

  async update(type) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.CONTACT_ITEMS.UPDATE}${type.id}`,
      {
        method: "PUT",
        body: JSON.stringify(type),
      }
    );
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.CONTACT_ITEMS.DELETE}${id}`, {
      method: "DELETE",
    });
  }
}

export default new ContactItemService();
