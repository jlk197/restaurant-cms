import API_CONFIG from '../config/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }

  async login(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getPages() {
    return this.request(API_CONFIG.ENDPOINTS.PAGES);
  }

  async getConfiguration() {
    return this.request(API_CONFIG.ENDPOINTS.CONFIGURATION);
  }
}

export default new ApiService();