import api from './api';

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
      const response = await api.post('/orders', orderData);
      return response.data;
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
      const response = await api.get('/orders');
      return response.data;
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
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
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
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
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
      const response = await api.get('/orders', {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;
