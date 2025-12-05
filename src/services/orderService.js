import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Order Service
 * API calls for order management
 */

const orderService = {
  /**
   * Buyer gửi yêu cầu hoàn tiền
   * @param {number} orderId
   * @param {Object} data { amount, description }
   * @returns {Promise}
   */
  /**
   * Buyer gửi yêu cầu hoàn tiền
   * @param {number} orderId
   * @param {Object} data { amount, description }
   * @returns {Promise}
   */
  requestRefund: async (orderId, data) => {
    try {
      const response = await api.post(`refund/request/${orderId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Seller lấy danh sách yêu cầu hoàn tiền
   */
  getRefundRequests: async () => {
    try {
      const response = await api.get('refund/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Seller duyệt hoàn tiền (luôn yêu cầu trả hàng)
   */
  approveRefund: async (refundId) => {
    try {
      const response = await api.post(`refund/review/${refundId}?approve=true`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Seller từ chối hoàn tiền
   */
  rejectRefund: async (refundId, reason) => {
    try {
      const response = await api.post(`refund/review/${refundId}?approve=false&rejectReason=${encodeURIComponent(reason)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Seller xác nhận đã nhận hàng trả về
   */
  confirmRefundReceipt: async (refundId) => {
    try {
      const response = await api.post(`refund/confirm-receipt/${refundId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Buyer lấy danh sách yêu cầu hoàn tiền của mình
   */
  getMyRefundRequests: async () => {
    try {
      const response = await api.get('refund/my-requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
   * Create multiple orders for multi-shop checkout
   * @param {Object} orderData - Order data
   * @returns {Promise} Multi-shop order response with orderIds array
   */
  createMultiShopOrders: async (orderData) => {
    try {
      const response = await api.post('/orders/multi-shop', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all orders for the current user
   * @param {Object} orderData - Order data with items from multiple shops
   * @returns {Promise} Multi-shop order result with order IDs and total amount
   */
  // Duplicate removed - using the one above

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
