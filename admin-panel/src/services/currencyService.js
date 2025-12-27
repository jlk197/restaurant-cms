import BaseService from "./baseService";

class CurrencyService extends BaseService {
  async getAll() {
    return this.request("/api/currencies");
  }

  async create(data) {
    return this.request("/api/currencies", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  }

  async delete(id) {
    return this.request(`/api/currencies/${id}`, { method: "DELETE" });
  }
}

export default new CurrencyService();