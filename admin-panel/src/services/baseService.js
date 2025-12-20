import API_CONFIG from "../config/api";

class BaseService {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = localStorage.getItem("authToken");

    const isFormData = options.body instanceof FormData;

    const config = {
      headers: {
        //"Content-Type": "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
try {
      const response = await fetch(url, config);

      // 1. Pobieramy odpowiedź jako tekst, a nie od razu JSON
      // To chroni nas przed błędami, gdy serwer zwraca HTML (np. błąd 404/500)
      const text = await response.text();
      let data;

      try {
        // 2. Próbujemy sparsować JSON
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        // Jeśli się nie uda, to znaczy, że serwer zwrócił np. stronę HTML z błędem
        console.error(`[BaseService] Błąd parsowania JSON dla ${endpoint}. Otrzymano:`, text);
        throw new Error(`Błąd serwera (${response.status}): Otrzymano nieprawidłową odpowiedź.`);
      }

      // 3. Sprawdzamy status HTTP (czy jest w zakresie 200-299)
      if (!response.ok) {
        const errorMessage = data.error || `Błąd HTTP ${response.status}`;
        // Zwracamy obiekt błędu w formacie oczekiwanym przez Twój frontend
        return { success: false, error: errorMessage };
      }

      // 4. Jeśli wszystko ok, zwracamy dane
      return data;

    } catch (error) {
      console.error("Request failed:", error);
      // Zwracamy obiekt błędu, żeby frontend (np. ChefPage) mógł go wyświetlić
      return { success: false, error: error.message };
    }
  }

  async uploadFile(endpoint, file) {
    const formData = new FormData();
    formData.append("image", file); // Klucz "image" musi zgadzać się z tym w backendzie (upload.single('image'))

    // Wywołujemy request, który sam obsłuży token i nagłówki
    return this.request(endpoint, {
      method: "POST",
      body: formData,
    });
  }
}

export default BaseService;

