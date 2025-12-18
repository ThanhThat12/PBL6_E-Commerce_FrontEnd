import axios from 'axios';

const API_BASE_URL = 'https://localhost:8081/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Axios instance with interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get all orders with pagination for admin
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 10)
 * @returns {Promise} Response with page of orders
 */
export const getAdminOrders = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/admin/orders', {
      params: { page, size }
    });
    return response;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

/**
 * Get order detail by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Response with order detail
 */
export const getAdminOrderDetail = async (orderId) => {
  try {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

/**
 * Get order statistics for admin dashboard
 * @returns {Promise} Response with stats (totalOrders, pendingOrders, completedOrders, totalRevenue)
 */
export const getAdminOrderStats = async () => {
  try {
    const response = await apiClient.get('/admin/orders/stats');
    return response;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

/**
 * Get orders filtered by status with pagination
 * @param {string} status - Order status (PENDING, PROCESSING, SHIPPING, COMPLETED, CANCELLED)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 10)
 * @returns {Promise} Response with page of filtered orders
 */
export const getAdminOrdersByStatus = async (status, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/admin/orders/status/${status}`, {
      params: { page, size }
    });
    return response;
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
};

export default {
  getAdminOrders,
  getAdminOrderDetail,
  getAdminOrderStats,
  getAdminOrdersByStatus
};
