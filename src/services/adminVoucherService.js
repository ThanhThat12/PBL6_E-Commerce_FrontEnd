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

// ============ Voucher APIs ============

/**
 * Get voucher statistics
 * Backend endpoint: GET /api/admin/vouchers/stats
 * Returns: ResponseDTO<AdminVoucherStatsDTO>
 */
export const getVoucherStats = async () => {
  try {
    console.log('📊 [adminVoucherService] Calling GET /admin/vouchers/stats');
    const response = await apiClient.get('/admin/vouchers/stats');
    console.log('✅ [adminVoucherService] Voucher stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error fetching voucher stats:', error);
    throw error;
  }
};

/**
 * Get vouchers with pagination
 * Backend endpoint: GET /api/admin/vouchers?page=0&size=10
 * Returns: ResponseDTO<Page<AdminVoucherListDTO>>
 */
export const getVouchers = async (page = 0, size = 10) => {
  try {
    console.log(`📡 [adminVoucherService] Calling GET /admin/vouchers?page=${page}&size=${size}`);
    const response = await apiClient.get(`/admin/vouchers?page=${page}&size=${size}`);
    console.log('✅ [adminVoucherService] Vouchers response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error fetching vouchers:', error);
    throw error;
  }
};

/**
 * Get voucher detail by ID
 * Backend endpoint: GET /api/admin/vouchers/{id}
 * Returns: ResponseDTO<AdminVoucherDetailDTO>
 */
export const getVoucherDetail = async (voucherId) => {
  try {
    console.log('📡 [adminVoucherService] Calling GET /admin/vouchers/' + voucherId);
    const response = await apiClient.get(`/admin/vouchers/${voucherId}`);
    console.log('✅ [adminVoucherService] Voucher detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error fetching voucher detail:', error);
    throw error;
  }
};

/**
 * Search voucher by code to get its ID
 * This is a workaround since list API doesn't return ID
 * Backend endpoint: GET /api/admin/vouchers/search?code={code}
 * Returns: ResponseDTO<AdminVoucherDetailDTO>
 */
export const searchVoucherByCode = async (code) => {
  try {
    console.log('🔍 [adminVoucherService] Searching voucher by code:', code);
    // For now, we'll need to fetch all vouchers and find by code
    // In production, backend should provide a search endpoint
    const response = await apiClient.get(`/admin/vouchers?page=0&size=1000`);
    
    if (response.data.status === 200 && response.data.data.content) {
      const vouchers = response.data.data.content;
      const found = vouchers.find(v => v.code === code);
      
      if (found && found.id) {
        // Now fetch the detail
        return await getVoucherDetail(found.id);
      }
    }
    
    throw new Error('Voucher not found');
  } catch (error) {
    console.error('❌ [adminVoucherService] Error searching voucher:', error);
    throw error;
  }
};

/**
 * Create new voucher
 * Backend endpoint: POST /api/admin/vouchers
 * Request Body: AdminVoucherCreateDTO
 * Returns: ResponseDTO<AdminVoucherDetailDTO>
 */
export const createVoucher = async (voucherData) => {
  try {
    console.log('📝 [adminVoucherService] Calling POST /admin/vouchers');
    console.log('📝 [adminVoucherService] Voucher data:', voucherData);
    
    const response = await apiClient.post('/admin/vouchers', voucherData);
    console.log('✅ [adminVoucherService] Create voucher response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error creating voucher:', error);
    
    // Enhanced error handling
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to create voucher. Please try again.');
    }
  }
};

/**
 * Update voucher
 * Backend endpoint: PUT /api/admin/vouchers/{id}
 * Request Body: AdminVoucherUpdateDTO
 * Returns: ResponseDTO<AdminVoucherDetailDTO>
 */
export const updateVoucher = async (id, voucherData) => {
  try {
    console.log('📝 [adminVoucherService] Calling PUT /admin/vouchers/' + id);
    console.log('📝 [adminVoucherService] Update data:', voucherData);
    
    const response = await apiClient.put(`/admin/vouchers/${id}`, voucherData);
    console.log('✅ [adminVoucherService] Update voucher response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error updating voucher:', error);
    
    // Enhanced error handling
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to update voucher. Please try again.');
    }
  }
};

/**
 * Delete voucher
 * Backend endpoint: DELETE /api/admin/voucher/{id}
 * Returns: ResponseDTO<String>
 */
export const deleteVoucher = async (id) => {
  try {
    console.log('🗑️ [adminVoucherService] Calling DELETE /admin/voucher/' + id );
    const response = await apiClient.delete(`/admin/voucher/${id}`);
    console.log('✅ [adminVoucherService] Delete voucher response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error deleting voucher:', error);
    
    // Enhanced error handling
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to delete voucher. Please try again.');
    }
  }
};

/**
 * Get vouchers filtered by status with pagination
 * Backend endpoint: GET /api/admin/vouchers/status?status=ACTIVE&page=0&size=10
 * Returns: ResponseDTO<Page<AdminVoucherListDTO>>
 */
export const getVouchersByStatus = async (status, page = 0, size = 10) => {
  try {
    console.log(`📡 [adminVoucherService] Calling GET /admin/vouchers/status?status=${status}&page=${page}&size=${size}`);
    const response = await apiClient.get('/admin/vouchers/status', {
      params: { status, page, size }
    });
    console.log('✅ [adminVoucherService] Vouchers by status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [adminVoucherService] Error fetching vouchers by status:', error);
    throw error;
  }
};

const adminVoucherService = {
  getVoucherStats,
  getVouchers,
  getVoucherDetail,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVouchersByStatus,
};

export default adminVoucherService;
