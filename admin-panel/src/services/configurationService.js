import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class ConfigurationService extends BaseService {
  async updateAll(configurations) {
    return this.request(API_CONFIG.ENDPOINTS.CONFIGURATION.UPDATE, {
      method: "PUT",
      body: JSON.stringify({ configurations }),
    });
  }

  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.CONFIGURATION.GET, {
      method: "GET",
    });
  }

  async updateSingle(key, value, description, type) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.CONFIGURATION.UPDATE_SINGLE}${key}`,
      {
        method: "PUT",
        body: JSON.stringify({
          value,
          description,
          type,
        }),
      }
    );
  }
}

export default new ConfigurationService();
