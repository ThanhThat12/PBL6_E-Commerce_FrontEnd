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

// ============ Customer APIs ============

/**
 * Get all customers (role = BUYER) - NO PAGINATION
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
 * Get customers with pagination
 * Backend endpoint: GET /api/admin/users/customers/page?page=0&size=10
 * Returns: ResponseDTO<Page<ListCustomerUserDTO>>
 */
export const getCustomersPage = async (page = 0, size = 10) => {
  try {
    console.log(`📡 [adminService] Calling GET /admin/users/customers/page?page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/users/customers/page?page=${page}&size=${size}`);
    console.log('✅ [adminService] Customers page response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching customers page:', error);
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
 * Get customers by status with pagination
 * Backend endpoint: GET /api/admin/users/customers/status?status=ACTIVE&page=0&size=10
 * @param {string} status - 'ACTIVE', 'INACTIVE', or 'ALL'
 * @param {number} page - Page number (starts from 0)
 * @param {number} size - Page size (default 10)
 * Returns: ResponseDTO<Page<ListCustomerUserDTO>>
 */
export const getCustomersByStatus = async (status = 'ALL', page = 0, size = 10) => {
  try {
    console.log(`📡 [adminService] Calling GET /admin/users/customers/status?status=${status}&page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/users/customers/status?status=${status}&page=${page}&size=${size}`);
    console.log('✅ [adminService] Customers by status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching customers by status:', error);
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

/**
 * Get sellers from shop table with pagination
 * Backend endpoint: GET /api/admin/users/seller?page=0&size=10
 * Returns: ResponseDTO<Page<ListSellerUserDTO>>
 */
export const getSellersFromShop = async (page = 0, size = 10) => {
  try {
    console.log(`📡 [adminService] Calling GET /admin/users/seller?page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/users/seller?page=${page}&size=${size}`);
    console.log('✅ [adminService] Sellers from shop response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching sellers from shop:', error);
    throw error;
  }
};

/**
 * Get all sellers (role = SELLER) - NO PAGINATION
 * Backend endpoint: GET /api/admin/users/sellers
 * Returns: ResponseDTO<List<ListSellerUserDTO>>
 */
export const getSellers = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/sellers');
    const response = await apiClient.get('/admin/users/sellers');
    console.log('✅ [adminService] Sellers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching sellers:', error);
    throw error;
  }
};

/**
 * Get sellers with pagination
 * Backend endpoint: GET /api/admin/users/sellers/page?page=0&size=10
 * Returns: ResponseDTO<Page<ListSellerUserDTO>>
 */
export const getSellersPage = async (page = 0, size = 10) => {
  try {
    console.log(`📡 [adminService] Calling GET /admin/users/sellers/page?page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/users/sellers/page?page=${page}&size=${size}`);
    console.log('✅ [adminService] Sellers page response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching sellers page:', error);
    throw error;
  }
};

/**
 * Get seller detail by ID
 * Backend endpoint: GET /api/admin/users/detail/{userId}
 * Returns: ResponseDTO<AdminUserDetailDTO>
 */
export const getSellerDetail = async (userId) => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/detail/' + userId);
    const response = await apiClient.get(`/admin/users/detail/${userId}`);
    console.log('✅ [adminService] Seller detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching seller detail:', error);
    throw error;
  }
};

/**
 * Get seller statistics
 * Backend endpoint: GET /api/admin/users/sellers/stats
 * Returns: ResponseDTO<SellerStatsDTO>
 */
export const getSellerStats = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/sellers/stats');
    const response = await apiClient.get('/admin/users/sellers/stats');
    console.log('✅ [adminService] Seller stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching seller stats:', error);
    throw error;
  }
};

/**
 * Get sellers by status filter
 * Backend endpoint: GET /api/admin/users/sellers?status={status}
 * Returns: ResponseDTO<List<ListSellerUserDTO>>
 * @param {string} status - VERIFIED, PENDING, SUSPENDED, or null for all
 */
export const getSellersByStatus = async (status) => {
  try {
    const url = status ? `/admin/users/sellers?status=${status}` : '/admin/users/sellers';
    console.log('📡 [adminService] Calling GET ' + url);
    const response = await apiClient.get(url);
    console.log('✅ [adminService] Sellers by status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching sellers by status:', error);
    throw error;
  }
};

