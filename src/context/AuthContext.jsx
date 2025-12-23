import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  login as loginService, 
  loginWithGoogle as loginWithGoogleService,
  loginWithFacebook as loginWithFacebookService,
  logout as logoutService,
  logoutAll as logoutAllService,
  completeRegistration,
  getCurrentUser,
} from '../services/authService';
import { 
  getUserInfo, 
  saveUserInfo, 
  clearAuthData,
  isAuthenticated as checkAuth,
} from '../utils/storage';
import { handleAuthError, requiresReAuthentication } from '../utils/authErrorHandler';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { onAuthChange } from '../utils/storageSync';
// mapAuthoritiesToRole and getRoleName moved to separate utility

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Provides authentication state and methods to entire app
 * Syncs authentication across multiple tabs
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Initialize authentication state
   * Check if user is already logged in
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      if (checkAuth()) {
        let userInfo = getUserInfo();
        
        if (userInfo) {
          // User info exists in storage
          setUser(userInfo);
          console.log('[initializeAuth] User loaded from storage:', userInfo);
        } else {
          // Token exists but no user info - fetch from API
          console.log('[initializeAuth] Token exists but no user info, fetching from API...');
          
          try {
            const fetchedUser = await getCurrentUser();
            
            if (fetchedUser) {
              saveUserInfo(fetchedUser);
              setUser(fetchedUser);
              console.log('[initializeAuth] User fetched from API:', fetchedUser);
            } else {
              // Failed to fetch user - clear auth data
              console.warn('[initializeAuth] Failed to fetch user, clearing auth data');
              clearAuthData();
            }
          } catch (err) {
            console.error('[initializeAuth] Error fetching user:', err);
            // If it's an auth error, clear data
            if (err.response?.status === 401) {
              clearAuthData();
            }
          }
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Sync authentication state across tabs
  useEffect(() => {
    const unsubscribe = onAuthChange((data) => {
      console.log('[AuthContext] Cross-tab auth event received:', data);
      
      // Re-initialize auth state when other tab login/logout
      if (checkAuth()) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUser(userInfo);
          console.log('[AuthContext] User synced from other tab:', userInfo);
        }
      } else {
        // Logout event from other tab
        setUser(null);
        console.log('[AuthContext] Logged out from other tab');
      }
    });

    return () => unsubscribe();
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
      
      // Backend may return status: 200 (number) or status: 'success' (string)
      if ((response.status === 200 || response.status === 'success') && response.data?.user) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập thất bại' 
      };
    } catch (err) {
      const errorInfo = handleAuthError(err);
      setError(errorInfo.message);
      
      // If error requires re-authentication, clear auth data
      if (requiresReAuthentication(errorInfo.errorCode)) {
        clearAuthData();
        setUser(null);
      }
      
      return { 
        success: false, 
        message: errorInfo.message,
        errorCode: errorInfo.errorCode 
      };
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
      
      // Backend returns ResponseDTO: { status: 200 (int), error: null, message: "...", data: {...} }
      if ((response.status === 200 || response.statusCode === 200 || response.status === 'success') && response.data) {
        // Backend may not return user object directly
        let userData = response.data.user;
        
        if (userData) {
          // User info available
          setUser(userData);
          console.log('[AuthContext] User set from response:', userData);
        } else {
          // User info not in response, fetch it
          console.log('[AuthContext] User not in response, fetching...');
          
          try {
            const fetchedUser = await getCurrentUser();
            if (fetchedUser) {
              saveUserInfo(fetchedUser);
              setUser(fetchedUser);
              console.log('[AuthContext] User fetched:', fetchedUser);
            }
          } catch (err) {
            console.error('[AuthContext] Failed to fetch user:', err);
            // Continue anyway, user will be fetched on next render
          }
        }
        
        return { success: true, data: response.data, message: response.message };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập Google thất bại' 
      };
    } catch (err) {
      const errorInfo = handleAuthError(err);
      console.error('[AuthContext] loginWithGoogle error:', errorInfo, err);
      setError(errorInfo.message);
      
      if (requiresReAuthentication(errorInfo.errorCode)) {
        clearAuthData();
        setUser(null);
      }
      
      return { 
        success: false, 
        message: errorInfo.message,
        errorCode: errorInfo.errorCode 
      };
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
      
      // Backend returns ResponseDTO: { status: 200 (int), error: null, message: "...", data: {...} }
      if ((response.status === 200 || response.statusCode === 200 || response.status === 'success') && response.data) {
        // Backend may not return user object directly
        let userData = response.data.user;
        
        if (userData) {
          // User info available
          setUser(userData);
          console.log('[AuthContext] User set from response:', userData);
        } else {
          // User info not in response, fetch it
          console.log('[AuthContext] User not in response, fetching...');
          
          try {
            const fetchedUser = await getCurrentUser();
            if (fetchedUser) {
              saveUserInfo(fetchedUser);
              setUser(fetchedUser);
              console.log('[AuthContext] User fetched:', fetchedUser);
            }
          } catch (err) {
            console.error('[AuthContext] Failed to fetch user:', err);
            // Continue anyway, user will be fetched on next render
          }
        }
        
        return { success: true, data: response.data, message: response.message };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập Facebook thất bại' 
      };
    } catch (err) {
      const errorInfo = handleAuthError(err);
      console.error('[AuthContext] loginWithFacebook error:', errorInfo, err);
      setError(errorInfo.message);
      
      if (requiresReAuthentication(errorInfo.errorCode)) {
        clearAuthData();
        setUser(null);
      }
      
      return { 
        success: false, 
        message: errorInfo.message,
        errorCode: errorInfo.errorCode 
      };
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
      
      // Step 1: Complete registration (no token returned)
      const response = await completeRegistration(userData);
      
      console.log('🔍 [AuthContext] register RAW response:', response);
      console.log('🔍 [AuthContext] response.status:', response.status, typeof response.status);
      console.log('🔍 [AuthContext] response.data:', response.data);
      
      // Check if registration was successful
      if (response.status === 200) {
        console.log('✅ [AuthContext] Registration successful, now auto-login...');
        
        // Step 2: Auto-login after successful registration
        const loginResult = await login({
          username: userData.username,
          password: userData.password,
          rememberMe: true
        });
        
        console.log('🔍 [AuthContext] Auto-login result:', loginResult);
        
        if (loginResult.success) {
          console.log('✅ [AuthContext] Auto-login SUCCESS, returning { success: true }');
          return { 
            success: true, 
            message: response.message || 'Đăng ký thành công',
            data: loginResult.data 
          };
        } else {
          console.log('❌ [AuthContext] Auto-login FAILED');
          return {
            success: false,
            message: 'Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập thủ công.'
          };
        }
      }
      
      console.log('❌ [AuthContext] Registration FAILED, returning { success: false }');
      return { 
        success: false, 
        message: response.message || 'Đăng ký thất bại' 
      };
    } catch (err) {
      const errorInfo = handleAuthError(err);
      setError(errorInfo.message);
      console.error('❌ [AuthContext] Registration ERROR:', err, errorInfo);
      return { 
        success: false, 
        message: errorInfo.message,
        errorCode: errorInfo.errorCode 
      };
    } finally {
      setLoading(false);
    }
  }, [login]);

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
      // Clear all auth data from storage
      clearAuthData();
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
      // Clear all auth data from storage
      clearAuthData();
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
   * Supports both string ("SELLER", "ADMIN", "BUYER") and number (0, 1, 2) format
   * @param {string|number} role - Role to check (string: "SELLER"/"ADMIN"/"BUYER" or number: 0/1/2)
   * @returns {boolean}
   */
  const hasRole = useCallback((role) => {
    if (!user) return false;
    
    // Convert number to string if needed
    let roleToCheck = role;
    if (typeof role === 'number') {
      const roleMap = { 0: 'ADMIN', 1: 'SELLER', 2: 'BUYER' };
      roleToCheck = roleMap[role];
    }
    
    // Check user.role (string format from backend: "ADMIN", "SELLER", "BUYER")
    if (user.role) {
      return user.role.toUpperCase() === roleToCheck?.toUpperCase();
    }
    
    // Fallback: check user.roles (array format - if exists)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(r => r.toUpperCase() === roleToCheck?.toUpperCase());
    }
    
    return false;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   * @param {(string|number)[]} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasAnyRole = useCallback((roles) => {
    if (!user || !roles || !Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  }, [user, hasRole]);

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

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
