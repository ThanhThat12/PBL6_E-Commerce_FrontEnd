import { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { toast } from 'react-toastify';

// Automatically use https if page is loaded over https
const WS_URL = window.location.protocol === 'https:' 
  ? 'https://localhost:8081/ws' 
  : 'http://localhost:8081/ws';

console.log('🌐 Current protocol:', window.location.protocol);
console.log('🔗 WebSocket URL will be:', WS_URL);

/**
 * Custom hook để quản lý notifications với WebSocket
 * Subscribe to /topic/orderws/{userId}
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Load notifications from localStorage
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`notifications_${userId}`);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    }
  }, [userId]);

  // Save notifications to localStorage
  useEffect(() => {
    if (userId && notifications.length > 0) {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }
  }, [userId, notifications]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping WebSocket connection');
      return;
    }

    // Clear any existing connection
    if (stompClientRef.current?.connected) {
      console.log('🔌 Already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket for user:', userId);
    console.log('🔌 WebSocket URL:', WS_URL);
    
    try {
      const socket = new SockJS(WS_URL);
      const client = Stomp.over(socket);

      // Enable debug in development
      client.debug = (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP:', str);
        }
      };

      // Set reconnect delay
      client.reconnectDelay = 5000;

      client.connect(
        {},
        () => {
          console.log('✅ WebSocket connected successfully');
          setIsConnected(true);
          stompClientRef.current = client;

          // Subscribe to user's notification channel
          const channel = `/topic/orderws/${userId}`;
          console.log('📡 Subscribing to channel:', channel);
          
          subscriptionRef.current = client.subscribe(
            channel,
            (message) => {
              try {
                console.log('📬 Raw message received:', message.body);
                const notification = JSON.parse(message.body);
                console.log('📬 Parsed notification:', notification);

                // Add notification to list
                const newNotification = {
                  id: Date.now(),
                  ...notification,
                  read: false,
                  timestamp: new Date().toISOString(),
                };

                setNotifications((prev) => [newNotification, ...prev]);

                // Show toast notification
                const emoji = getEmojiForType(notification.type);
                toast.info(
                  <div>
                    <span className="text-lg mr-2">{emoji}</span>
                    {notification.message}
                  </div>,
                  {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  }
                );

                playNotificationSound();
              } catch (error) {
                console.error('❌ Error parsing notification:', error);
              }
            },
            (error) => {
              console.error('❌ Subscription error:', error);
            }
          );

          console.log('✅ Subscribed to:', channel);
        },
        (error) => {
          console.error('❌ WebSocket connection error:', error);
          setIsConnected(false);
          
          // Retry connection after 5 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Retrying WebSocket connection...');
            connectWebSocket();
          }, 5000);
        }
      );
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [userId]);

  // Connect on mount
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
      
      if (stompClientRef.current?.connected) {
        try {
          stompClientRef.current.disconnect(() => {
            console.log('🔌 WebSocket disconnected');
          });
        } catch (error) {
          console.error('Error disconnecting:', error);
        }
      }
    };
  }, [connectWebSocket]);

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
      localStorage.removeItem(`notifications_${userId}`);
    }
  }, [userId]);

  // Delete single notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

// Helper functions
function getEmojiForType(type) {
  const emojiMap = {
    ORDER_CONFIRMED: '✅',
    ORDER_SHIPPING: '🚚',
    ORDER_COMPLETED: '🎉',
    ORDER_CANCELLED: '❌',
    ORDER_STATUS_UPDATE: '📋',
    PAYMENT_UPDATE: '💳',
    REFUND_UPDATE: '💰',
  };
  return emojiMap[type] || '🔔';
}

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