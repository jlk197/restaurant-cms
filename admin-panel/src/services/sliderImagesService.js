import API_CONFIG from "../config/api";
import BaseService from "./baseService";

class SliderImagesService extends BaseService {
  async getAll() {
    return this.request(API_CONFIG.ENDPOINTS.SLIDER_IMAGES.GET, {
      method: "GET",
    });
  }

  async add(type) {
    return this.request(API_CONFIG.ENDPOINTS.SLIDER_IMAGES.ADD, {
      method: "POST",
      body: JSON.stringify(type),
    });
  }

  async update(type) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.SLIDER_IMAGES.UPDATE}${type.id}`,
      {
        method: "PUT",
        body: JSON.stringify(type),
      }
    );
  }

  async delete(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.SLIDER_IMAGES.DELETE}${id}`, {
      method: "DELETE",
    });
  }
}

export default new SliderImagesService();