/**
 * Get sellers by status filter with pagination
 * Backend endpoint: GET /api/admin/users/sellers/status?status={status}&page={page}&size={size}
 * Returns: ResponseDTO<Page<ListSellerUserDTO>>
 * @param {string} status - ACTIVE, PENDING, INACTIVE, ALL or null for all
 * @param {number} page - Page number (default 0)
 * @param {number} size - Page size (default 10)
 */
export const getSellersPageByStatus = async (status = 'ALL', page = 0, size = 10) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (status && status !== 'ALL' && status !== 'All') {
      params.append('status', status.toUpperCase());
    } else {
      params.append('status', 'ALL');
    }
    
    const url = `/admin/users/sellers/status?${params.toString()}`;
    console.log('📡 [adminService] Calling GET ' + url);
    const response = await apiClient.get(url);
    console.log('✅ [adminService] Sellers page by status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching sellers page by status:', error);
    throw error;
  }
};

// ============ Admin APIs ============

/**
 * Get all admins (role = ADMIN) - NO PAGINATION
 * Backend endpoint: GET /api/admin/users/admin
 * Returns: ResponseDTO<List<ListAdminUserDTO>>
 */
 export const getAdmins = async () => {
   try {
    console.log('📡 [adminService] Calling GET /admin/users/admin');
     const response = await apiClient.get('/admin/users/admin');
     console.log('✅ [adminService] Admins response:', response.data);
    return response.data;
   } catch (error) {
     console.error('❌ [adminService] Error fetching admins:', error);
     throw error;
   }
 };

/**
 * Get admins with pagination
 * Backend endpoint: GET /api/admin/users/admin/page?page=0&size=10
 * Returns: ResponseDTO<Page<ListAdminUserDTO>>
 */
export const getAdminsPage = async (page = 0, size = 10) => {
  try {
    console.log(`📡 [adminService] Calling GET /admin/users/admin/page?page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/users/admin/page?page=${page}&size=${size}`);
    console.log('✅ [adminService] Admins page response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching admins page:', error);
    throw error;
  }
};

/**
 * Get admin detail by ID
 * Backend endpoint: GET /api/admin/users/detail/{userId}
 * Returns: ResponseDTO<AdminUserDetailDTO>
 */
export const getAdminDetail = async (userId) => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/detail/' + userId);
    const response = await apiClient.get(`/admin/users/detail/${userId}`);
    console.log('✅ [adminService] Admin detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching admin detail:', error);
    throw error;
  }
};

/**
 * Get admin statistics
 * Backend endpoint: GET /api/admin/users/admin/stats
 * Returns: ResponseDTO<AdminStatsDTO>
 */
export const getAdminStats = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/users/admin/stats');
    const response = await apiClient.get('/admin/users/admin/stats');
    console.log('✅ [adminService] Admin stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Create a new admin account
 * Backend endpoint: POST /api/admin/create-admin
 * Request Body: { username, password, email, phoneNumber }
 * Returns: ResponseDTO<String>
 */
export const createAdmin = async (adminData) => {
  try {
    console.log('📝 [adminService] Calling POST /admin/create-admin');
    console.log('📝 [adminService] Admin data:', { ...adminData, password: '***' });
    const response = await apiClient.post('/admin/create-admin', adminData);
    console.log('✅ [adminService] Create admin response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error creating admin:', error);
    
    // Enhanced error handling
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to create admin account. Please try again.');
    }
  }
};

// ============ Delete User API ============

/**
 * Delete user by ID (works for ADMIN, SELLER, BUYER)
 * Backend endpoint: DELETE /api/admin/users/{userId}
 * Returns: ResponseDTO<String>
 * 
 * Validation:
 * - Admin cannot delete themselves
 * - Cannot delete the last admin in the system
 * 
 * Deletion behavior by role:
 * - ADMIN (role = 0): Deletes user account and addresses
 * - BUYER (role = 2): Deletes user account, cart, cart items, and addresses
 * - SELLER (role = 1): Deletes user account, shop, products, vouchers, and addresses
 */
export const deleteUser = async (userId) => {
  try {
    console.log('🗑️ [adminService] Calling DELETE /admin/users/' + userId);
    const response = await apiClient.delete(`/admin/users/${userId}`);
    console.log('✅ [adminService] Delete user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error deleting user:', error);
    
    // Enhanced error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this user');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else {
      throw new Error('Failed to delete user. Please try again.');
    }
  }
};

/**
 * Admin reset password for user by ID
 * Backend endpoint: POST /api/forgot-password/admin/users/{userId}/reset-password
 * 
 * Default passwords by role:
 * - BUYER: Customer123@
 * - SELLER: Seller123@
 * - ADMIN: Admin123@
 * 
 * @param {number} userId - ID of user to reset password
 * @returns {Promise<Object>} Response with success message and new password
 */
