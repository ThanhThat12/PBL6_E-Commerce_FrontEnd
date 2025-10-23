import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid, extractUserFromToken } from '../utils/jwtUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Khởi tạo: Kiểm tra token và user trong localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && isTokenValid(storedToken)) {
      try {
        // Extract user từ JWT token
        const extractedUser = extractUserFromToken(storedToken);
        
        if (extractedUser) {
          setToken(storedToken);
          setUser(extractedUser);
          console.log('🔄 Restored auth from localStorage:', extractedUser);
        } else {
          // Token không valid, xóa khỏi localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user'); // Xóa user cũ nếu có
        }
      } catch (error) {
        console.error('Error restoring auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Hàm login: Lưu token và user info
  const login = (userData, authToken) => {
    console.log('💾 Saving auth:', { user: userData, token: authToken?.substring(0, 20) + '...' });
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm logout: Xóa token và user info
  const logout = () => {
    console.log('🚪 Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Kiểm tra user có role cụ thể không
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Kiểm tra user có phải seller không (role = 1)
  const isSeller = () => {
    return user?.role === 1;
  };

  // Kiểm tra user có phải buyer/customer không (role = 2)
  const isCustomer = () => {
    return user?.role === 2;
  };

  // Kiểm tra user có phải admin không (role = 0)
  const isAdmin = () => {
    return user?.role === 0;
  };

  // Lấy user ID
  const getUserId = () => {
    return user?.id;
  };

  // Cập nhật thông tin user
  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isSeller,
    isCustomer,
    isAdmin,
    getUserId,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};