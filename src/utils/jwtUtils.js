/**
 * JWT Utility Functions
 * Xử lý decode JWT token và mapping role
 */

/**
 * Decode JWT token manually (không cần thư viện external)
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

  const auth = authorities.toUpperCase();
  
  switch (auth) {
    case 'ADMIN':
      return 0;
    case 'SELLER':
      return 1;
    case 'BUYER':
    case 'CUSTOMER':
      return 2;
    default:
      console.warn('Unknown authorities:', authorities);
      return null;
  }
};

/**
 * Extract user info từ JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - User object với id, username, role
 */
export const extractUserFromToken = (token) => {
  try {
    const payload = decodeJWTToken(token);
    
    if (!payload) {
      return null;
    }

    console.log('JWT Payload:', payload);

    // Extract thông tin từ payload
    const username = payload.sub; // Subject thường là username
    const authorities = payload.authorities;
    
    // Backend có thể trả về userId hoặc id hoặc trong các field khác
    const userId = payload.userId || payload.id || payload.user_id || username;
    
    // Map authorities thành role number
    const role = mapAuthoritiesToRole(authorities);

    if (role === null) {
      console.error('Cannot map authorities to role:', authorities);
      return null;
    }

    const user = {
      id: userId,
      username: username,
      role: role,
      authorities: authorities, // Giữ lại để debug
      // Có thể thêm các field khác nếu JWT có
      email: payload.email,
      name: payload.name || payload.fullName || username,
    };

    console.log('Extracted user:', user);
    
    return user;
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};

/**
 * Kiểm tra token có hợp lệ và chưa hết hạn không
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token hợp lệ
 */
export const isTokenValid = (token) => {
  try {
    const payload = decodeJWTToken(token);
    
    if (!payload) {
      return false;
    }

    // Kiểm tra expiration time
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        console.log('Token expired');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get role name từ role number
 * @param {number} role - Role number
 * @returns {string} - Role name
 */
export const getRoleName = (role) => {
  switch (role) {
    case 0:
      return 'ADMIN';
    case 1:
      return 'SELLER';
    case 2:
      return 'BUYER';
    default:
      return 'UNKNOWN';
  }
};