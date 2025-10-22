import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date to Vietnamese locale
 * @param {Date|string} date
 * @param {string} formatStr - Default: 'dd/MM/yyyy'
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr, { locale: vi });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date with time
 * @param {Date|string} date
 * @returns {string} e.g., "20/03/2024 14:30"
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Format date relative to now (e.g., "2 giờ trước")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatDistance(dateObj, new Date(), { 
      addSuffix: true, 
      locale: vi 
    });
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return '';
  }
};

/**
 * Format date in relative format (e.g., "hôm qua lúc 14:30")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatRelativeFull = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatRelative(dateObj, new Date(), { locale: vi });
  } catch (error) {
    console.error('Relative full formatting error:', error);
    return '';
  }
};

/**
 * Format phone number to Vietnamese format
 * @param {string} phone
 * @returns {string} e.g., "0123 456 789" or "+84 123 456 789"
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format Vietnamese phone number
  if (cleaned.startsWith('+84')) {
    // +84 123 456 789
    const parts = cleaned.slice(3).match(/(\d{1,3})(\d{1,3})(\d{1,3})/);
    if (parts) {
      return `+84 ${parts[1]} ${parts[2]} ${parts[3]}`;
    }
  } else if (cleaned.startsWith('0')) {
    // 0123 456 789
    const parts = cleaned.match(/(\d{4})(\d{3})(\d{3})/);
    if (parts) {
      return `${parts[1]} ${parts[2]} ${parts[3]}`;
    }
  }
  
  return phone;
};

/**
 * Format currency to VND
 * @param {number} amount
 * @returns {string} e.g., "1.000.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} num
 * @returns {string} e.g., "1.000.000"
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text
 * @returns {string}
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string} e.g., "1.5 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Mask email (show first 3 chars and domain)
 * @param {string} email
 * @returns {string} e.g., "abc***@gmail.com"
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  const visibleChars = Math.min(3, localPart.length);
  const masked = localPart.slice(0, visibleChars) + '***';
  
  return `${masked}@${domain}`;
};

/**
 * Mask phone number (show last 3 digits)
 * @param {string} phone
 * @returns {string} e.g., "***789"
 */
export const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length < 3) return phone;
  
  return '***' + cleaned.slice(-3);
};

/**
 * Format OTP countdown timer
 * @param {number} seconds
 * @returns {string} e.g., "02:30"
 */
export const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 * @returns {string} e.g., "85.5%"
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%';
  return value.toFixed(decimals) + '%';
};

/**
 * Parse JWT token (without verification)
 * @param {string} token
 * @returns {object|null}
 */
export const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
};

/**
 * Check if JWT is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
};
