import ApiService from './api_service';
import API_CONFIG from './api_config';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  let apiService;

  beforeEach(() => {
    apiService = new ApiService();
    jest.clearAllMocks();
  });

  describe('getAllConfiguration', () => {
    it('should fetch all configuration items', async () => {
      const mockConfig = {
        success: true,
        data: [
          { key: 'site_title', value: 'My Restaurant' },
          { key: 'contact_email', value: 'contact@restaurant.com' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockConfig
      });

      const result = await apiService.getAllConfiguration();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIGURATION.GET}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockConfig);
    });
  });

  describe('getAllChefs', () => {
    it('should fetch all chefs', async () => {
      const mockChefs = {
        success: true,
        data: [
          { id: 1, name: 'Gordon', surname: 'Ramsay', specialization: 'British Cuisine' },
          { id: 2, name: 'Jamie', surname: 'Oliver', specialization: 'Italian Cuisine' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockChefs
      });

      const result = await apiService.getAllChefs();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHEFS.GET}`,
        expect.any(Object)
      );
      expect(result).toEqual(mockChefs);
    });
  });

  describe('getAllMenuItems', () => {
    it('should fetch all menu items', async () => {
      const mockMenuItems = {
        success: true,
        data: [
          { id: 1, name: 'Spaghetti Carbonara', price: 45.00 },
          { id: 2, name: 'Margherita Pizza', price: 35.00 }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockMenuItems
      });

      const result = await apiService.getAllMenuItems();

      expect(result).toEqual(mockMenuItems);
    });
  });

  describe('getAllNavigation', () => {
    it('should fetch all navigation items', async () => {
      const mockNav = {
        success: true,
        data: [
          { id: 1, label: 'Home', url: '#home', is_active: true },
          { id: 2, label: 'Menu', url: '#menu', is_active: true }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockNav
      });

      const result = await apiService.getAllNavigation();

      expect(result).toEqual(mockNav);
    });
  });

  describe('getAllSliderImages', () => {
    it('should fetch all slider images', async () => {
      const mockSlider = {
        success: true,
        data: [
          { id: 1, image_url: '/uploads/slider1.jpg', is_active: true },
          { id: 2, image_url: '/uploads/slider2.jpg', is_active: true }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockSlider
      });

      const result = await apiService.getAllSliderImages();

      expect(result).toEqual(mockSlider);
    });
  });

  describe('getPageById', () => {
    it('should fetch a specific page by ID', async () => {
      const mockPage = {
        success: true,
        data: { id: 1, title: 'About Us', description: 'Our story' }
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockPage
      });

      const result = await apiService.getPageById(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAGES.GET_BY_ID}1`,
        expect.any(Object)
      );
      expect(result).toEqual(mockPage);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getAllConfiguration()).rejects.toThrow('Network error');
    });
  });
});

