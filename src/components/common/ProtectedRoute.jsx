import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component bảo vệ routes, yêu cầu authentication và role
 * @param {React.Component} children - Component con cần bảo vệ
 * @param {number} requiredRole - Role yêu cầu (0=ADMIN, 1=SELLER, 2=BUYER)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Đang loading, hiển thị loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  // Chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không có role yêu cầu
  if (requiredRole !== undefined && user?.role !== requiredRole) {
    // Redirect về trang phù hợp với role của user
    if (user?.role === 1) { // SELLER
      return <Navigate to="/seller/dashboard" replace />;
    } else if (user?.role === 2) { // BUYER/CUSTOMER
      return <Navigate to="/customer/home" replace />;
    } else if (user?.role === 0) { // ADMIN
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Có quyền truy cập, hiển thị component
  return children;
};

export default ProtectedRoute;