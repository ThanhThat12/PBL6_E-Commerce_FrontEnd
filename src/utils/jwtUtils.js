/**
 * JWT Utility Functions
 * Decode JWT token và extract user info (role, username, email)
 */

/**
 * Decode JWT token manually (không cần thư viện jwt-decode cho trường hợp đơn giản)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload hoặc null nếu invalid
 */
export const decodeJWTToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT có format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64 payload (phần thứ 2)
    const payload = parts[1];
    
    // Thêm padding nếu cần
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);
    
    return parsedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Map authorities string to role number
 * @param {string} authorities - Authorities từ JWT (VD: "SELLER", "ADMIN", "BUYER")
 * @returns {number} - Role number (0=ADMIN, 1=SELLER, 2=BUYER)
 */
export const mapAuthoritiesToRole = (authorities) => {
  if (!authorities || typeof authorities !== 'string') {
    return null;
  }

  const roleMap = {
    'ADMIN': 0,
    'SELLER': 1,
    'BUYER': 2,
  };

  return roleMap[authorities.toUpperCase()] ?? null;
};

/**
 * Kiểm tra token còn hợp lệ không (chưa expired)
 * @param {string} token - JWT token
 * @returns {boolean}
 */
export const isTokenValid = (token) => {
  const decoded = decodeJWTToken(token);
  if (!decoded || !decoded.exp) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};

/**
 * Extract user info từ JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - {username, email, role, authorities}
 */
export const extractUserFromToken = (token) => {
  const decoded = decodeJWTToken(token);
  if (!decoded) {
    return null;
  }

  return {
    username: decoded.sub, // JWT standard: "sub" = username
    email: decoded.email || null,
    authorities: decoded.authorities || null,
    role: mapAuthoritiesToRole(decoded.authorities),
    exp: decoded.exp,
    iat: decoded.iat,
  };
};

/**
 * Get role name từ role number
 * @param {number} role - Role number (0, 1, 2)
 * @returns {string} - Role name
 */
export const getRoleName = (role) => {
  const roleNames = {
    0: 'ADMIN',
    1: 'SELLER',
    2: 'BUYER',
  };
  return roleNames[role] || 'UNKNOWN';
};

/**
 * Check if user has specific role
 * @param {object} user - User object with role property
 * @param {string|number} requiredRole - Required role (can be "SELLER", "ADMIN", "BUYER" or 0, 1, 2)
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  if (!user) return false;
  
  // requiredRole có thể là string ("SELLER") hoặc number (1)
  if (typeof requiredRole === 'string') {
    return user.authorities === requiredRole.toUpperCase();
  }
  return user.role === requiredRole;
};
