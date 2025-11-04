/**
 * Auth Error Codes and Handler
 * Centralizes all authentication error handling based on backend error codes
 */

// ==================== AUTH ERROR CODES ====================

export const AUTH_ERROR_CODES = {
  // 401 - Authentication Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  EXPIRED_REFRESH_TOKEN: 'EXPIRED_REFRESH_TOKEN',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  
  // 403 - Authorization Errors
  USER_NOT_ACTIVATED: 'USER_NOT_ACTIVATED',
  UNAUTHORIZED_USER_ACTION: 'UNAUTHORIZED_USER_ACTION',
  
  // 400 - Validation Errors
  INVALID_OTP: 'INVALID_OTP',
  EXPIRED_OTP: 'EXPIRED_OTP',
  OTP_NOT_VERIFIED: 'OTP_NOT_VERIFIED',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  INVALID_ROLE: 'INVALID_ROLE',
  
  // 409 - Conflict Errors
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_PHONE: 'DUPLICATE_PHONE',
  USER_HAS_REFERENCES: 'USER_HAS_REFERENCES',
  
  // 404 - Not Found Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VERIFICATION_NOT_FOUND: 'VERIFICATION_NOT_FOUND',
};

// ==================== ERROR MESSAGES ====================

export const AUTH_ERROR_MESSAGES = {
  // Vietnamese messages for user-friendly display
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không chính xác',
  [AUTH_ERROR_CODES.USER_NOT_ACTIVATED]: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.',
  [AUTH_ERROR_CODES.DUPLICATE_EMAIL]: 'Email này đã được sử dụng',
  [AUTH_ERROR_CODES.DUPLICATE_PHONE]: 'Số điện thoại này đã được sử dụng',
  [AUTH_ERROR_CODES.INVALID_OTP]: 'Mã OTP không chính xác',
  [AUTH_ERROR_CODES.EXPIRED_OTP]: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
  [AUTH_ERROR_CODES.OTP_NOT_VERIFIED]: 'Vui lòng xác thực OTP trước',
  [AUTH_ERROR_CODES.PASSWORD_MISMATCH]: 'Mật khẩu xác nhận không khớp',
  [AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN]: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  [AUTH_ERROR_CODES.EXPIRED_REFRESH_TOKEN]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [AUTH_ERROR_CODES.UNAUTHENTICATED]: 'Vui lòng đăng nhập để tiếp tục',
  [AUTH_ERROR_CODES.UNAUTHORIZED_USER_ACTION]: 'Bạn không có quyền thực hiện thao tác này',
  [AUTH_ERROR_CODES.INVALID_ROLE]: 'Vai trò không hợp lệ',
  [AUTH_ERROR_CODES.USER_HAS_REFERENCES]: 'Không thể xóa người dùng vì còn dữ liệu liên quan',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'Không tìm thấy người dùng',
  [AUTH_ERROR_CODES.VERIFICATION_NOT_FOUND]: 'Không tìm thấy mã xác thực',
};

// ==================== ERROR HANDLER ====================

/**
 * Handle API errors and return user-friendly error message
 * @param {Error} error - Axios error object
 * @returns {object} { errorCode, message, status }
 */
export const handleAuthError = (error) => {
  console.error('[handleAuthError] Error:', error);
  
  // Check if it's an axios error with response
  if (error.response) {
    const { status, data } = error.response;
    const errorCode = data?.error || data?.errorCode;
    
    console.log('[handleAuthError] Status:', status, 'ErrorCode:', errorCode);
    
    // Handle specific error codes
    if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
      return {
        errorCode,
        message: AUTH_ERROR_MESSAGES[errorCode],
        status,
        originalMessage: data?.message,
      };
    }
    
    // Handle by status code if no specific error code
    switch (status) {
      case 400:
        return {
          errorCode: 'VALIDATION_ERROR',
          message: data?.message || 'Dữ liệu không hợp lệ',
          status,
        };
      case 401:
        return {
          errorCode: 'UNAUTHENTICATED',
          message: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNAUTHENTICATED],
          status,
        };
      case 403:
        return {
          errorCode: 'FORBIDDEN',
          message: data?.message || 'Bạn không có quyền truy cập',
          status,
        };
      case 404:
        return {
          errorCode: 'NOT_FOUND',
          message: data?.message || 'Không tìm thấy tài nguyên',
          status,
        };
      case 409:
        return {
          errorCode: 'CONFLICT',
          message: data?.message || 'Dữ liệu đã tồn tại',
          status,
        };
      case 500:
        return {
          errorCode: 'SERVER_ERROR',
          message: 'Lỗi hệ thống. Vui lòng thử lại sau.',
          status,
        };
      default:
        return {
          errorCode: 'UNKNOWN_ERROR',
          message: data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.',
          status,
        };
    }
  }
  
  // Network error
  if (error.request) {
    return {
      errorCode: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      status: 0,
    };
  }
  
  // Other errors
  return {
    errorCode: 'UNKNOWN_ERROR',
    message: error.message || 'Đã xảy ra lỗi không xác định',
    status: 0,
  };
};

/**
 * Check if error requires re-authentication
 * @param {string} errorCode
 * @returns {boolean}
 */
export const requiresReAuthentication = (errorCode) => {
  return [
    AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
    AUTH_ERROR_CODES.EXPIRED_REFRESH_TOKEN,
    AUTH_ERROR_CODES.UNAUTHENTICATED,
  ].includes(errorCode);
};

/**
 * Check if error is a validation error
 * @param {string} errorCode
 * @returns {boolean}
 */
export const isValidationError = (errorCode) => {
  return [
    AUTH_ERROR_CODES.INVALID_OTP,
    AUTH_ERROR_CODES.EXPIRED_OTP,
    AUTH_ERROR_CODES.PASSWORD_MISMATCH,
    AUTH_ERROR_CODES.INVALID_ROLE,
  ].includes(errorCode);
};

/**
 * Check if error is a duplicate data error
 * @param {string} errorCode
 * @returns {boolean}
 */
export const isDuplicateError = (errorCode) => {
  return [
    AUTH_ERROR_CODES.DUPLICATE_EMAIL,
    AUTH_ERROR_CODES.DUPLICATE_PHONE,
  ].includes(errorCode);
};
