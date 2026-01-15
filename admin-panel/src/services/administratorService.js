import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class AdministratorService extends BaseService {
  async login(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.GET, {
      method: "GET",
    });
  }

  async getLoggedInUser() {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.ME, {
      method: "GET",
    });
  }

  async add(user) {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.GET, {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.ADMINISTRATORS.DELETE}${id}`, {
      method: "PUT",
    });
  }

  async forgotPassword(email) {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request(API_CONFIG.ENDPOINTS.ADMINISTRATORS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

export default new AdministratorService();
