/**
 * Shop Service for Seller
 * API calls for shop profile management
 * 
 * Backend Endpoints:
 * - GET /api/seller/shop (get shop)
 * - PUT /api/seller/shop (update shop)
 * - GET /api/seller/shop/analytics?year=2025 (get analytics)
 * - POST /api/seller/register (register as seller)
 */
import api from '../api';

const BASE_URL = '/seller/shop';

/**
 * Get shop profile
 * @returns {Promise<object>} Shop profile data
 */
export const getShopProfile = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop profile:', error);
    throw error;
  }
};

/**
 * Update shop profile
 * @param {FormData} formData - Shop data (name, description, logo, banner)
 * @returns {Promise<object>} Updated shop profile
 */
export const updateShopProfile = async (formData) => {
  try {
    const response = await api.put(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating shop profile:', error);
    throw error;
  }
};

/**
 * Get shop analytics (revenue and orders)
 * @param {number} year - Year for analytics (optional, defaults to current year)
 * @returns {Promise<object>} { totalRevenue, totalOrders, monthlyRevenue: [{month, revenue, orderCount}] }
 */
export const getShopAnalytics = async (year) => {
  try {
    const params = year ? { year } : {};
    const response = await api.get(`${BASE_URL}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    throw error;
  }
};

/**
 * Upload shop logo
 * @param {File} file - Logo image file
 * @param {number} shopId - Shop ID
 * @returns {Promise<string>} Image URL
 * Note: Uses /api/images/shop/logo endpoint
 */
export const uploadShopLogo = async (file, shopId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shopId', shopId);
    
    const response = await api.post('/images/shop/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading shop logo:', error);
    throw error;
  }
};

/**
 * Upload shop banner
 * @param {File} file - Banner image file
 * @param {number} shopId - Shop ID
 * @returns {Promise<string>} Image URL
 * Note: Uses /api/images/shop/banner endpoint
 */
export const uploadShopBanner = async (file, shopId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shopId', shopId);
    
    const response = await api.post('/images/shop/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading shop banner:', error);
    throw error;
  }
};

/**
 * Register as seller (Buyer → Seller upgrade)
 * @param {object} data - { shopName, shopDescription, shopPhone, shopAddress }
 * @returns {Promise<object>} { shopId, shopName, message, autoApproved }
 */
export const registerAsSeller = async (data) => {
  try {
    const response = await api.post('/seller/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering as seller:', error);
    throw error;
  }
};
