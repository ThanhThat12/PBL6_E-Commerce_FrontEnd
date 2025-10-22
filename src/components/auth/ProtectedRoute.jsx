import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loading from '../common/Loading';
import { ROUTES } from '../../utils/constants';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * 
 * @param {ReactNode} children - Component to render if authenticated
 * @param {string[]} roles - Required roles (optional)
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return <Loading fullScreen text="Đang kiểm tra quyền truy cập..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;
