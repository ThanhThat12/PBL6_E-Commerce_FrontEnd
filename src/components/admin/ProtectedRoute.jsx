import React from 'react';

/**
 * ProtectedRoute - Tạm thời TẮT authentication check
 * 
 * ⚠️ CHÚ Ý: Frontend không có authentication check
 * 🔐 Bảo mật thật được xử lý ở BACKEND:
 *    - JWT Filter verify token
 *    - @PreAuthorize("hasRole('ADMIN')") trên mỗi endpoint
 *    - Return 401/403 nếu không hợp lệ
 * 
 * 📱 Mobile app sẽ dùng cùng backend API này
 * 
 * 💡 Frontend chỉ cần:
 *    - Gửi token trong header: Authorization: Bearer <token>
 *    - Handle 401/403 errors từ backend
 *    - Redirect to login khi nhận 401/403
 */
const ProtectedRoute = ({ children }) => {
  // 🔓 Bỏ authentication check - cho phép truy cập tất cả admin pages
  // Backend sẽ chặn khi call API nếu chưa login hoặc không phải admin
  return children;
};

export default ProtectedRoute;
