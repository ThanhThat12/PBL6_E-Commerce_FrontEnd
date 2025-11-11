/**
 * Shop Service for Seller
 * API calls for shop profile management
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
 * Get shop statistics
 * @returns {Promise<object>} Shop stats (rating, followers, products count)
 */
export const getShopStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    throw error;
  }
};

/**
 * Upload shop logo
 * @param {File} file - Logo image file
 * @returns {Promise<string>} Image URL
 */
export const uploadShopLogo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post(`${BASE_URL}/logo`, formData, {
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
 * @returns {Promise<string>} Image URL
 */
export const uploadShopBanner = async (file) => {
  try {
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await api.post(`${BASE_URL}/banner`, formData, {
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
