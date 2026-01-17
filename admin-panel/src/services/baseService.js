import API_CONFIG from "../config/api";

class BaseService {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const token = localStorage.getItem("authToken");
    const headers = { ...options.headers };

    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        console.error("Błąd 401: Token odrzucony.");
        return { success: false, error: "Sesja wygasła. Zaloguj się ponownie." };
      }

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        return { success: response.ok, data: null };
      }

      if (!response.ok) {
        return { success: false, error: data.error || `Błąd HTTP ${response.status}` };
      }

      return data;
    } catch (error) {
      console.error("Request failed:", error);
      return { success: false, error: error.message };
    }
  }

  async uploadFile(endpoint, file) {
    const formData = new FormData();
    formData.append("image", file); 

    return this.request(endpoint, {
      method: "POST",
      body: formData,
    });
  }
}

// --- POPRAWKA TUTAJ: Eksportujemy Klasę, a nie 'new BaseService()' ---
export default BaseService;