const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    ADMINISTRATORS: {
      LOGIN: "/api/administrators/login",
      GET: "/api/administrators",
      ME: "/api/administrators/me",
      DELETE: "/api/administrators/",
    },
  },
};

export default API_CONFIG;
