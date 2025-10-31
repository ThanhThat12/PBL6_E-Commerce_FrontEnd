// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/authenticate',
    LOGIN_GOOGLE: '/api/authenticate/google',
    LOGIN_FACEBOOK: '/api/authenticate/facebook',
    REFRESH_TOKEN: '/api/refresh-token',
    LOGOUT: '/api/logout',
    
    // Register
    REGISTER: {
      CHECK_CONTACT: '/api/register/check-contact',
      VERIFY_OTP: '/api/register/verify-otp',
      REGISTER: '/api/register/register',
    },
    
    // Forgot Password
    FORGOT_PASSWORD: {
      SEND_OTP: '/api/forgot-password/send-otp',
      VERIFY_OTP: '/api/forgot-password/verify-otp',
      RESET: '/api/forgot-password/reset',
    },
  },
  
  // User Profile
  PROFILE: {
    ME: '/api/user/me',
    GET: '/api/user/profile',
    UPDATE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
    CHANGE_EMAIL: '/api/user/change-email',
    VERIFY_EMAIL_CHANGE: '/api/user/verify-email-change',
  },
  
  // Cart
  CART: {
    GET: '/api/cart',
    ADD_ITEM: '/api/cart/items',
    UPDATE_ITEM: (itemId) => `/api/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId) => `/api/cart/items/${itemId}`,
    CLEAR: '/api/cart',
  },
  
  // Product
  PRODUCT: {
    GET_ALL: '/api/products',
    GET_BY_ID: (id) => `/api/products/${id}`,
    SEARCH: '/api/products/search',
    BY_CATEGORY: (categoryId) => `/api/products/category/${categoryId}`,
  },
  
  // Category
  CATEGORY: {
    GET_ALL: '/api/categories',
    GET_BY_ID: (id) => `/api/categories/${id}`,
  },
  
  // Security
  SECURITY: {
    LOGIN_HISTORY: '/api/user/login-history',
    ACTIVE_SESSIONS: '/api/user/active-sessions',
    REVOKE_SESSION: '/api/user/revoke-session',
  },
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  SECURITY: '/security',
  DASHBOARD: '/dashboard',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
};

// Validation Regex
export const VALIDATION_REGEX = {
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  PHONE_VN: /^(0|\+84)[0-9]{9,10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  OTP: /^[0-9]{6}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Required fields
  REQUIRED: {
    EMAIL: 'Vui lòng nhập email',
    PHONE: 'Vui lòng nhập số điện thoại',
    CONTACT: 'Vui lòng nhập email hoặc số điện thoại',
    USERNAME: 'Vui lòng nhập tên đăng nhập',
    PASSWORD: 'Vui lòng nhập mật khẩu',
    CONFIRM_PASSWORD: 'Vui lòng xác nhận mật khẩu',
    OTP: 'Vui lòng nhập mã OTP',
    CURRENT_PASSWORD: 'Vui lòng nhập mật khẩu hiện tại',
    NEW_PASSWORD: 'Vui lòng nhập mật khẩu mới',
  },
  
  // Invalid format
  INVALID: {
    EMAIL: 'Email không hợp lệ',
    PHONE: 'Số điện thoại không hợp lệ',
    USERNAME: 'Tên đăng nhập phải từ 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới',
    PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    OTP: 'Mã OTP phải là 6 chữ số',
    CONFIRM_PASSWORD: 'Mật khẩu xác nhận không khớp',
  },
  
  // Network & Server
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau',
  TIMEOUT: 'Yêu cầu quá thời gian. Vui lòng thử lại',
  UNAUTHORIZED: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
  
  // Auth specific
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin',
  REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  REGISTER: 'Đăng ký thành công!',
  LOGOUT: 'Đăng xuất thành công!',
  OTP_SENT: 'Mã OTP đã được gửi',
  OTP_VERIFIED: 'Xác thực OTP thành công',
  PASSWORD_RESET: 'Đặt lại mật khẩu thành công',
  PASSWORD_CHANGED: 'Thay đổi mật khẩu thành công',
  EMAIL_CHANGED: 'Thay đổi email thành công',
  PROFILE_UPDATED: 'Cập nhật hồ sơ thành công',
};

// Loading Messages
export const LOADING_MESSAGES = {
  LOGIN: 'Đang đăng nhập...',
  REGISTER: 'Đang đăng ký...',
  SENDING_OTP: 'Đang gửi mã OTP...',
  VERIFYING_OTP: 'Đang xác thực OTP...',
  RESETTING_PASSWORD: 'Đang đặt lại mật khẩu...',
  UPDATING_PROFILE: 'Đang cập nhật...',
};

// OTP Config
export const OTP_CONFIG = {
  LENGTH: 6,
  RESEND_COOLDOWN: 60, // seconds
  EXPIRY_TIME: 300, // 5 minutes in seconds
};

// Token Config
export const TOKEN_CONFIG = {
  REFRESH_THRESHOLD: 300, // Refresh token 5 minutes before expiry
  MAX_RETRY: 3,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Request Timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';
