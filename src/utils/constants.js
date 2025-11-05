// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: 'authenticate',
    LOGIN_GOOGLE: 'authenticate/google',
    LOGIN_FACEBOOK: 'authenticate/facebook',
    REFRESH_TOKEN: 'refresh-token',
    LOGOUT: 'logout',
    
    // Register
    REGISTER: {
      CHECK_CONTACT: 'register/check-contact',
      VERIFY_OTP: 'register/verify-otp',
      REGISTER: 'register/register',
    },
    
    // Forgot Password
    FORGOT_PASSWORD: {
      SEND_OTP: 'forgot-password/send-otp',
      VERIFY_OTP: 'forgot-password/verify-otp',
      RESET: 'forgot-password/reset',
    },
  },
  
  // User Profile
  PROFILE: {
    ME: 'user/me',
    GET: 'user/profile',
    UPDATE: 'user/profile',
    CHANGE_PASSWORD: 'user/change-password',
    CHANGE_EMAIL: 'user/change-email',
    VERIFY_EMAIL_CHANGE: 'user/verify-email-change',
  },
  
  // Cart
  CART: {
    GET: 'cart',
    ADD_ITEM: 'cart/items',
    UPDATE_ITEM: (itemId) => `cart/items/${itemId}`,
    REMOVE_ITEM: (itemId) => `cart/items/${itemId}`,
    CLEAR: 'cart',
  },
  
  // Product
  PRODUCT: {
    GET_ALL: 'products',
    GET_BY_ID: (id) => `products/${id}`,
    SEARCH: 'products/search',
    BY_CATEGORY: (categoryId) => `products/category/${categoryId}`,
  },
  
  // Category
  CATEGORY: {
    GET_ALL: 'categories',
    GET_BY_ID: (id) => `categories/${id}`,
  },
  
  // Order (fixed: added missing ORDER endpoints)
  // Note: CREATE and GET_LIST use same path 'orders' but different HTTP methods (POST vs GET)
  ORDER: {
    CREATE: 'orders',           // POST /api/orders
    GET_LIST: 'orders',          // GET /api/orders (get all user's orders)
    GET_BY_ID: (orderId) => `orders/${orderId}`,
    CANCEL: (orderId) => `orders/${orderId}/cancel`,
  },
  
  // Security
  SECURITY: {
    LOGIN_HISTORY: 'user/login-history',
    ACTIVE_SESSIONS: 'user/active-sessions',
    REVOKE_SESSION: 'user/revoke-session',
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
  // Checkout
  CHECKOUT_SHIPPING_ADDRESS: 'checkout_shipping_address',
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
export const GOOGLE_CLIENT_ID = '675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com';
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';