export const resetUserPassword = async (userId) => {
  try {
    console.log('🔑 [adminService] Calling POST /forgot-password/admin/users/' + userId + '/reset-password');
    const response = await apiClient.post(`/forgot-password/admin/users/${userId}/reset-password`);
    console.log('✅ [adminService] Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error resetting password:', error);
    
    // Enhanced error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to reset passwords');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else {
      throw new Error('Failed to reset password. Please try again.');
    }
  }
};

/**
 * Admin update user information (for BUYER and ADMIN roles only)
 * Backend endpoint: PATCH /api/admin/users/{userId}/update
 * 
 * Request Body:
 * {
 *   "username": "newUsername",
 *   "email": "newemail@example.com",
 *   "phone": "0123456789",
 *   "activated": true
 * }
 * 
 * @param {number} userId - ID of user to update
 * @param {Object} updateData - Object containing fields to update
 * @returns {Promise<Object>} Response with updated user info
 */
export const updateUser = async (userId, updateData) => {
  try {
    console.log('📝 [adminService] Calling PATCH /admin/users/' + userId + '/update');
    console.log('📝 [adminService] Update data:', updateData);
    const response = await apiClient.patch(`/admin/users/${userId}/update`, updateData);
    console.log('✅ [adminService] Update user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error updating user:', error);
    
    // Enhanced error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this user');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid data provided');
    } else {
      throw new Error('Failed to update user. Please try again.');
    }
  }
};

/**
 * Admin update seller information (shop and user profile)
 * Backend endpoint: PATCH /api/admin/seller/{userId}/update
 * 
 * Request Body:
 * {
 *   "username": "newUsername",
 *   "email": "newseller@gmail.com",
 *   "phone": "0901234567",
 *   "fullName": "Nguyen Van A",
 *   "shopStatus": "ACTIVE",
 *   "shopName": "Shop ABC",
 *   "shopDescription": "Description"
 * }
 * 
 * @param {number} userId - ID of seller to update
 * @param {Object} updateData - Object containing fields to update
 * @returns {Promise<Object>} Response with updated seller info
 */
export const updateSeller = async (userId, updateData) => {
  try {
    console.log('📝 [adminService] Calling PATCH /admin/seller/' + userId + '/update');
    console.log('📝 [adminService] Update data:', updateData);
    const response = await apiClient.patch(`/admin/seller/${userId}/update`, updateData);
    console.log('✅ [adminService] Update seller response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error updating seller:', error);
    
    // Enhanced error handling
    if (error.response?.data?.error) {
      // Handle specific error codes
      const errorCode = error.response.data.error;
      const errorMessage = error.response.data.message;
      
      if (errorCode === 'DUPLICATE_EMAIL') {
        throw new Error('Email already exists');
      } else if (errorCode === 'DUPLICATE_PHONE') {
        throw new Error('Phone number already exists');
      } else if (errorCode === 'DUPLICATE_USERNAME') {
        throw new Error('Username already exists');
      } else {
        throw new Error(errorMessage || 'Failed to update seller');
      }
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this seller');
    } else if (error.response?.status === 404) {
      throw new Error('Seller not found');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid data provided');
    } else {
      throw new Error('Failed to update seller. Please try again.');
    }
  }
};

// ============ Category APIs ============

/**
 * Get all categories with statistics for admin
 * Backend endpoint: GET /api/categories/admin/categories
 * Returns: ResponseDTO<List<AdminCategoryDTO>>
 */
export const getAdminCategories = async () => {
  try {
    console.log('📡 [adminService] Calling GET /categories/admin/categories');
    const response = await apiClient.get('/categories/admin/categories');
    console.log('✅ [adminService] Admin categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching admin categories:', error);
    throw error;
  }
};

/**
 * Get category statistics for admin dashboard
 * Backend endpoint: GET /api/categories/admin/stats
 * Returns: ResponseDTO<AdminCategoryStatsDTO>
 */
export const getCategoryStats = async () => {
  try {
    console.log('📡 [adminService] Calling GET /categories/admin/stats');
    const response = await apiClient.get('/categories/admin/stats');
    console.log('✅ [adminService] Category stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching category stats:', error);
    throw error;
  }
};

/**
 * Create a new category
 * Backend endpoint: POST /api/categories
 * Request Body: { "name": "string" }
 * Returns: ResponseDTO<CategoryDTO>
 */
