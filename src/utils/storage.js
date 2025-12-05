import { STORAGE_KEYS } from './constants';
import { broadcastLogin, broadcastLogout, broadcastUserUpdate } from './storageSync';
// Note: broadcastTokenRefresh available in storageSync but not currently used

/**
 * Storage wrapper for localStorage
 * Provides encryption, JSON serialization, and cross-tab synchronization
 * 
 * IMPORTANT: Always use localStorage (not sessionStorage) to enable:
 * 1. Cross-tab synchronization
 * 2. Persistent sessions across browser restarts (when "Remember Me" is checked)
 * 3. Better user experience
 */

// Simple encryption (for demo - use a proper library in production)
const encode = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Encoding error:', error);
    return null;
  }
};

const decode = (data) => {
  try {
    return JSON.parse(atob(data));
  } catch (error) {
    console.error('Decoding error:', error);
    return null;
  }
};

// ==================== TOKEN MANAGEMENT ====================

/**
 * Save access token to localStorage
 * @param {string} token
 * @param {boolean} remember - If false, token expires when browser closes (via session management)
 */
export const saveAccessToken = (token, remember = false) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
  } else {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'false');
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Save refresh token to localStorage
 * @param {string} token
 * @param {boolean} remember
 */
export const saveRefreshToken = (token, _remember = false) => {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

/**
 * Get refresh token from localStorage
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Remove tokens from localStorage and broadcast logout event
 */
export const removeTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  broadcastLogout();
};

// ==================== USER INFO MANAGEMENT ====================

/**
 * Save user info to localStorage
 * @param {object} userInfo
 */
export const saveUserInfo = (userInfo) => {
  const encoded = encode(userInfo);
  if (encoded) {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, encoded);
    broadcastUserUpdate(userInfo);
  }
};

/**
 * Get user info from localStorage
 * @returns {object|null}
 */
export const getUserInfo = () => {
  const encoded = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return encoded ? decode(encoded) : null;
};

/**
 * Remove user info from localStorage
 */
export const removeUserInfo = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
};

// ==================== SESSION MANAGEMENT ====================

/**
 * Check if user is authenticated (has valid tokens)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!(getAccessToken() && getRefreshToken());
};

/**
 * Clear all auth data from localStorage and broadcast logout
 */
export const clearAuthData = () => {
  removeTokens();
  removeUserInfo();
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  broadcastLogout();
};

/**
 * Save complete auth data and broadcast login event
 * @param {object} data - { token, refreshToken, user }
 * @param {boolean} remember
 */
export const saveAuthData = (data, remember = false) => {
  console.log('[saveAuthData] Saving auth data:', { data, remember });
  const { token, accessToken, refreshToken, user } = data;
  
  // Support both 'token' (new) and 'accessToken' (legacy) field names
  const authToken = token || accessToken;
  
  if (authToken) saveAccessToken(authToken, remember);
  if (refreshToken) saveRefreshToken(refreshToken, remember);
  if (user) {
    console.log('[saveAuthData] Saving user:', user);
    saveUserInfo(user);
  } else {
    console.warn('[saveAuthData] No user data to save');
  }
  
  // Broadcast login event to all tabs
  broadcastLogin({ token: authToken, refreshToken, user });
};

// ==================== THEME MANAGEMENT ====================

/**
 * Save theme preference
 * @param {string} theme - 'light' or 'dark'
 */
export const saveTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * Get theme preference
 * @returns {string} 'light' or 'dark'
 */
export const getTheme = () => {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
};

// ==================== GENERAL STORAGE UTILITIES ====================

/**
 * Generic set item with JSON serialization
 * @param {string} key
 * @param {any} value
 * @param {boolean} persistent - If true, use localStorage
 */
export const setItem = (key, value, persistent = false) => {
  const storage = persistent ? localStorage : sessionStorage;
  try {
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
};

/**
 * Generic get item with JSON deserialization
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item =
      localStorage.getItem(key) || sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove item from both storages
 * @param {string} key
 */
export const removeItem = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

/**
 * Clear all storage
 */
export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};
