import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

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

// ============ Customer APIs ============

/**
 * Get all customers (role = BUYER)
 * Backend endpoint: GET /api/admin/users/customers
 * Returns: ResponseDTO<List<UserInfoDTO>>
 */
export const getCustomers = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/customers');
    const response = await apiClient.get('/admin/users/customers');
    console.log('✅ [adminService] Customers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer detail by ID
 * Backend endpoint: GET /api/admin/users/detail/{userId}
 * Returns: ResponseDTO<AdminUserDetailDTO>
 */
export const getCustomerDetail = async (userId) => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/detail/' + userId);
    const response = await apiClient.get(`/admin/users/detail/${userId}`);
    console.log('✅ [adminService] Customer detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching customer detail:', error);
    throw error;
  }
};

/**
 * Get customer statistics
 * Backend endpoint: GET /api/admin/users/customers/stats
 * Returns: ResponseDTO<CustomerStatsDTO>
 */
export const getCustomerStats = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/customers/stats');
    const response = await apiClient.get('/admin/users/customers/stats');
    console.log('✅ [adminService] Customer stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching customer stats:', error);
    throw error;
  }
};

export { apiClient };

export default {
  getCustomers,
  getCustomerDetail,
  getCustomerStats,
};
