import api from './api';

/**
 * User Service
 * API calls for user-related operations
 */

// Lấy thông tin user hiện tại từ token
export const getCurrentUser = async () => {
  const response = await api.get('/user/me');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await api.post('/authenticate', loginData);
  return response.data;
};

/**
 * Get user's saved addresses
 * UPDATED: API path changed from me/addresses to addresses per spec 006-profile
 * UPDATED: Added excludeTypes and types query params for filtering (e.g., exclude STORE for buyer view)
 * @param {Object} options - Optional filtering options
 * @param {Array<string>} options.excludeTypes - Array of type names to exclude (e.g., ['STORE'])
 * @param {Array<string>} options.types - Array of type names to include (e.g., ['HOME', 'SHIPPING'])
 */
export const getAddresses = async (options = {}) => {
  const params = {};
  if (options.excludeTypes && options.excludeTypes.length > 0) {
    params.excludeTypes = options.excludeTypes;
  }
  if (options.types && options.types.length > 0) {
    params.types = options.types;
  }
  const responseDTO = await api.get('addresses', { params });
  // Interceptor returns response.data which is ResponseDTO { status, message, data }
  return responseDTO;
};

/**
 * Get single address by ID
 * NEW: Added per spec 006-profile
 */
export const getAddress = async (addressId) => {
  const responseDTO = await api.get(`addresses/${addressId}`);
  return responseDTO;
};

/**
 * Create new address
 * UPDATED: API path changed from me/addresses to addresses per spec 006-profile
 */
export const createAddress = async (addressData) => {
  const responseDTO = await api.post('addresses', addressData);
  // Interceptor returns response.data which is ResponseDTO { status, message, data }
  return responseDTO;
};

/**
 * Update address
 * UPDATED: API path changed from me/addresses to addresses per spec 006-profile
 */
export const updateAddress = async (addressId, addressData) => {
  const responseDTO = await api.put(`addresses/${addressId}`, addressData);
  return responseDTO;
};

/**
 * Delete address
 * UPDATED: API path changed from me/addresses to addresses per spec 006-profile
 */
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`addresses/${addressId}`);
  // Đảm bảo luôn trả về object có status và message
  if (response && response.data) {
    return response.data;
  } else {
    // Nếu không có response.data, trả về status 200 để FE không báo lỗi sai
    return { status: 200, message: 'Xóa địa chỉ thành công', data: null };
  }
};

/**
 * Set address as primary
 * UPDATED: API path changed from me/addresses/{id}/primary to addresses/{id}/set-primary per spec 006-profile
 */
export const setAsPrimary = async (addressId) => {
  const response = await api.put(`addresses/${addressId}/set-primary`);
  return response.data;
};

/**
 * Get auto-fill contact info (contactName, contactPhone from user profile)
 * NEW: Added per spec 006-profile
 */
export const getAutoFillContactInfo = async () => {
  const responseDTO = await api.get('addresses/auto-fill');
  return responseDTO;
};

/**
 * Get full user profile with all fields including metadata
 */
export const getProfile = async () => {
  const response = await api.get('/user/profile');
  return response;
};

/**
 * Update user profile information
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/user/profile', profileData);
  return response;
};

/**
 * Change user password
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/user/change-password', passwordData);
  return response;
};

/**
 * Update user avatar URL
 */
export const updateAvatar = async (avatarUrl) => {
  const response = await api.put(`/user/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}`);
  return response;
};

/**
 * GHN Location APIs
 * UPDATED: Use backend /api/locations/* proxy endpoints with caching (24h TTL)
 * Note: api interceptor already returns response.data, so we get data directly
 */
export const getProvinces = async () => {
  const data = await api.get('locations/provinces');
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/**
 * Get list of districts for a province from GHN
 * UPDATED: Use backend /api/locations/districts/{provinceId} proxy endpoint
 * @param {number} provinceId - Province ID from GHN
 */
export const getDistricts = async (provinceId) => {
  const data = await api.get(`locations/districts/${provinceId}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/**
 * Get list of wards for a district from GHN
 * UPDATED: Use backend /api/locations/wards/{districtId} proxy endpoint
 * @param {number} districtId - District ID from GHN
 */
export const getWards = async (districtId) => {
  const data = await api.get(`locations/wards/${districtId}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/**
 * Resolve province/district/ward names to IDs
 * @param {Object} addressData - { province, district, ward }
 */
export const resolveAddress = async (addressData) => {
  const data = await api.post('ghn/master/resolve', addressData);
  return data;
};

// Default export for convenience
const userService = {
  getCurrentUser,
  registerUser,
  loginUser,
  // Address APIs (updated paths per spec 006-profile)
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setAsPrimary,
  getAutoFillContactInfo,
  // Profile APIs
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  // GHN Location APIs (backend proxy)
  getProvinces,
  getDistricts,
  getWards,
  resolveAddress
};

export default userService;

// export const loginWithGoogle = async (idToken) => {
//   const response = await axios.post(`${API_URL}/authenticate/google`, {
//     idToken,
//   });
//   localStorage.setItem("token", response.data.data.token);
//   return response.data;
// };