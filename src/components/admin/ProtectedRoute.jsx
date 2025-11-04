import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');

        // Nếu không có token hoặc user, không authenticated
        if (!adminToken || !adminUser) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // TODO: Khi có API, thay đổi phần này để verify token với backend
        // const response = await axios.get('/api/admin/verify', {
        //   headers: { Authorization: `Bearer ${adminToken}` }
        // });
        // 
        // if (response.data.valid) {
        //   setIsAuthenticated(true);
        // } else {
        //   // Token không hợp lệ, xóa khỏi localStorage
        //   localStorage.removeItem('adminToken');
        //   localStorage.removeItem('adminUser');
        //   setIsAuthenticated(false);
        // }

        // Tạm thời: Chỉ kiểm tra có token và user trong localStorage
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error('Auth verification error:', error);
        // Nếu có lỗi (network, token expired, etc.), clear localStorage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Hiển thị loading trong khi đang verify
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Verifying authentication...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Nếu không authenticated, redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Nếu authenticated, render component được bảo vệ
  return children;
};

export default ProtectedRoute;