export const createCategory = async (categoryData) => {
  try {
    console.log('📝 [adminService] Calling POST /categories');
    console.log('📝 [adminService] Category data:', categoryData);
    const response = await apiClient.post('/categories', categoryData);
    console.log('✅ [adminService] Create category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error creating category:', error);
    throw error;
  }
};

/**
 * Update category by ID
 * Backend endpoint: PUT /api/categories/{id}
 * Request Body: { "name": "string" }
 * Returns: ResponseDTO<CategoryDTO>
 */
export const updateCategory = async (id, categoryData) => {
  try {
    console.log('📝 [adminService] Calling PUT /categories/' + id);
    console.log('📝 [adminService] Update data:', categoryData);
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    console.log('✅ [adminService] Update category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error updating category:', error);
    throw error;
  }
};

/**
 * Delete category by ID
 * Backend endpoint: DELETE /api/categories/{id}
 * Returns: ResponseDTO<String>
 */
export const deleteCategory = async (id) => {
  try {
    console.log('🗑️ [adminService] Calling DELETE /categories/' + id);
    const response = await apiClient.delete(`/categories/${id}`);
    console.log('✅ [adminService] Delete category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error deleting category:', error);
    throw error;
  }
};

export { apiClient };

const adminService = {
  
  getCustomers,
  getCustomersPage,
  getCustomersByStatus,
  getCustomerDetail,
  getCustomerStats,

  getSellers,
  getSellersPage,
  getSellersFromShop,
  getSellerDetail,
  getSellerStats,
  getSellersByStatus,
  getSellersPageByStatus,

  getAdmins,
  getAdminsPage,
  getAdminDetail,
  getAdminStats,
  createAdmin,

  deleteUser,
  resetUserPassword,
  updateUser,
  updateSeller,

  getAdminCategories,
  getCategoryStats,

  createCategory,
  updateCategory,
  deleteCategory,

};

export default adminService;

// ============ Admin Profile APIs ============

/**
 * Get admin's own profile
 * Backend endpoint: GET /api/admin/myprofile
 * Returns: ResponseDTO<AdminMyProfileDTO>
 */
export const getAdminMyProfile = async () => {
  try {
    console.log('📡 [adminService] Calling GET /admin/myprofile');
    const response = await apiClient.get('/admin/myprofile');
    console.log('✅ [adminService] Admin profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error fetching admin profile:', error);
    throw error;
  }
};

/**
 * Update admin's own profile (excluding avatar)
 * Backend endpoint: PATCH /api/admin/myprofile/update
 * Request Body: { username, fullName, email, phoneNumber }
 * Returns: ResponseDTO<AdminMyProfileDTO>
 */
export const updateAdminMyProfile = async (profileData) => {
  try {
    console.log('📝 [adminService] Calling PATCH /admin/myprofile/update');
    console.log('📝 [adminService] Profile data:', profileData);
    const response = await apiClient.patch('/admin/myprofile/update', profileData);
    console.log('✅ [adminService] Update profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error updating profile:', error);
    
    if (error.response?.data?.error) {
      const errorCode = error.response.data.error;
      if (errorCode === 'DUPLICATE_EMAIL') {
        throw new Error('Email already exists');
      } else if (errorCode === 'DUPLICATE_PHONE') {
        throw new Error('Phone number already exists');
      } else if (errorCode === 'DUPLICATE_USERNAME') {
        throw new Error('Username already exists');
      }
    }
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Change admin's password
 * Backend endpoint: POST /api/admin/myprofile/change-password
 * Request Body: { oldPassword, newPassword, confirmPassword }
 * Returns: ResponseDTO<String>
 */
export const changeAdminPassword = async (passwordData) => {
  try {
    console.log('🔑 [adminService] Calling POST /admin/myprofile/change-password');
    const response = await apiClient.post('/admin/myprofile/change-password', passwordData);
    console.log('✅ [adminService] Change password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error changing password:', error);
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

/**
 * Update admin's avatar
 * Backend endpoint: POST /api/admin/myprofile/avatar
 * Query Param: avatarUrl
 * Returns: ResponseDTO<AdminMyProfileDTO>
 */
export const updateAdminAvatar = async (avatarUrl) => {
  try {
    console.log('📷 [adminService] Calling POST /admin/myprofile/avatar');
    const response = await apiClient.post('/admin/myprofile/avatar', null, {
      params: { avatarUrl }
    });
    console.log('✅ [adminService] Update avatar response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminService] Error updating avatar:', error);
    throw new Error(error.response?.data?.message || 'Failed to update avatar');
  }
};
