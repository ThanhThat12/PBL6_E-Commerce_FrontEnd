import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Order Service
 * API calls for order management
 */

const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise} Order response
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);
      // api interceptor already returns response.data (ResponseDTO)
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all orders for current user
   * @returns {Promise} Array of orders
   */
  getMyOrders: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER.GET_LIST);
      // api interceptor already returns response.data (ResponseDTO)
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order detail by ID
   * @param {number} orderId - Order ID
   * @returns {Promise} Order detail
   */
  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER.GET_BY_ID(orderId));
      // api interceptor already returns response.data (ResponseDTO)
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param {number} orderId - Order ID
   * @returns {Promise} Cancellation response
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(API_ENDPOINTS.ORDER.CANCEL(orderId));
      // api interceptor already returns response.data (ResponseDTO)
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get orders by status
   * @param {string} status - Order status (PENDING, PROCESSING, COMPLETED, CANCELLED)
   * @returns {Promise} Filtered orders
   */
  getOrdersByStatus: async (status) => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER.GET_LIST, {
        params: { status }
      });
      // api interceptor already returns response.data (ResponseDTO)
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;
