// W pliku chefService.js

import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class ChefService extends BaseService {
  async getAll() {
    return this.request("/api/chefs"); // Zakładam, że endpoint w API_CONFIG to po prostu ścieżka string
  }

  // NOWA METODA: Aktualizuje tylko jednego kucharza
  async updateSingle(id, chefData) {
    // Wysyłamy żądanie do /api/chefs/1, /api/chefs/2 itd.
    return this.request(`/api/chefs/${id}`, {
      method: "PUT",
      body: JSON.stringify(chefData),
    });
  }

  // Metodę updateAll możesz usunąć lub zakomentować, nie będziemy jej używać
}

export default new ChefService();