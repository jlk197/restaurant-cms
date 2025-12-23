import API_CONFIG from "../config/api";

class BaseService {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // 1. Pobierz token
    const token = localStorage.getItem("authToken");

    // 2. Przygotuj obiekt nagłówków
    const headers = { ...options.headers };

    // 3. Dodaj Content-Type (jeśli to nie upload pliku FormData)
    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    // 4. Dodaj Token (Bezpieczne przypisanie)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Diagnostyka (opcjonalna, możesz usunąć po naprawieniu)
    // console.log(`[BaseService] Wysyłam do: ${endpoint}, Token: ${token ? "TAK" : "NIE"}`);

    const config = {
      ...options,
      headers: headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        console.error("Błąd 401: Token odrzucony.");
        // Opcjonalnie: automatyczne wylogowanie
        // window.location.href = '/login';
        return { success: false, error: "Sesja wygasła. Zaloguj się ponownie." };
      }

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        // Jeśli serwer nie zwrócił JSONa (np. pusty 204 lub błąd HTML)
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