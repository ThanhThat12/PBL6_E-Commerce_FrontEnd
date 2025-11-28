import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

/**
 * Admin Login - Đăng nhập cho admin
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise} Login result
 */
export const loginAdmin = async (username, password) => {
  try {
    console.log('🔐 Attempting admin login...');
    console.log('📍 API URL:', `${API_URL}/auth/admin/login`);
    
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      username,
      password
    });

    console.log('✅ Login response:', response.data);

    if (response.data.statusCode === 200 && response.data.data) {
      const { token, refreshToken, user } = response.data.data;
      
      // ✅ Double check: User MUST be ADMIN (backend already checked, but extra safety)
      if (user.role !== 'ADMIN') {
        console.error('❌ User is not an admin:', user.role);
        return {
          success: false,
          message: 'Bạn không có quyền truy cập trang admin'
        };
      }
      
      // Save to localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRefreshToken', refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      console.log('✅ Admin login successful');
      console.log('👤 Admin user:', user);
      
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Đăng nhập thất bại'
    };
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error.response) {
      // Server trả về lỗi
      const status = error.response.status;
      const message = error.response.data.message || error.response.data.errorMessage;
      
      if (status === 401) {
        return {
          success: false,
          message: message || 'Tên đăng nhập hoặc mật khẩu không đúng'
        };
      } else if (status === 403) {
        return {
          success: false,
          message: message || 'Bạn không có quyền truy cập trang admin'
        };
      }
      
      return {
        success: false,
        message: message || 'Đăng nhập thất bại'
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'Đã xảy ra lỗi'
      };
    }
  }
};

/**
 * Logout admin
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRefreshToken');
  localStorage.removeItem('adminUser');
  console.log('🚪 Admin logged out');
};

/**
 * Get current admin user
 */
export const getCurrentAdmin = () => {
  const userStr = localStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if current user is admin
 */
export const isAdmin = () => {
  const user = getCurrentAdmin();
  return user && user.role === 'ADMIN';
};

/**
 * Get admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};