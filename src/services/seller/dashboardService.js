/**
 * Dashboard Service for Seller
 * API calls for seller dashboard statistics
 * 
 * Backend Endpoints:
 * - GET /api/seller/shop/analytics?year=2025
 * - GET /api/seller/top-buyers
 * - GET /api/products/my-shop/all
 */
import api from '../api';

/**
 * Get dashboard statistics
 * @returns {Promise<object>} { totalRevenue, totalOrders, totalProducts, totalCustomers, trends }
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/seller/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get revenue statistics by year
 * @param {number} year - Year for revenue stats (default: current year)
 * @returns {Promise<object>} { totalRevenue, totalOrders, monthlyRevenue: [{month, revenue, orderCount}] }
 */
export const getRevenueStats = async (year) => {
  try {
    const params = year ? { year } : {};
    const response = await api.get('/seller/shop/analytics', { params });
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
    const response = await api.get('/seller/orders', {
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
 * Note: This endpoint is not yet implemented in the backend
 * @param {number} limit - Number of products to fetch (default: 5)
 * @returns {Promise<Array>} Top products
 */
export const getTopProducts = async (limit = 5) => {
  try {
    // TODO: Replace with actual backend endpoint when available
    const response = await api.get('/seller/top-products', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};
