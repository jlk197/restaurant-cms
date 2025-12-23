import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class PageService extends BaseService {
  // Pobierz wszystkie strony (lista)
  async getAll() {
    return this.request("/api/pages");
  }

  // Pobierz szczegóły strony (wraz z przypiętym contentem)
  async getById(id) {
    return this.request(`/api/pages/${id}`);
  }

  // Utwórz stronę
  async create(data) {
    return this.request("/api/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Zaktualizuj stronę (dane + lista contentu)
  async update(id, data) {
    return this.request(`/api/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Pobierz listę wszystkich dostępnych elementów contentu (Kucharze, Menu itp.)
  async getAvailableContent() {
    return this.request("/api/content/available");
  }
}

export default new PageService();