
import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getAccessToken } from '../utils/storage';

// Automatically use https if page is loaded over https
const WS_URL = `${process.env.REACT_APP_API_URL_WS}`;

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
    const channelPrefix = role === 'SELLER' ? 'sellerws' : role === 'ADMIN' ? 'admin' : 'orderws';
    const channel = `/topic/${channelPrefix}/${userId}`;
    const connectionId = Math.random().toString(36).substr(2, 9);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔌 [${role}] [${connectionId}] INITIATING WEBSOCKET CONNECTION`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: ${role}`);
    console.log(`   Channel: ${channel}`);
    console.log(`   WebSocket URL: ${WS_URL}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const token = getAccessToken();
    if (!token) {
      console.error(`❌ [${connectionId}] No auth token found! WebSocket may fail to connect.`);
    } else {
      console.log(`🔑 [${connectionId}] Auth token found (length: ${token.length})`);
    }

    const socketUrlWithToken = token ? `${WS_URL}?token=${token}` : WS_URL;
    const socket = new SockJS(socketUrlWithToken);
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
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✅ [${role}] [${connectionId}] WEBSOCKET CONNECTED SUCCESSFULLY`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        setIsConnected(true);
        setStompClient(client);

        // Subscribe to notification channel
        console.log(`📡 [${connectionId}] Subscribing to channel: ${channel}`);

        try {
          subscription = client.subscribe(
            channel,
            (message) => {
              console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              console.log(`📬 [${role}] [${connectionId}] NOTIFICATION RECEIVED`);
              try {
                const notification = JSON.parse(message.body);
                console.log(`   Type: ${notification.type}`);
                console.log(`   Message: ${notification.message}`);
                console.log(`   Order ID: ${notification.orderId || 'N/A'}`);
                console.log(`   Full notification:`, notification);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

                // Add notification to list (avoid duplicates)
                const now = Date.now();
                const newNotification = {
                  id: notification.id || `${now}_${Math.random()}`, // Use DB id if available
                  ...notification,
                  read: notification.read || notification.isRead || false,
                  timestamp: now, // Add timestamp in milliseconds for timeAgo calculation
                  receivedAt: new Date().toISOString() // Add received timestamp
                };

                setNotifications((prev) => {
                  // Check if notification already exists (by id if available, or message/type)
                  const isDuplicate = prev.some(n => {
                    if (notification.id && n.id) {
                      return n.id === notification.id;
                    }
                    return n.message === newNotification.message &&
                      n.type === newNotification.type &&
                      n.receivedAt &&
                      Math.abs(new Date(n.receivedAt) - new Date(newNotification.receivedAt)) < 2000;
                  });

                  if (isDuplicate) {
                    console.log(`⚠️ [${connectionId}] Duplicate notification detected, skipping`);
                    return prev;
                  }

                  console.log(`✅ [${connectionId}] Adding new notification to list`);
                  return [newNotification, ...prev];
                });

                // NOTE: Toast notifications are now handled by the parent components
                // (SellerLayout for sellers, buyer pages for buyers) to avoid duplicates

                // Play notification sound (optional)
                playNotificationSound();
              } catch (error) {
                console.error(`❌ [${connectionId}] Error parsing notification:`, error);
                console.error(`   Raw message:`, message.body);
              }
            }
          );
          console.log(`✅ [${connectionId}] Successfully subscribed to ${channel}`);
        } catch (error) {
          console.error(`❌ [${connectionId}] Failed to subscribe to channel:`, error);
        }
      },
      (error) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.error(`❌ [${role}] [${connectionId}] WEBSOCKET CONNECTION ERROR`);
        console.error(`   Error:`, error);
        console.error(`   User ID: ${userId}`);
        console.error(`   Channel: ${channel}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        setIsConnected(false);
      }
    );

    // Cleanup on unmount or dependency change
    return () => {
      console.log(`🔌 [${connectionId}] Cleaning up WebSocket connection for ${role}`);

      if (subscription) {
        subscription.unsubscribe();
        console.log(`📡 [${connectionId}] Unsubscribed from ${channel}`);
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
