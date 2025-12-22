/**
 * Customer Service for Seller
 * API calls for customer management and analytics
 * 
 * Backend Endpoints:
 * - GET /api/seller/top-buyers
 * - GET /api/seller/top-buyers/limit/{limit}
 */
import api from '../api';

/**
 * Get top buyers (customers who purchased the most)
 * @returns {Promise<Array>} List of top buyers
 */
export const getTopBuyers = async () => {
  try {
    const response = await api.get('/seller/top-buyers');
    return response.data;
  } catch (error) {
    console.error('Error fetching top buyers:', error);
    throw error;
  }
};

/**
 * Get top buyers with limit
 * @param {number} limit - Maximum number of buyers to return
 * @returns {Promise<Array>} List of top buyers
 */
export const getTopBuyersWithLimit = async (limit) => {
  try {
    const response = await api.get(`/seller/top-buyers/limit/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top buyers with limit:', error);
    throw error;
  }
};
