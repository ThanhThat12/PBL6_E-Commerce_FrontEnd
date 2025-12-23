import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { 
  saveAuthData, 
  clearAuthData, 
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  saveUserInfo
} from '../utils/storage';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// ==================== LOGIN ====================

/**
 * Login with username/email and password
 * @param {object} credentials - { username, password, rememberMe }
 * @returns {Promise<object>} { status, message, data: { token, refreshToken, user } }
 */
export const login = async ({ username, password, rememberMe = false }) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
    
    // Backend returns: { status: 200, data: { token, refreshToken, user } }
    if (response.data) {
      const { token, refreshToken, user } = response.data;
      
      // Check if user is ADMIN
      if (user && user.role === 'ADMIN') {
        // Save to both standard keys AND admin-specific keys
        // Standard keys are needed for api.js to work
        saveAuthData({ token, refreshToken, user }, rememberMe);
        // Also save admin-specific keys for backwards compatibility
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRefreshToken', refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(user));
        console.log('[authService] ADMIN user logged in, saved to both standard and admin keys');
      } else {
        // Save auth data normally for regular users
        saveAuthData({ token, refreshToken, user }, rememberMe);
      }
      
      return { 
        status: 'success', 
        message: response.message || 'Đăng nhập thành công',
        data: { token, refreshToken, user } 
      };
    }
    
    return { 
      status: 'error', 
      message: response.message || 'Đăng nhập thất bại' 
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login with Google OAuth
 * @param {string} idToken - Google ID token from OAuth response
 * @returns {Promise<object>}
 */
export const loginWithGoogle = async (idToken) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_GOOGLE, {
      idToken,
    });

    console.log('[loginWithGoogle] Response:', response);

    // Backend returns ResponseDTO structure:
    // { status: 200 (int), error: null, message: "...", data: { token, refreshToken } }
    const isSuccessStatus =
      response &&
      (response.status === 200 ||
        response.statusCode === 200);

    // Note: Backend thường không trả user object trực tiếp, cần fetch riêng
    if (isSuccessStatus && response.data) {
      const { token, refreshToken } = response.data;
      
      // Save tokens first (without user info)
      if (token) saveAccessToken(token, true);
      if (refreshToken) saveRefreshToken(refreshToken, true);

      // Fetch user info using the new token
      try {
        const userResponse = await api.get(API_ENDPOINTS.PROFILE.ME);
        console.log('[loginWithGoogle] User info:', userResponse);

        // userResponse is ResponseDTO<UserInfoDTO>
        // Backend returns: { status: 200 (int), error: null, message: "...", data: UserInfoDTO }
        const isUserSuccess =
          userResponse &&
          (userResponse.status === 200 ||
            userResponse.statusCode === 200);

        if (isUserSuccess && userResponse.data) {
          const user = userResponse.data;
          saveUserInfo(user);

          return {
            status: 'success',
            message: response.message || 'Đăng nhập Google thành công',
            data: { token, refreshToken, user },
          };
        }
      } catch (userError) {
        console.error('[loginWithGoogle] Failed to fetch user info:', userError);
        // Continue without user info - will be fetched in AuthContext
      }

      return {
        status: 'success',
        message: response.message || 'Đăng nhập Google thành công',
        data: { token, refreshToken, user: null },
      };
    }
    
    return {
      status: 'error',
      message: response.message || 'Đăng nhập Google thất bại',
    };
  } catch (error) {
    console.error('[loginWithGoogle] Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Login with Facebook OAuth
 * @param {string} accessToken - Facebook access token from OAuth response
 * @returns {Promise<object>}
 */
export const loginWithFacebook = async (accessToken) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN_FACEBOOK, {
      accessToken,
    });

    console.log('[loginWithFacebook] Response:', response);

    // Backend returns ResponseDTO structure:
    // { status: 200 (int), error: null, message: "...", data: { token, refreshToken } }
    const isSuccessStatus =
      response &&
      (response.status === 200 ||
        response.statusCode === 200);

    // Note: Backend không trả user object trực tiếp, cần fetch riêng
    if (isSuccessStatus && response.data) {
      const { token, refreshToken } = response.data;

      // Save tokens first (without user info)
      if (token) saveAccessToken(token, true);
      if (refreshToken) saveRefreshToken(refreshToken, true);

      // Fetch user info using the new token
      try {
        const userResponse = await api.get(API_ENDPOINTS.PROFILE.ME);
        console.log('[loginWithFacebook] User info:', userResponse);

        // userResponse is ResponseDTO<UserInfoDTO>
        // Backend returns: { status: 200 (int), error: null, message: "...", data: UserInfoDTO }
        const isUserSuccess =
          userResponse &&
          (userResponse.status === 200 ||
            userResponse.statusCode === 200);

        // userResponse is ResponseDTO<UserInfoDTO>
        if (isUserSuccess && userResponse.data) {
          const user = userResponse.data;
          saveUserInfo(user);

          return {
            status: 'success',
            message: response.message || 'Đăng nhập Facebook thành công',
            data: { token, refreshToken, user },
          };
        }
      } catch (userError) {
        console.error('[loginWithFacebook] Failed to fetch user info:', userError);
        // Continue without user info - will be fetched in AuthContext
      }

      return {
        status: 'success',
        message: response.message || 'Đăng nhập Facebook thành công',
        data: { token, refreshToken, user: null },
      };
    }

    return {
      status: 'error',
      message: response.message || 'Đăng nhập Facebook thất bại',
    };
  } catch (error) {
    console.error('[loginWithFacebook] Error:', error.response?.data || error.message);
    throw error;
  }
};

