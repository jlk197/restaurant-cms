const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    LOGIN: '/api/administrators/login',
    ADMINISTRATORS: '/api/administrators',
    PAGES: '/api/pages',
    MENU_ITEMS: '/api/menu-items',
    CONFIGURATION: '/api/configuration'
  }
};

export default API_CONFIG;