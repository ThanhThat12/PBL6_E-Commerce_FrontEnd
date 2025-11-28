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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get all categories
 * Backend endpoint: GET /api/categories
 * @returns {Promise} - Response with List<CategoryDTO>
 */
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default {
  getAllCategories
};