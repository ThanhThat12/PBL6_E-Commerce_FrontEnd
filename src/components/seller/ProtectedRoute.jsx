import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component for Seller Module
 * Kiểm tra authentication và role = SELLER (hoặc ADMIN) trước khi render children
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Component cần protect
 * @param {string|number} props.requiredRole - Role yêu cầu (mặc định: "SELLER" hoặc 1)
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, requiredRole = 'SELLER' }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role - ADMIN có thể access tất cả
  const isAdmin = hasRole('ADMIN') || hasRole(0);
  const hasRequiredRole = hasRole(requiredRole);

  if (!isAdmin && !hasRequiredRole) {
    // User không có quyền - redirect về home hoặc unauthorized page
    return <Navigate to="/" replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
};

export default ProtectedRoute;
