import { STORAGE_KEYS } from './constants';

/**
 * Storage wrapper for localStorage and sessionStorage
 * Provides encryption and JSON serialization
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

/**
 * Get storage type based on remember me
 * @returns {Storage} localStorage or sessionStorage
 */
const getStorage = () => {
  const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  return rememberMe ? localStorage : sessionStorage;
};

// ==================== TOKEN MANAGEMENT ====================

/**
 * Save access token
 * @param {string} token
 * @param {boolean} remember - If true, save to localStorage; otherwise sessionStorage
 */
export const saveAccessToken = (token, remember = false) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
  }
};

/**
 * Get access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
};

/**
 * Save refresh token
 * @param {string} token
 * @param {boolean} remember
 */
export const saveRefreshToken = (token, remember = false) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

/**
 * Get refresh token
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  );
};

/**
 * Remove tokens
 */
export const removeTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// ==================== USER INFO MANAGEMENT ====================

/**
 * Save user info
 * @param {object} userInfo
 */
export const saveUserInfo = (userInfo) => {
  const storage = getStorage();
  const encoded = encode(userInfo);
  if (encoded) {
    storage.setItem(STORAGE_KEYS.USER_INFO, encoded);
  }
};

/**
 * Get user info
 * @returns {object|null}
 */
export const getUserInfo = () => {
  const storage = getStorage();
  const encoded = storage.getItem(STORAGE_KEYS.USER_INFO);
  
  if (!encoded) {
    // Try the other storage
    const otherStorage = storage === localStorage ? sessionStorage : localStorage;
    const otherEncoded = otherStorage.getItem(STORAGE_KEYS.USER_INFO);
    return otherEncoded ? decode(otherEncoded) : null;
  }
  
  return decode(encoded);
};

/**
 * Remove user info
 */
export const removeUserInfo = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
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
 * Clear all auth data
 */
export const clearAuthData = () => {
  removeTokens();
  removeUserInfo();
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
};

/**
 * Save complete auth data
 * @param {object} data - { accessToken, refreshToken, user }
 * @param {boolean} remember
 */
export const saveAuthData = (data, remember = false) => {
  console.log('[saveAuthData] Saving auth data:', { data, remember });
  const { accessToken, refreshToken, user } = data;
  
  if (accessToken) saveAccessToken(accessToken, remember);
  if (refreshToken) saveRefreshToken(refreshToken, remember);
  if (user) {
    console.log('[saveAuthData] Saving user:', user);
    saveUserInfo(user);
  } else {
    console.warn('[saveAuthData] No user data to save');
  }
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
