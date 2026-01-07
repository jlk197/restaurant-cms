import API_CONFIG from "../config/api"; // Upewnij się, że ta ścieżka jest u Ciebie poprawna
import BaseService from "./baseService";

class ChefService extends BaseService {
  
  // 1. POBIERANIE WSZYSTKICH
  async getAll() {
    return this.request("/api/chefs"); 
  }

  // 2. EDYCJA POJEDYNCZEGO (To miałeś dobrze)
  async updateSingle(id, chefData) {
    return this.request(`/api/chefs/${id}`, {
      method: "PUT",
      body: JSON.stringify(chefData),
      headers: {
        'Content-Type': 'application/json' // Warto dodać dla pewności
      }
    });
  }

  // 3. TWORZENIE NOWEGO (POPRAWIONE)
  async create(data) {
    // Musimy przekazać obiekt opcji, tak jak w updateSingle!
    return this.request('/api/chefs', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
  }

  // 4. USUWANIE (POPRAWIONE)
  async delete(id) {
    return this.request(`/api/chefs/${id}`, {
        method: 'DELETE'
    });
  }
}

export default new ChefService();