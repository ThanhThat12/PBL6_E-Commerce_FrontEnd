/**
 * Customer Service for Seller
 * API calls for customer management and insights
 */
import api from '../api';

const BASE_URL = '/seller/customers';

/**
 * Get all customers for seller
 * @param {object} params - { page, size, keyword }
 * @returns {Promise<object>} { content: [], totalElements, totalPages }
 */
export const getCustomers = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer by ID
 * @param {number} customerId
 * @returns {Promise<object>} Customer details
 */
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`${BASE_URL}/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

/**
 * Get customer purchase history
 * @param {number} customerId
 * @param {object} params - { page, size }
 * @returns {Promise<object>} { orders: [], totalSpent, orderCount }
 */
export const getCustomerPurchaseHistory = async (customerId, params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/${customerId}/orders`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer purchase history:', error);
    throw error;
  }
};

/**
 * Get customer statistics
 * @returns {Promise<object>} { totalCustomers, newCustomers, activeCustomers }
 */
export const getCustomerStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }
};
