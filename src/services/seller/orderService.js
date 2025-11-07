/**
 * Order Service for Seller
 * API calls for order management
 */
import api from '../api';

const BASE_URL = '/seller/orders';

// Order status mapping
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
};

// Status display mapping for UI
export const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
};

/**
 * Get all orders for seller
 * @param {object} params - { page, size, status, keyword }
 * @returns {Promise<object>} { content: [], totalElements, totalPages }
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get order by ID
 * @param {number} orderId
 * @returns {Promise<object>} Order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`${BASE_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {number} orderId
 * @param {string} status - New status (use ORDER_STATUS constants)
 * @returns {Promise<object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel order
 * @param {number} orderId
 * @param {string} reason - Cancellation reason
 * @returns {Promise<object>} Updated order
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`${BASE_URL}/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Get order statistics
 * @returns {Promise<object>} { total, pending, confirmed, shipping, delivered, cancelled }
 */
export const getOrderStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};
