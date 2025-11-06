import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

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
const ProtectedRouteAdmin = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('adminToken'); // ← Admin token
        const userStr = localStorage.getItem('adminUser'); // ← Admin user data
        
        if (!token || !userStr) {
          console.log('🔒 [ProtectedRoute] No adminToken or adminUser found');
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Parse user data
        const user = JSON.parse(userStr);
        
        // Check if user has ADMIN role
        if (user.role !== 'ADMIN') {
          console.log('🔒 [ProtectedRoute] User is not ADMIN:', user.role);
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        console.log('✅ [ProtectedRoute] User authenticated as ADMIN:', user.username);
        setIsAuthenticated(true);
        setIsChecking(false);
        
      } catch (error) {
        console.error('🔒 [ProtectedRoute] Error checking auth:', error);
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Checking authentication...
      </div>
    );
  }

  // Redirect to LOGIN page if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 [ProtectedRoute] Redirecting to login page');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRouteAdmin;
