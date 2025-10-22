import axios from 'axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  saveAccessToken, 
  saveRefreshToken,
  clearAuthData,
  isAuthenticated 
} from '../utils/storage';
import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  REQUEST_TIMEOUT,
  HTTP_STATUS 
} from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue to store failed requests while refreshing token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Attach access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    // Return data directly from response
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or request already retried, reject
    if (error.response?.status !== HTTP_STATUS.UNAUTHORIZED || originalRequest._retry) {
      return Promise.reject(handleError(error));
    }
    
    // If token refresh endpoint failed, logout
    if (originalRequest.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
      clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    
    originalRequest._retry = true;
    isRefreshing = true;
    
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    try {
      // Call refresh token API
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        { refreshToken },
        { timeout: REQUEST_TIMEOUT }
      );
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Save new tokens
      const rememberMe = !!localStorage.getItem('remember_me');
      saveAccessToken(newAccessToken, rememberMe);
      if (newRefreshToken) {
        saveRefreshToken(newRefreshToken, rememberMe);
      }
      
      // Process queued requests
      processQueue(null, newAccessToken);
      
      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
      
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthData();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Error handler
const handleError = (error) => {
  if (!error.response) {
    // Network error
    return {
      message: 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại',
      type: 'network',
    };
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return {
        message: data?.message || 'Yêu cầu không hợp lệ',
        type: 'validation',
        errors: data?.errors,
      };
      
    case HTTP_STATUS.UNAUTHORIZED:
      return {
        message: data?.message || 'Phiên đăng nhập hết hạn',
        type: 'auth',
      };
      
    case HTTP_STATUS.FORBIDDEN:
      return {
        message: data?.message || 'Bạn không có quyền truy cập',
        type: 'permission',
      };
      
    case HTTP_STATUS.NOT_FOUND:
      return {
        message: data?.message || 'Không tìm thấy tài nguyên',
        type: 'notfound',
      };
      
    case HTTP_STATUS.CONFLICT:
      return {
        message: data?.message || 'Dữ liệu đã tồn tại',
        type: 'conflict',
      };
      
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return {
        message: data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau',
        type: 'server',
      };
      
    default:
      return {
        message: data?.message || 'Đã xảy ra lỗi',
        type: 'unknown',
      };
  }
};

// Export axios instance as default
export default api;

// Export named functions for convenience
export { isAuthenticated };

// Legacy support for existing code
export async function fetchWithAuth(url, options = {}) {
  try {
    const response = await api({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers,
    });
    return {
      ok: true,
      json: async () => response,
    };
  } catch (error) {
    return {
      ok: false,
      json: async () => ({ error: handleError(error) }),
    };
  }
}

export async function getWishlist() {
  const res = await fetchWithAuth('/api/wishlist');
  return res.json();
}
