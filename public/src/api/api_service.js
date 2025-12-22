import API_CONFIG from "../api/api_config";
import BaseService from "./baseService";

class ApiService extends BaseService {
  // Configuration endpoints
  async getAllConfiguration() {
    return this.request(API_CONFIG.ENDPOINTS.CONFIGURATION.GET, {
      method: "GET",
    });
  }

  async getConfigurationByKey(key) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.CONFIGURATION.GET_BY_KEY}${key}`,
      {
        method: "GET",
      }
    );
  }

  // Contact Types endpoints
  async getAllContactTypes() {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_TYPES.GET, {
      method: "GET",
    });
  }

  // Contact Items endpoints
  async getAllContactItems() {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT_ITEMS.GET, {
      method: "GET",
    });
  }

  // Slider Images endpoints
  async getAllSliderImages() {
    return this.request(API_CONFIG.ENDPOINTS.SLIDER_IMAGES.GET, {
      method: "GET",
    });
  }

  // Navigation endpoints
  async getAllNavigation() {
    return this.request(API_CONFIG.ENDPOINTS.NAVIGATION.GET, {
      method: "GET",
    });
  }

  // Pages endpoints
  async getAllPages() {
    return this.request(API_CONFIG.ENDPOINTS.PAGES.GET, {
      method: "GET",
    });
  }

  async getPageById(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.PAGES.GET_BY_ID}${id}`, {
      method: "GET",
    });
  }

  // Menu Items endpoints
  async getAllMenuItems() {
    return this.request(API_CONFIG.ENDPOINTS.MENU_ITEMS.GET, {
      method: "GET",
    });
  }

  // Chefs endpoints
  async getAllChefs() {
    return this.request(API_CONFIG.ENDPOINTS.CHEFS.GET, {
      method: "GET",
    });
  }

  // Currencies endpoints
  async getAllCurrencies() {
    return this.request(API_CONFIG.ENDPOINTS.CURRENCIES.GET, {
      method: "GET",
    });
  }
}

export default new ApiService();
