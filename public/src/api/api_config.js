const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    CONFIGURATION: {
      GET: "/api/configuration",
      GET_BY_KEY: "/api/configuration/",
    },
    CONTACT_TYPES: {
      GET: "/api/contact-types",
    },
    CONTACT_ITEMS: {
      GET: "/api/contact-items",
    },
    SLIDER_IMAGES: {
      GET: "/api/slider-images",
    },
    NAVIGATION: {
      GET: "/api/navigation",
    },
    PAGES: {
      GET: "/api/pages",
      GET_BY_ID: "/api/pages/",
    },
    MENU_ITEMS: {
      GET: "/api/menu-items",
    },
    CHEFS: {
      GET: "/api/chefs",
    },
    CURRENCIES: {
      GET: "/api/currencies",
    },
  },
};

export default API_CONFIG;
