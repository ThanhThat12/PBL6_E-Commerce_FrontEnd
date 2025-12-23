import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { message } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNotificationContext } from '../../../context/NotificationContext';

/**
 * SellerLayout Component
 * Main layout wrapper for all seller pages
 * Contains sidebar navigation and header
 * Handles WebSocket notifications for sellers
 */
const SellerLayout = () => {
  const [lastNotificationId, setLastNotificationId] = React.useState(null);

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
          case 'REFUND_REQUESTED':  // ✅ Backend sends this type
            message.warning({
              content: latestNotification.message,
              duration: 6,
              style: { marginTop: '20px' }
            });
            break;
          case 'REFUND_APPROVED':
            message.success({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          case 'REFUND_REJECTED':
            message.error({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          case 'PAYMENT_RECEIVED':
            message.success({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
            break;
          default:
            // Show all other notifications as info
            console.log('📢 Unknown notification type:', latestNotification.type);
            message.info({
              content: latestNotification.message,
              duration: 5,
              style: { marginTop: '20px' }
            });
        }

        console.log('🔔 Seller notification displayed:', latestNotification);
      }
    }
  }, [notifications, lastNotificationId]);

  // Log WebSocket connection status
  useEffect(() => {
    if (connected) {
      console.log('✅ Seller WebSocket connected');
    } else {
      console.log('⚠️ Seller WebSocket disconnected');
    }
  }, [connected]);

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
