import axios from 'axios';

const API_BASE_URL = 'https://localhost:8081/api';

// Lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Axios instance với interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get all products with pagination
 * Backend endpoint: GET /api/admin/products/page?page={page}&size={size}
 * @param {number} page - Page number (0-based)
 * @param {number} size - Items per page
 * @returns {Promise} - Response with Page<AdminListProductDTO>
 */
export const getProductsWithPaging = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/admin/products/page', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products with paging:', error);
    throw error;
  }
};

/**
 * Get product statistics
 * Backend endpoint: GET /api/admin/products/stats
 * @returns {Promise} - Response with AdminProductStats
 */
export const getProductStats = async () => {
  try {
    const response = await apiClient.get('/admin/products/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching product stats:', error);
    throw error;
  }
};

/**
 * Get products filtered by category
 * Backend endpoint: GET /api/admin/products/category?categoryName={categoryName}&page={page}&size={size}
 * @param {string} categoryName - Category name to filter
 * @param {number} page - Page number (0-based)
 * @param {number} size - Items per page
 * @returns {Promise} - Response with Page<AdminListProductDTO>
 */
export const getProductsByCategory = async (categoryName, page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/admin/products/category', {
      params: { categoryName, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

/**
 * Get products filtered by status
 * Backend endpoint: GET /api/admin/products/status?status={status}&page={page}&size={size}
 * @param {string} status - Status to filter ("Active" or "Pending")
 * @param {number} page - Page number (0-based)
 * @param {number} size - Items per page
 * @returns {Promise} - Response with Page<AdminListProductDTO>
 */
export const getProductsByStatus = async (status, page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/admin/products/status', {
      params: { status, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by status:', error);
    throw error;
  }
};

/**
 * Delete a product
 * Backend endpoint: DELETE /api/admin/products/{productId}/delete
 * @param {number} productId - Product ID to delete
 * @returns {Promise} - Response with success message
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/admin/products/${productId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Search products by name
 * Backend endpoint: GET /api/admin/products/search?name={name}&page={page}&size={size}
 * @param {string} name - Product name to search
 * @param {number} page - Page number (0-based)
 * @param {number} size - Items per page
 * @returns {Promise} - Response with Page<AdminListProductDTO>
 */
export const searchProducts = async (name, page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/admin/products/search', {
      params: { name, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export default {
  getProductsWithPaging,
  getProductStats,
  getProductsByCategory,
  getProductsByStatus,
  deleteProduct,
  searchProducts
};
