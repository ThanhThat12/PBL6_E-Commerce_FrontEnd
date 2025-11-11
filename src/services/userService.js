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
 */
export const getAddresses = async () => {
  console.log('getAddresses: Calling me/addresses');
  const responseDTO = await api.get('me/addresses');
  console.log('getAddresses responseDTO:', responseDTO);
  // Interceptor returns response.data which is ResponseDTO { status, message, data }
  return responseDTO;
};

/**
 * Create new address
 */
export const createAddress = async (addressData) => {
  console.log('createAddress: Sending data:', addressData);
  const responseDTO = await api.post('me/addresses', addressData);
  console.log('createAddress responseDTO:', responseDTO);
  // Interceptor returns response.data which is ResponseDTO { status, message, data }
  return responseDTO;
};

/**
 * Update address
 */
export const updateAddress = async (addressId, addressData) => {
  console.log('updateAddress: Sending data:', addressData);
  const responseDTO = await api.put(`me/addresses/${addressId}`, addressData);
  console.log('updateAddress responseDTO:', responseDTO);
  return responseDTO;
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`me/addresses/${addressId}`);
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
 */
export const setAsPrimary = async (addressId) => {
  const response = await api.post(`me/addresses/${addressId}/primary`);
  return response.data;
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
 * GHN Master Data APIs
 * Get list of provinces from GHN
 * Note: api interceptor already returns response.data, so we get data directly
 */
export const getProvinces = async () => {
  const data = await api.get('ghn/master/provinces');
  console.log('getProvinces data:', data);
  return Array.isArray(data) ? data : [];
};

/**
 * Get list of districts for a province from GHN
 * @param {number} provinceId - Province ID from GHN
 */
export const getDistricts = async (provinceId) => {
  const data = await api.get(`ghn/master/districts?province_id=${provinceId}`);
  console.log('getDistricts data:', data);
  return Array.isArray(data) ? data : [];
};

/**
 * Get list of wards for a district from GHN
 * @param {number} districtId - District ID from GHN
 */
export const getWards = async (districtId) => {
  const data = await api.get(`ghn/master/wards?district_id=${districtId}`);
  console.log('getWards data:', data);
  return Array.isArray(data) ? data : [];
};

/**
 * Resolve province/district/ward names to IDs
 * @param {Object} addressData - { province, district, ward }
 */
export const resolveAddress = async (addressData) => {
  const data = await api.post('ghn/master/resolve', addressData);
  console.log('resolveAddress data:', data);
  return data;
};

// Default export for convenience
const userService = {
  getCurrentUser,
  registerUser,
  loginUser,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setAsPrimary,
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  // GHN APIs
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