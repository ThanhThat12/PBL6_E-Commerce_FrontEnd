import { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { notificationService } from '../services/notificationService';
import { getAccessToken } from '../utils/storage';

// Helper function to generate unique connection ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// WebSocket URL
const WS_URL = process.env.REACT_APP_WS_URL || 'https://localhost:8081/ws';

export const useNotifications = (userId, role = 'BUYER') => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const stompClient = useRef(null);
  const connectionId = useRef(generateId());

  // ✅ Load notifications từ DB khi component mount hoặc role thay đổi
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`📥 [RELOAD] Loading notifications for userId: ${userId}, role: ${role}...`);
        const data = await notificationService.getNotifications();
        
        console.log(`📥 [RELOAD] Received ${data?.length || 0} notifications from API:`, data);
        
        if (Array.isArray(data)) {
          // ✅ Filter notifications theo role
          // BUYER: ORDER_CONFIRMED, ORDER_SHIPPING, ORDER_DELIVERED, ORDER_CANCELLED
          // SELLER: ORDER_PLACED (có đơn hàng mới)
          const filteredData = data.filter(n => {
            if (role === 'SELLER') {
              // Seller chỉ thấy notification về đơn hàng mới từ buyer
              // ✅ Backend gửi NEW_ORDER (không phải ORDER_PLACED)
              const match = n.type === 'NEW_ORDER' || 
                           n.type === 'ORDER_PLACED' || 
                           n.type === 'ORDER_CANCELLED' ||
                           n.type === 'PAYMENT_RECEIVED' ||
                           n.type === 'ORDER_COMPLETED';
              console.log(`📥 [FILTER] Notification ${n.id} (${n.type}): ${match ? '✅ KEEP' : '❌ REMOVE'}`);
              return match;
            } else {
              // Buyer thấy notification về trạng thái đơn hàng của mình
              const match = n.type === 'ORDER_CONFIRMED' || 
                     n.type === 'ORDER_SHIPPING' || 
                     n.type === 'ORDER_DELIVERED' ||
                     n.type === 'ORDER_CANCELLED';
              console.log(`📥 [FILTER] Notification ${n.id} (${n.type}): ${match ? '✅ KEEP' : '❌ REMOVE'}`);
              return match;
            }
          });
          
          console.log(`📥 [RELOAD] After filter: ${filteredData.length}/${data.length} notifications kept for ${role}`);
          setNotifications(filteredData);
          const unread = filteredData.filter(n => !n.read).length;
          setUnreadCount(unread);
          console.log(`✅ [RELOAD] Final state: ${filteredData.length} notifications (${unread} unread)`);
        }
      } catch (error) {
        console.error('❌ Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [userId, role]); // ✅ Re-load khi role thay đổi

  // ✅ Kết nối WebSocket để nhận realtime notifications
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId - skipping WebSocket connection');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.log('⚠️ No access token - skipping WebSocket connection');
      return;
    }

    console.log(`🔌 [${role.toUpperCase()}] [${connectionId.current}] Connecting to WebSocket for user: ${userId}`);
    console.log(`🔌 WebSocket URL: ${WS_URL}`);

    const channelMap = {
      'BUYER': `/topic/orderws/${userId}`,
      'SELLER': `/topic/sellerws/${userId}`,
      'ADMIN': `/topic/admin/${userId}`
    };
    const channel = channelMap[role] || `/topic/orderws/${userId}`;
    console.log(`🔌 Will subscribe to: ${channel}`);

    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);

    client.debug = (str) => {
      console.log(`STOMP: ${str}`);
    };

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log(`✅ [${role.toUpperCase()}] [${connectionId.current}] WebSocket connected`);
        console.log(`📡 [${connectionId.current}] Subscribing to channel: ${channel}`);

        client.subscribe(channel, (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log(`📬 [${connectionId.current}] Received notification:`, notification);

            // ✅ Thêm notification mới vào đầu danh sách
            setNotifications(prev => [notification, ...prev]);
            
            // ✅ Tăng unread count nếu notification chưa đọc
            if (!notification.read) {
              setUnreadCount(prev => prev + 1);
            }

            console.log(`✅ [${connectionId.current}] Notification added to state`);
          } catch (error) {
            console.error(`❌ [${connectionId.current}] Failed to parse notification:`, error);
          }
        });
      },
      (error) => {
        console.error(`❌ [${connectionId.current}] WebSocket connection error:`, error);
      }
    );

    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        console.log(`🔌 [${connectionId.current}] Disconnecting WebSocket...`);
        stompClient.current.disconnect();
      }
    };
  }, [userId, role]);

  // ✅ Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
    }
  }, []);

  // ✅ Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    }
  }, []);

  // ✅ Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
      
      console.log(`✅ Deleted notification ${notificationId}`);
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
    }
  }, []);

  // ✅ Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      
      setNotifications([]);
      setUnreadCount(0);
      
      console.log('✅ Cleared all notifications');
    } catch (error) {
      console.error('❌ Failed to clear notifications:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};

// Helper functions
function playNotificationSound() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch((error) => {
      // Ignore errors (e.g., user hasn't interacted with page yet)
      console.log('Cannot play notification sound:', error.message);
    });
  } catch (error) {
    // Sound not available
  }
}

export default useNotifications;
