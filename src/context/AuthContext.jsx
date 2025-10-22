import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  login as loginService, 
  loginWithGoogle as loginWithGoogleService,
  loginWithFacebook as loginWithFacebookService,
  logout as logoutService,
  logoutAll as logoutAllService,
  completeRegistration,
  resetPassword,
} from '../services/authService';
import { 
  getUserInfo, 
  saveUserInfo, 
  clearAuthData,
  isAuthenticated as checkAuth,
} from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Provides authentication state and methods to entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * Check if user is already logged in
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      if (checkAuth()) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUser(userInfo);
        } else {
          // Token exists but no user info - clear and logout
          clearAuthData();
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with username/email and password
   * @param {object} credentials - { username, password, rememberMe }
   * @returns {Promise<object>}
   */
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginService(credentials);
      
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập thất bại' 
      };
    } catch (err) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi đăng nhập';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google OAuth
   * @param {string} idToken - Google ID token
   * @returns {Promise<object>}
   */
  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginWithGoogleService(idToken);
      
      console.log('[AuthContext] loginWithGoogle response:', response);
      
      // Check for success status (service returns status: 'success')
      if (response.status === 'success' && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        console.log('[AuthContext] User set:', userData);
        return { success: true, data: response.data };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập Google thất bại' 
      };
    } catch (err) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi đăng nhập Google';
      console.error('[AuthContext] loginWithGoogle error:', errorMessage, err);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Facebook OAuth
   * @param {string} accessToken - Facebook access token
   * @returns {Promise<object>}
   */
  const loginWithFacebook = useCallback(async (accessToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginWithFacebookService(accessToken);
      
      console.log('[AuthContext] loginWithFacebook response:', response);
      
      // Check for success status (service returns status: 'success')
      if (response.status === 'success' && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        console.log('[AuthContext] User set:', userData);
        return { success: true, data: response.data };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập Facebook thất bại' 
      };
    } catch (err) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi đăng nhập Facebook';
      console.error('[AuthContext] loginWithFacebook error:', errorMessage, err);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {object} userData - { username, password, confirmPassword, contact }
   * @returns {Promise<object>}
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await completeRegistration(userData);
      
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng ký thất bại' 
      };
    } catch (err) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi đăng ký';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout current session
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutService();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if API fails
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  /**
   * Logout all sessions
   */
  const logoutAll = useCallback(async () => {
    try {
      setLoading(true);
      await logoutAllService();
    } catch (err) {
      console.error('Logout all error:', err);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  /**
   * Update user info in state
   * @param {object} updatedUser
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedUser };
      saveUserInfo(newUser);
      return newUser;
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(() => {
    return checkAuth() && user !== null;
  }, [user]);

  /**
   * Check if user has specific role
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = useCallback((role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles
   * @returns {boolean}
   */
  const hasAnyRole = useCallback((roles) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }, [user]);

  // Context value
  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    
    // Methods
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout,
    logoutAll,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
