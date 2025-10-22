import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { saveAuthData, clearAuthData, getRefreshToken } from '../utils/storage';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// ==================== LOGIN ====================

/**
 * Login with username/email and password
 * @param {object} credentials - { username, password, rememberMe }
 * @returns {Promise<object>} { status, message, data: { accessToken, refreshToken, user } }
 */
export const login = async ({ username, password, rememberMe = false }) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
    
    // Backend trả về: { status: 200, data: { accessToken, refreshToken, user, ... } }
    if (response.data) {
      const { accessToken, refreshToken, user } = response.data;
      
      // Lưu toàn bộ auth data
      saveAuthData({ accessToken, refreshToken, user }, rememberMe);
      
      return { 
        status: 'success', 
        message: response.message || 'Đăng nhập thành công',
        data: { accessToken, refreshToken, user } 
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
    
    // Backend returns: { status: 200, data: { accessToken, refreshToken, expiresIn, userInfo }, message }
    // Check for status 200 or status 'success'
    if ((response.status === 200 || response.status === 'success') && response.data) {
      const { accessToken, refreshToken, userInfo, user } = response.data;
      const userData = user || userInfo;
      
      // Save auth data - Google login always remembers
      saveAuthData({ accessToken, refreshToken, user: userData }, true);
      
      return {
        status: 'success',
        message: response.message || 'Đăng nhập Google thành công',
        data: { accessToken, refreshToken, user: userData },
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
    
    // Backend returns: { status: 200, data: { accessToken, refreshToken, expiresIn, userInfo }, message }
    // Check for status 200 or status 'success'
    if ((response.status === 200 || response.status === 'success') && response.data) {
      const { accessToken: jwtToken, refreshToken, userInfo, user } = response.data;
      const userData = user || userInfo;
      
      // Save auth data - Facebook login always remembers
      saveAuthData({ accessToken: jwtToken, refreshToken, user: userData }, true);
      
      return {
        status: 'success',
        message: response.message || 'Đăng nhập Facebook thành công',
        data: { accessToken: jwtToken, refreshToken, user: userData },
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
    await api.post(API_ENDPOINTS.AUTH.LOGOUT_ALL);
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
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.RESEND_OTP, {
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
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER.COMPLETE, data);
    
    if (response.status === 'success' && response.data) {
      saveAuthData(response.data, true); // Auto login after registration
    }
    
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
