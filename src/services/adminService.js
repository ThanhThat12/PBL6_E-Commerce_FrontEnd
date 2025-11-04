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
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// ============ USER MANAGEMENT APIs ============

/**
 * Get all customers (users with role BUYER)
 */
export const getCustomers = async () => {
  try {
    const response = await apiClient.get('/admin/users/customers');
    return response.data; // Returns ResponseDTO<List<UserInfoDTO>>
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get customer detail by ID
 */
export const getCustomerDetail = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/detail/${userId}`);
    return response.data; // Returns ResponseDTO<AdminUserDetailDTO>
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    throw error;
  }
};

/**
 * Get all sellers (users with role SELLER)
 */
export const getSellers = async () => {
  try {
    const response = await apiClient.get('/admin/users/sellers');
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    throw error;
  }
};

/**
 * Get seller detail by ID
 */
export const getSellerDetail = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/detail/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller detail:', error);
    throw error;
  }
};

/**
 * Get all admins (users with role ADMIN)
 */
export const getAdmins = async () => {
  try {
    const response = await apiClient.get('/admin/users/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (userId, activated) => {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { activated });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ============ ADMIN LOGIN API ============

/**
 * Admin login
 */
export const loginAdmin = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default {
  getCustomers,
  getCustomerDetail,
  getSellers,
  getSellerDetail,
  getAdmins,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  loginAdmin,
};
