import { VALIDATION_REGEX, ERROR_MESSAGES } from './constants';

/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return ERROR_MESSAGES.REQUIRED.EMAIL;
  }
  if (!VALIDATION_REGEX.EMAIL.test(email)) {
    return ERROR_MESSAGES.INVALID.EMAIL;
  }
  return null;
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return ERROR_MESSAGES.REQUIRED.PHONE;
  }
  if (!VALIDATION_REGEX.PHONE_VN.test(phone)) {
    return ERROR_MESSAGES.INVALID.PHONE;
  }
  return null;
};

/**
 * Validate contact (email or phone)
 * Auto-detect type and validate accordingly
 * @param {string} contact
 * @returns {string|null} Error message or null if valid
 */
export const validateContact = (contact) => {
  if (!contact || !contact.trim()) {
    return ERROR_MESSAGES.REQUIRED.CONTACT;
  }
  
  // Check if it's an email (contains @)
  if (contact.includes('@')) {
    return validateEmail(contact);
  }
  
  // Otherwise treat as phone number
  return validatePhone(contact);
};

/**
 * Validate username
 * @param {string} username
 * @returns {string|null} Error message or null if valid
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return ERROR_MESSAGES.REQUIRED.USERNAME;
  }
  if (!VALIDATION_REGEX.USERNAME.test(username)) {
    return ERROR_MESSAGES.INVALID.USERNAME;
  }
  return null;
};

/**
 * Validate password strength
 * Must contain: uppercase, lowercase, number, special char, min 8 chars
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) {
    return ERROR_MESSAGES.REQUIRED.PASSWORD;
  }
  if (!VALIDATION_REGEX.PASSWORD.test(password)) {
    return ERROR_MESSAGES.INVALID.PASSWORD;
  }
  return null;
};

/**
 * Validate password confirmation
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null} Error message or null if valid
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.REQUIRED.CONFIRM_PASSWORD;
  }
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.INVALID.CONFIRM_PASSWORD;
  }
  return null;
};

/**
 * Validate OTP code
 * @param {string} otp
 * @returns {string|null} Error message or null if valid
 */
export const validateOTP = (otp) => {
  if (!otp || !otp.trim()) {
    return ERROR_MESSAGES.REQUIRED.OTP;
  }
  if (!VALIDATION_REGEX.OTP.test(otp)) {
    return ERROR_MESSAGES.INVALID.OTP;
  }
  return null;
};

/**
 * Get password strength level
 * @param {string} password
 * @returns {object} { strength: 'weak'|'medium'|'strong', percentage: 0-100, message: string }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { strength: 'weak', percentage: 0, message: 'Mật khẩu trống' };
  }
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };
  
  // Calculate score
  if (checks.length) score += 20;
  if (checks.lowercase) score += 20;
  if (checks.uppercase) score += 20;
  if (checks.number) score += 20;
  if (checks.special) score += 20;
  
  // Bonus for length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Determine strength level
  let strength, message;
  if (score < 50) {
    strength = 'weak';
    message = 'Mật khẩu yếu';
  } else if (score < 80) {
    strength = 'medium';
    message = 'Mật khẩu trung bình';
  } else {
    strength = 'strong';
    message = 'Mật khẩu mạnh';
  }
  
  return { strength, percentage: Math.min(score, 100), message };
};

/**
 * Detect contact type (email or phone)
 * @param {string} contact
 * @returns {'email'|'phone'|null}
 */
export const detectContactType = (contact) => {
  if (!contact) return null;
  
  if (contact.includes('@')) {
    return 'email';
  }
  
  if (VALIDATION_REGEX.PHONE_VN.test(contact)) {
    return 'phone';
  }
  
  return null;
};

/**
 * Validate form with Yup schema
 * @param {object} schema - Yup schema
 * @param {object} data - Form data
 * @returns {Promise<{isValid: boolean, errors: object}>}
 */
export const validateWithSchema = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      if (error.path) {
        errors[error.path] = error.message;
      }
    });
    return { isValid: false, errors };
  }
};

/**
 * Sanitize input (remove script tags, trim whitespace)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};
