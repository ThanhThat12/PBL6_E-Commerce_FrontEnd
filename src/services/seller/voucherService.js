import api from '../api';

/**
 * Voucher Service for Seller
 * API calls for voucher management
 */

const BASE_URL = '/seller/vouchers';

const voucherService = {
  /**
   * Create a new voucher
   * @param {object} voucherData - Voucher creation data
   * @returns {Promise}
   */
  createVoucher: async (voucherData) => {
    try {
      const response = await api.post(BASE_URL, voucherData);
      return response;
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  },

  /**
   * Get all vouchers for seller's shop
   * @returns {Promise}
   */
  getAllVouchers: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  /**
   * Get active vouchers only
   * @returns {Promise}
   */
  getActiveVouchers: async () => {
    try {
      const response = await api.get(`${BASE_URL}/active`);
      return response;
    } catch (error) {
      console.error('Error fetching active vouchers:', error);
      throw error;
    }
  },

  /**
   * Deactivate a voucher
   * @param {number} voucherId
   * @returns {Promise}
   */
  deactivateVoucher: async (voucherId) => {
    try {
      const response = await api.patch(`${BASE_URL}/${voucherId}/deactivate`);
      return response;
    } catch (error) {
      console.error('Error deactivating voucher:', error);
      throw error;
    }
  },

  /**
   * Get available vouchers for checkout (User/Buyer)
   * @param {object} params - { shopId, productIds, cartTotal }
   * @returns {Promise}
   */
  getAvailableVouchers: async (params) => {
    try {
      const { shopId, productIds, cartTotal } = params;
      const productIdsString = Array.isArray(productIds) ? productIds.join(',') : productIds;
      
      const response = await api.get(`${BASE_URL}/available`, {
        params: {
          shopId,
          productIds: productIdsString,
          cartTotal
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
      throw error;
    }
  }
};

export default voucherService;
