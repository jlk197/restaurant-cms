import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class ContactTypeService extends BaseService {
  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_TYPES.GET, {
      method: "GET",
    });
  }

  async add(type) {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_TYPES.ADD, {
      method: "POST",
      body: JSON.stringify(type),
    });
  }

  async update(type) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.CONTACT_TYPES.UPDATE}${type.id}`,
      {
        method: "PUT",
        body: JSON.stringify(type),
      }
    );
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.CONTACT_TYPES.DELETE}${id}`, {
      method: "DELETE",
    });
  }
}

export default new ContactTypeService();
