import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Product Attribute Service
 * Handles API calls for product attributes (Color, Size, Material, etc.)
 * Used for loading classification types when creating/editing products
 */
const productAttributeService = {
  /**
   * Get all product attributes
   * @returns {Promise<Array>} List of attributes [{id, name}, ...]
   */
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.PRODUCT_ATTRIBUTE.GET_ALL);
    return response;
  },

  /**
   * Get a specific attribute by ID
   * @param {number} id - Attribute ID
   * @returns {Promise<Object>} Attribute {id, name}
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PRODUCT_ATTRIBUTE.GET_BY_ID(id));
    return response;
  }
};

export default productAttributeService;