// ==================== LOGOUT ====================

/**
 * Logout current session
 * @returns {Promise<object>}
 */
export const logout = async () => {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    clearAuthData();
    return { status: 'success', message: 'Đăng xuất thành công' };
  } catch (error) {
    // Clear local data even if API call fails
    clearAuthData();
    throw error;
  }
};

/**
 * Logout all sessions
 * @returns {Promise<object>}
 */
export const logoutAll = async () => {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    clearAuthData();
    return { status: 'success', message: 'Đã đăng xuất tất cả thiết bị' };
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

// ==================== REGISTER ====================

/**
 * Step 1: Check if contact (email/phone) is available
 * @param {string} contact - Email or phone number
 * @returns {Promise<object>}
 */
export const checkContact = async (contact) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.CHECK_CONTACT, {
      contact,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 2: Resend OTP to contact
 * @param {string} contact
 * @returns {Promise<object>}
 */
export const resendOTP = async (contact) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.CHECK_CONTACT, {
      contact,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 3: Verify OTP code
 * @param {string} contact
 * @param {string} otp
 * @returns {Promise<object>}
 */
export const verifyOTP = async (contact, otp) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.VERIFY_OTP, {
      contact,
      otp,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 4: Complete registration
 * @param {object} data - { username, password, confirmPassword, contact }
 * @returns {Promise<object>}
 */
export const completeRegistration = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.REGISTER, data);
    
    console.log('🔍 [authService] completeRegistration RAW response:', response);
    console.log('🔍 [authService] response.status:', response.status, typeof response.status);
    console.log('🔍 [authService] response.data:', response.data);
    
    // Backend returns: { status: 200, message: 'Success', data: 'Đăng ký thành công' }
    // No JWT token is returned, need to login separately
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== FORGOT PASSWORD ====================

/**
 * Step 1: Send OTP to email/phone for password reset
 * @param {string} contact
 * @returns {Promise<object>}
 */
export const sendForgotPasswordOTP = async (contact) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_OTP, {
      contact,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 2: Verify OTP for password reset
 * @param {string} contact
 * @param {string} otp
 * @returns {Promise<object>}
 */
export const verifyForgotPasswordOTP = async (contact, otp) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.VERIFY_OTP, {
      contact,
      otp,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 3: Reset password with new password
 * @param {object} data - { contact, otp, newPassword, confirmNewPassword }
 * @returns {Promise<object>}
 */
export const resetPassword = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== TOKEN REFRESH ====================

/**
 * Refresh access token
 * @returns {Promise<object>}
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });
    
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== USER INFO ====================

/**
 * Get current user info
 * @returns {Promise<object>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.PROFILE.ME);
    console.log('[getCurrentUser] Response:', response);
    
    // Response is ResponseDTO<UserInfoDTO> structure:
    // { status: 200 (int), error: null, message: "...", data: UserInfoDTO }
    if ((response.status === 200 || response.statusCode === 200) && response.data) {
      console.log('[getCurrentUser] User data:', response.data);
      return response.data;  // Returns UserInfoDTO with id, email, username, role
    }
    
    console.warn('[getCurrentUser] Invalid response structure:', response);
    return null;
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    throw error;
  }
};

// ==================== VALIDATION HELPERS ====================

/**
 * Check if username is available
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await api.get(`/api/auth/check-username/${username}`);
    return response.data?.available || false;
  } catch (error) {
    return false;
  }
};

/**
 * Check if email is available
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const checkEmailAvailability = async (email) => {
  try {
    const response = await api.get(`/api/auth/check-email/${email}`);
    return response.data?.available || false;
  } catch (error) {
    return false;
  }
};
