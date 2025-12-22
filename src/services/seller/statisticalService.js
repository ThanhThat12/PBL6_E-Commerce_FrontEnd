/**
 * Statistical Service for Seller
 * API calls for seller analytics and reports
 */
import api from '../api';

const BASE_URL = '/seller/statistical';

/**
 * Get revenue statistics
 * @param {object} params - { startDate, endDate, groupBy: "day"|"week"|"month" }
 * @returns {Promise<Array>} Revenue data points for charts
 */
export const getRevenueStats = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/revenue`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

/**
 * Get sales statistics (quantity sold)
 * @param {object} params - { startDate, endDate, groupBy: "day"|"week"|"month" }
 * @returns {Promise<Array>} Sales data points for charts
 */
export const getSalesStats = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/sales`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    throw error;
  }
};

/**
 * Get top selling products
 * @param {object} params - { startDate, endDate, limit: 10 }
 * @returns {Promise<Array>} Top products with sales count
 */
export const getTopProducts = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/top-products`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Get customer statistics
 * @param {object} params - { startDate, endDate }
 * @returns {Promise<object>} { newCustomers, returningCustomers, totalOrders }
 */
export const getCustomerStats = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/customers`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }
};

/**
 * Get order status distribution
 * @returns {Promise<object>} { pending, confirmed, shipping, delivered, cancelled }
 */
export const getOrderStatusStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/order-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order status stats:', error);
    throw error;
  }
};

/**
 * Export report to CSV/Excel
 * @param {object} params - { startDate, endDate, type: "revenue"|"sales"|"products" }
 * @returns {Promise<Blob>} File blob for download
 */
export const exportReport = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting report:', error);
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
    const response = await api.get(`/seller/shop/analytics`, { params: { year } });
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