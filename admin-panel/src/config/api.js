const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    ADMINISTRATORS: {
      LOGIN: "/api/administrators/login",
      GET: "/api/administrators",
      ME: "/api/administrators/me",
      DELETE: "/api/administrators/delete/",
      FORGOT_PASSWORD: "/api/administrators/forgot-password",
      RESET_PASSWORD: "/api/administrators/reset-password",
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
    SLIDER_IMAGES: {
      GET: "/api/slider-images",
      ADD: "/api/slider-images",
      UPDATE: "/api/slider-images/",
      DELETE: "/api/slider-images/",
    },
    NAVIGATION: {
      GET: "/api/navigation",
      ADD: "/api/navigation",
      UPDATE: "/api/navigation/",
      DELETE: "/api/navigation/",
    },
    PAGES: {
      GET: "/api/pages",
      ADD: "/api/pages",
      UPDATE: "/api/pages/",
      DELETE: "/api/pages/",
    },
  },
};

export default API_CONFIG;