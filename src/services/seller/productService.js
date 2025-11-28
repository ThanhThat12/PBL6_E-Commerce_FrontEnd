/**
 * Product Service for Seller
 * API calls for product management (CRUD, variants, images)
 * 
 * Backend Endpoints:
 * - POST /api/products (create - JSON only, no images)
 * - PUT /api/products/{id} (update - JSON with ProductUpdateDTO)
 * - DELETE /api/products/{id} (delete)
 * - GET /api/products/{id} (get by ID)
 * - GET /api/products/my-products (list seller's products with optional isActive filter)
 * 
 * Image Upload (separate endpoints via ProductImageController):
 * - POST /api/products/{id}/images/main
 * - POST /api/products/{id}/images/gallery
 * - POST /api/products/{id}/images/gallery/batch-variants
 */
import api from '../api';

const BASE_URL = '/products';

/**
 * Get all products for seller's shop
 * @param {object} params - Query params { page, size, sortBy, sortDir, isActive }
 * @returns {Promise<object>} { content: [], totalElements, totalPages, currentPage }
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get(`${BASE_URL}/my-products`, { params });
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
 * Create new product (JSON only, no images)
 * Images should be uploaded separately after product creation
 * @param {object} productData - { name, description, basePrice, categoryId, variants }
 * @returns {Promise<object>} Created product with ID
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post(BASE_URL, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product using ProductUpdateDTO
 * @param {number} productId
 * @param {object} updateData - ProductUpdateDTO shape:
 *   {
 *     name?: string,
 *     description?: string,
 *     basePrice?: number,
 *     categoryId?: number,
 *     variantsToAdd?: [...],
 *     variantIdsToRemove?: [...],
 *     variantsToUpdate?: [{ id, sku?, price?, stock? }]
 *   }
 * @returns {Promise<object>} Updated product
 */
export const updateProduct = async (productId, updateData) => {
  try {
    const response = await api.put(`${BASE_URL}/${productId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
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
 * Toggle product status (Admin only - uses PATCH /api/products/{id}/status)
 * @param {number} productId
 * @returns {Promise<object>} Updated product
 */
export const toggleProductStatus = async (productId) => {
  try {
    const response = await api.patch(`${BASE_URL}/${productId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};
