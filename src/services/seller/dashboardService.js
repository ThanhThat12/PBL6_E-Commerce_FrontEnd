/**
 * Dashboard Service for Seller
 * API calls for seller dashboard statistics
 */
import api from '../api';

const BASE_URL = '/seller/dashboard';

/**
 * Get dashboard statistics
 * @returns {Promise<object>} { totalRevenue, totalOrders, totalProducts, totalCustomers }
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get revenue statistics by time range
 * @param {string} timeRange - "week", "month", "year"
 * @returns {Promise<object>} Revenue data for charts
 */
export const getRevenueStats = async (timeRange = 'month') => {
  try {
    const response = await api.get(`${BASE_URL}/revenue`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

/**
 * Get recent orders for dashboard
 * @param {number} limit - Number of orders to fetch (default: 5)
 * @returns {Promise<Array>} Recent orders
 */
export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await api.get(`${BASE_URL}/recent-orders`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

/**
 * Get top selling products
 * @param {number} limit - Number of products to fetch (default: 5)
 * @returns {Promise<Array>} Top products
 */
export const getTopProducts = async (limit = 5) => {
  try {
    const response = await api.get(`${BASE_URL}/top-products`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};
