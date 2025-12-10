import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Automatically use https if page is loaded over https
const WS_URL = window.location.protocol === 'https:' 
  ? 'https://localhost:8081/ws' 
  : 'http://localhost:8081/ws';

/**
 * Custom hook để quản lý notifications với WebSocket
 * Subscribe to /topic/orderws/{userId} for buyers
 * Subscribe to /topic/sellerws/{sellerId} for sellers
 * 
 * @param {number} userId - User ID
 * @param {string} role - User role: 'BUYER' or 'SELLER' (default: 'BUYER')
 */
export function useNotifications(userId, role = 'BUYER') {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [_stompClient, setStompClient] = useState(null); // eslint-disable-line no-unused-vars

  // Load notifications from localStorage
  useEffect(() => {
    if (userId) {
      const storageKey = `notifications_${role}_${userId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    }
  }, [userId, role]);

  // Save notifications to localStorage
  useEffect(() => {
    if (userId && notifications.length > 0) {
      const storageKey = `notifications_${role}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [userId, role, notifications]);

  // Connect to WebSocket
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping WebSocket connection');
      return;
    }

    // Determine channel based on role
    const channelPrefix = role === 'SELLER' ? 'sellerws' : 'orderws';
    const channel = `/topic/${channelPrefix}/${userId}`;
    const connectionId = Math.random().toString(36).substr(2, 9);

    console.log(`🔌 [${role}] [${connectionId}] Connecting to WebSocket for user:`, userId);
    console.log('🔌 WebSocket URL:', WS_URL);
    console.log('🔌 Will subscribe to:', channel);
    
    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    let subscription = null;

    // Disable debug logs in production
    client.debug = (str) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('STOMP:', str);
      }
    };

    client.connect(
      {},
      () => {
        console.log(`✅ [${role}] [${connectionId}] WebSocket connected`);
        setIsConnected(true);
        setStompClient(client);

        // Subscribe to notification channel
        console.log(`📡 [${connectionId}] Subscribing to channel:`, channel);
        
        subscription = client.subscribe(
          channel,
          (message) => {
            try {
              const notification = JSON.parse(message.body);
              console.log(`📬 [${connectionId}] Received notification:`, notification);
              console.log(`   Type: ${notification.type}, Message: ${notification.message}`);

              // Add notification to list (avoid duplicates)
              const now = Date.now();
              const newNotification = {
                id: `${now}_${Math.random()}`, // Unique ID
                ...notification,
                read: false,
                timestamp: now, // Add timestamp in milliseconds for timeAgo calculation
                receivedAt: new Date().toISOString() // Add received timestamp
              };

              setNotifications((prev) => {
                // Check if notification already exists (by message and type)
                const isDuplicate = prev.some(n => 
                  n.message === newNotification.message && 
                  n.type === newNotification.type &&
                  // Check if received within last 2 seconds (handle rapid duplicates)
                  n.receivedAt && Math.abs(new Date(n.receivedAt) - new Date(newNotification.receivedAt)) < 2000
                );
                
                if (isDuplicate) {
                  console.log(`⚠️ [${connectionId}] Duplicate notification detected, skipping`);
                  return prev;
                }
                
                console.log(`✅ [${connectionId}] Adding new notification`);
                return [newNotification, ...prev];
              });

              // NOTE: Toast notifications are now handled by the parent components
              // (SellerLayout for sellers, buyer pages for buyers) to avoid duplicates
              
              // Play notification sound (optional)
              playNotificationSound();
            } catch (error) {
              console.error(`❌ [${connectionId}] Error parsing notification:`, error);
            }
          }
        );
      },
      (error) => {
        console.error(`❌ [${connectionId}] WebSocket connection error:`, error);
        setIsConnected(false);
      }
    );

    // Cleanup on unmount or dependency change
    return () => {
      console.log(`🔌 [${connectionId}] Cleaning up WebSocket connection`);
      
      if (subscription) {
        subscription.unsubscribe();
        console.log(`📡 [${connectionId}] Unsubscribed from channel`);
      }
      
      if (client && client.connected) {
        client.disconnect(() => {
          console.log(`🔌 [${connectionId}] WebSocket disconnected`);
        });
      }
    };
  }, [userId, role]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    if (userId) {
      const storageKey = `notifications_${role}_${userId}`;
      localStorage.removeItem(storageKey);
    }
  }, [userId, role]);

  // Delete single notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  return {
    notifications,
    connected: isConnected, // Alias for compatibility
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

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
