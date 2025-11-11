/**
 * Product Service for Seller
 * API calls for product management (CRUD, variants, images)
 */
import api from '../api';

const BASE_URL = '/seller/products';

/**
 * Get all products for seller
 * @param {object} params - Query params { page, size, keyword, categoryId, status }
 * @returns {Promise<object>} { content: [], totalElements, totalPages, currentPage }
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {number} productId
 * @returns {Promise<object>} Product details
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`${BASE_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Create new product with variants
 * @param {FormData} formData - Product data (images, variants, details)
 * @returns {Promise<object>} Created product
 */
export const createProduct = async (formData) => {
  try {
    const response = await api.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product
 * @param {number} productId
 * @param {FormData} formData - Updated product data
 * @returns {Promise<object>} Updated product
 */
export const updateProduct = async (productId, formData) => {
  try {
    const response = await api.put(`${BASE_URL}/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product
 * @param {number} productId
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  try {
    await api.delete(`${BASE_URL}/${productId}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Update product status (ACTIVE, INACTIVE, OUT_OF_STOCK)
 * @param {number} productId
 * @param {string} status
 * @returns {Promise<object>} Updated product
 */
export const updateProductStatus = async (productId, status) => {
  try {
    const response = await api.patch(`${BASE_URL}/${productId}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};
