import axios from 'axios';

// Tạo axios instance với base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động thêm JWT token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added JWT token to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi authentication
axiosInstance.interceptors.response.use(
  (response) => {
    // Request thành công, return response
    return response;
  },
  (error) => {
    console.error('❌ Response interceptor error:', error);
    
    if (error.response) {
      const { status } = error.response;
      
      // Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        console.log('🚪 Token expired or invalid, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect về login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Không có quyền truy cập
      if (status === 403) {
        console.log('🚫 Access forbidden');
        // Có thể hiển thị thông báo lỗi hoặc redirect
      }
      
      // Lỗi server
      if (status >= 500) {
        console.log('🔥 Server error');
      }
    } else if (error.request) {
      console.log('🌐 Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;