import api from './api';

/**
 * Admin Wallet Service
 * Service for admin wallet management
 */
const adminWalletService = {
  /**
   * Get admin wallet balance
   * @returns {Promise} Admin balance data
   */
  getAdminBalance: async () => {
    try {
      const response = await api.get('/admin/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin balance:', error);
      throw error;
    }
  },

  /**
   * Get admin wallet transactions with pagination (simple version)
   * @param {Object} params - { page, size }
   * @returns {Promise} Paginated transactions
   */
  getAdminTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      throw error;
    }
  },

  /**
   * Get recent invoices (ORDER_PAYMENT transactions)
   * @param {number} limit - Number of recent invoices (default: 5)
   * @returns {Promise} List of recent invoices
   */
  getRecentInvoices: async (limit = 5) => {
    try {
      const response = await api.get('/admin/wallet/recent-invoices', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      throw error;
    }
  },

  /**
   * Search admin wallet transactions
   * @param {string} keyword - Search keyword (id, description, orderId, date)
   * @param {Object} params - { page, size }
   * @returns {Promise} Paginated search results
   */
  searchAdminTransactions: async (keyword, params = {}) => {
    try {
      const response = await api.get('/admin/wallet/transactions/search', {
        params: { keyword, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching admin transactions:', error);
      throw error;
    }
  }
};

export default adminWalletService;