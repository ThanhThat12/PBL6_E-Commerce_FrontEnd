import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { getRegistrationStatus } from '../../services/seller/shopService';

/**
 * SellerRegistrationGuard
 * Route guard cho seller registration flow
 * Tự động điều hướng user đến trang phù hợp dựa trên registration status
 * 
 * Flow:
 * - SELLER/ADMIN → /seller/dashboard
 * - BUYER + no registration → /seller/register (show form)
 * - BUYER + PENDING → /seller/registration-status (waiting)
 * - BUYER + REJECTED → /seller/rejected (show reason + edit button)
 * - BUYER + ACTIVE → Upgrade to SELLER → /seller/dashboard
 */
const SellerRegistrationGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRoute = async () => {
      if (!user) {
        // Not logged in → redirect to login
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
        return;
      }

      // SELLER or ADMIN → go directly to dashboard
      if (hasRole('SELLER') || hasRole('ADMIN')) {
        if (location.pathname === '/seller/register') {
          navigate('/seller/dashboard', { replace: true });
        }
        setLoading(false);
        return;
      }

      // Check if user is editing their rejected registration
      // Support both navigation state and ?mode=edit query param
      const searchParams = new URLSearchParams(location.search);
      const isEditingQuery = searchParams.get('mode') === 'edit';
      const isEditingMode = location.state?.isEditing === true || isEditingQuery;
      if (isEditingMode && location.pathname === '/seller/register') {
        console.log('📝 Edit mode detected - showing registration form');
        setLoading(false);
        return;
      }

      // BUYER → check registration status
      try {
        const status = await getRegistrationStatus();

        console.log('📋 Registration status:', status.status);

        // Route based on status
        switch (status.status) {
          case 'ACTIVE':
            // Shop active but user still BUYER role (shouldn't happen, but handle it)
            console.warn('⚠️ Shop ACTIVE but user is BUYER - redirecting to dashboard');
            navigate('/seller/dashboard', { replace: true });
            break;

          case 'PENDING':
            // Show pending status page
            if (location.pathname !== '/seller/registration-status') {
              navigate('/seller/registration-status', { replace: true });
            }
            break;

          case 'REJECTED':
            // Show rejection page (user must click Edit to go to form)
            if (location.pathname !== '/seller/rejected') {
              navigate('/seller/rejected', { 
                replace: true,
                state: {
                  rejectionReason: status.rejectionReason,
                  shopName: status.shopName,
                  reviewedAt: status.reviewedAt
                }
              });
            }
            break;

          default:
            // Unknown status → show registration form
            if (location.pathname !== '/seller/register') {
              navigate('/seller/register', { replace: true });
            }
        }
      } catch (error) {
        // No registration found (404) → show registration form
        console.log('📝 No registration found, showing registration form');
        if (location.pathname !== '/seller/register') {
          navigate('/seller/register', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAndRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasRole, navigate, location.pathname, location.search, location.state?.isEditing]);

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái đăng ký...</p>
        </div>
      </div>
    );
  }

  // Render children when routing is complete
  return <>{children}</>;
};

export default SellerRegistrationGuard;
