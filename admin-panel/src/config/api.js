const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    ADMINISTRATORS: {
      LOGIN: "/api/administrators/login",
      GET: "/api/administrators",
      ME: "/api/administrators/me",
      DELETE: "/api/administrators/",
    },
    CONFIGURATION: {
      GET: "/api/configuration",
      UPDATE: "/api/configuration",
      UPDATE_SINGLE: "/api/configuration/",
    },
    CHEFS: {
      GET: "/api/chefs",
      UPDATE: "/api/chefs",
      UPDATE_SINGLE: "/api/chefs/",
    }
  },
};

export default API_CONFIG;
