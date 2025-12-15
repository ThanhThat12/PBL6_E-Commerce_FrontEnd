import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNotificationContext } from '../context/NotificationContext';

/**
 * Custom hook to handle shop registration notifications
 * Shows toast notifications only - navigation handled by SellerRegistrationGuard
 */
export function useShopRegistrationNotifications() {
  const { notifications } = useNotificationContext();

  // Track processed notifications to avoid duplicate handling
  const processedNotifications = useCallback(
    (() => {
      const set = new Set();
      return {
        has: (id) => set.has(id),
        add: (id) => set.add(id)
      };
    })(),
    []
  );

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Check for shop registration notifications
    notifications.forEach(notification => {
      // Skip if already processed
      if (processedNotifications.has(notification.id)) {
        return;
      }

      // Mark as processed
      processedNotifications.add(notification.id);

      // Handle SHOP_APPROVED notification
      if (notification.type === 'SHOP_APPROVED') {
        console.log('🎉 Shop approved notification received:', notification);
        
        // Show success toast
        toast.success(
          notification.message || '🎉 Đơn đăng ký shop đã được phê duyệt! Chuyển đến trang quản lý...',
          {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: 'white',
              fontWeight: 'bold',
              padding: '16px',
            },
            icon: '🎉'
          }
        );

        // Reload page to refresh user role and trigger guard
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

      // Handle SHOP_REJECTED notification  
      else if (notification.type === 'SHOP_REJECTED') {
        console.log('❌ Shop rejected notification received:', notification);
        
        // Show error toast with rejection reason
        const message = notification.message || 
          `❌ Đơn đăng ký shop bị từ chối${notification.rejectionReason ? ': ' + notification.rejectionReason : ''}`;
        
        toast.error(message, {
          duration: 0, // Don't auto-dismiss - user needs to read
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: 'bold',
            padding: '16px',
            maxWidth: '600px'
          },
          icon: '❌'
        });

        // Show action toast after delay
        setTimeout(() => {
          toast('👉 Click vào thông báo hoặc nút "Kênh người bán" để xem chi tiết và chỉnh sửa đơn', {
            duration: 8000,
            position: 'top-center',
            style: {
              background: '#3b82f6',
              color: 'white',
              padding: '12px',
            }
          });
        }, 1500);
      }
    });
  }, [notifications, processedNotifications]);
}

export default useShopRegistrationNotifications;
