import BaseService from "./baseService";

class ContentService extends BaseService {
  async getAll() {
    return this.request("/api/content");
  }

  // Metoda do szybkiej aktualizacji ustawień (pozycja/widoczność)
  async updateSettings(id, position, is_active) {
    return this.request(`/api/content/${id}/settings`, {
      method: "PUT",
      body: JSON.stringify({ position, is_active }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default new ContentService();