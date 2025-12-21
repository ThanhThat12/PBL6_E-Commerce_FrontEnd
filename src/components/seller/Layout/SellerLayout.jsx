import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNotificationContext } from '../../../context/NotificationContext';
import { getRegistrationStatus } from '../../../services/seller/shopService';

/**
 * SellerLayout Component
 * Main layout wrapper for all seller pages
 * Contains sidebar navigation and header
 * Handles WebSocket notifications for sellers
 * Guards against REJECTED shop status
 */
const SellerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Get notifications from shared WebSocket connection
  const { notifications, connected } = useNotificationContext();

  // Handle incoming notifications - only show NEW notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]; // Newest is at index 0
      
      // Only show if it's a new notification (not seen before)
      if (latestNotification.id !== lastNotificationId) {
        setLastNotificationId(latestNotification.id);
        
        // Show notification based on type
        switch (latestNotification.type) {
          case 'NEW_ORDER':
            message.success({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          case 'ORDER_PAID':
            message.info({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          case 'ORDER_COMPLETED':
            message.success({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          case 'RETURN_REQUESTED':
            message.warning({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          default:
            message.info({
              content: latestNotification.message,
              duration: 4,
              style: { marginTop: '20px' }
            });
        }
        
        console.log('🔔 Seller notification displayed:', latestNotification);
      }
    }
  }, [notifications, lastNotificationId]);

  // Check shop registration status on mount
  useEffect(() => {
    const checkShopStatus = async () => {
      // Skip check if already on rejection page
      if (location.pathname === '/seller/registration-rejected') {
        setCheckingStatus(false);
        return;
      }

      try {
        const statusData = await getRegistrationStatus();
        console.log('Shop registration status:', statusData);

        // If shop is REJECTED, redirect to rejection page
        if (statusData.status === 'REJECTED') {
          navigate('/seller/registration-rejected', {
            state: {
              rejectionReason: statusData.rejectionReason,
              reviewedAt: statusData.reviewedAt,
              shopName: statusData.shopName
            },
            replace: true
          });
        }
      } catch (error) {
        console.error('Failed to check shop status:', error);
        // Allow access if status check fails (don't block seller)
      } finally {
        setCheckingStatus(false);
      }
    };

    checkShopStatus();
  }, [navigate, location.pathname]);

  // Log WebSocket connection status
  useEffect(() => {
    if (connected) {
      console.log('✅ Seller WebSocket connected');
    } else {
      console.log('⚠️ Seller WebSocket disconnected');
    }
  }, [connected]);

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - fixed left */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
