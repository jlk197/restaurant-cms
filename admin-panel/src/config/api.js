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
    CONTACT_TYPES: {
      GET: "/api/contact-types",
      ADD: "/api/contact-types",
      UPDATE: "/api/contact-types/",
      DELETE: "/api/contact-types/",
    },
    CONTACT_ITEMS: {
      GET: "/api/contact-items",
      ADD: "/api/contact-items",
      UPDATE: "/api/contact-items/",
      DELETE: "/api/contact-items/",
    },
  },
};

export default API_CONFIG;
