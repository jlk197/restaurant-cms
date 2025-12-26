import BaseService from "./baseService";
import { MenuItemFormData } from "../models/menu";

class MenuService extends BaseService {
  async getAll() {
    return this.request("/api/menu-items");
  }

  async getById(id) {
    return this.request(`/api/menu-items/${id}`);
  }

  async create(data) {
    return this.request("/api/menu-items", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
  }

  async updateSingle(id, data) {
    return this.request(`/api/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async delete(id) {
    return this.request(`/api/menu-items/${id}`, { method: "DELETE" });
  }
}

export default new MenuService();