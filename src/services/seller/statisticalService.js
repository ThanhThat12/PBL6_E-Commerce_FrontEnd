/**
 * Statistical Service for Seller
 * API calls for seller analytics and reports
 * 
 * Backend Endpoints:
 * - GET /api/seller/shop/analytics?year=2025
 * - GET /api/seller/top-buyers
 * - GET /api/seller/top-buyers/limit/{limit}
 */
import api from '../api';

/**
 * Get revenue statistics from shop analytics
 * @param {number} year - Year for analytics (optional, defaults to current year)
 * @returns {Promise<object>} { totalRevenue, totalOrders, monthlyRevenue }
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
 * Get top buyers for seller
 * @param {number} limit - Number of top buyers to fetch (optional)
 * @returns {Promise<Array>} Top buyers list
 */
export const getTopBuyers = async (limit) => {
  try {
    const url = limit ? `/seller/top-buyers/limit/${limit}` : '/seller/top-buyers';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching top buyers:', error);
    throw error;
  }
};

/**
 * Get shop analytics by year (monthly revenue, totals)
 * @param {number|string} year - Year e.g. 2024
 * @returns {Promise<object>} { totalRevenue, totalCompletedOrders, monthlyRevenue: [...] }
 */
export const getShopAnalytics = async (year) => {
  try {
    const params = year ? { year } : {};
    const response = await api.get('/seller/shop/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    throw error;
  }
};

/**
 * Get top buyers for the shop
 * @param {object} params - optional params { limit }
 * @returns {Promise<Array>} list of buyers
 */
export const getTopBuyers = async (params = {}) => {
  try {
    const response = await api.get('/seller/top-buyers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top buyers:', error);
    throw error;
  }
};

/**
 * Get completed orders monthly statistics
 * @returns {Promise<Array>} Array of { year, month, orderCount }
 */
export const getCompletedOrdersMonthly = async () => {
  try {
    const response = await api.get('/seller/analytics/orders/completed-monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching completed orders monthly:', error);
    throw error;
  }
};

/**
 * Get cancelled orders monthly statistics
 * @returns {Promise<Array>} Array of { year, month, orderCount }
 */
export const getCancelledOrdersMonthly = async () => {
  try {
    const response = await api.get('/seller/analytics/orders/cancelled-monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching cancelled orders monthly:', error);
    throw error;
  }
};

/**
 * Get top selling products
 * @returns {Promise<Array>} Array of { productId, productName, mainImage, totalQuantitySold, totalOrders }
 */
export const getTopSellingProducts = async () => {
  try {
    const response = await api.get('/seller/analytics/products/top-selling');
    return response.data;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
};
