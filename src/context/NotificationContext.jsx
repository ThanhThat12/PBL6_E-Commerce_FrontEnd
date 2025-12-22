import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import useChatNotifications from '../hooks/useChatNotifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

/**
 * NotificationProvider - Single source of truth for WebSocket notifications
 * Only ONE WebSocket connection per user, shared across all components
 * Combines order notifications and chat notifications
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  console.log('NotificationProvider render - user:', user?.id, user?.role);
  
  // ✅ Determine role based on CURRENT PAGE or user.role
  // If on admin pages → role = ADMIN
  // If on seller pages → role = SELLER
  // Otherwise → role = BUYER (even if user is a seller buying products)
  const role = useMemo(() => {
    console.log('🔍 [NotificationContext] Determining role - pathname:', location.pathname);
    if (location.pathname.startsWith('/admin')) {
      console.log('✅ [NotificationContext] Role: ADMIN');
      return 'ADMIN';
    }
    if (location.pathname.startsWith('/seller')) {
      console.log('✅ [NotificationContext] Role: SELLER');
      return 'SELLER';
    }
    console.log('✅ [NotificationContext] Role: BUYER (default)');
    return 'BUYER';
  }, [location.pathname]);
  
  const userId = useMemo(() => user?.id, [user?.id]);
  
  console.log('NotificationProvider - userId:', userId, 'role:', role);
  
  // Order notifications WebSocket connection
  const notificationData = useNotifications(userId, role);

  // Chat notifications WebSocket connection
  const chatNotificationData = useChatNotifications(userId);

  console.log('NotificationContext - Chat unread:', chatNotificationData.unreadCount, 'Latest message:', chatNotificationData.latestMessage);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // Combine order notifications with chat notification
    const allNotifications = [...notificationData.notifications];
    
    // Add chat notification if there are unread messages
    if (chatNotificationData.unreadCount > 0) {
      // If we have latest message from WebSocket, show it
      if (chatNotificationData.latestMessage) {
        allNotifications.unshift({
          id: `chat-${chatNotificationData.latestMessage.id}`,
          type: 'CHAT_MESSAGE',
          message: `${chatNotificationData.latestMessage.senderName}: ${chatNotificationData.latestMessage.content}`,
          conversationId: chatNotificationData.latestMessage.conversationId,
          timestamp: new Date(chatNotificationData.latestMessage.createdAt).getTime(),
          read: false
        });
      } else {
        // Otherwise show generic notification
        allNotifications.unshift({
          id: 'chat-unread',
          type: 'CHAT_MESSAGE',
          message: `Bạn có ${chatNotificationData.unreadCount} tin nhắn chưa đọc`,
          conversationId: null,
          timestamp: Date.now(),
          read: false
        });
      }
    }

    console.log('NotificationContext - Total unread:', notificationData.unreadCount + chatNotificationData.unreadCount);

    return {
      notifications: allNotifications,
      connected: notificationData.connected && chatNotificationData.connected,
      unreadCount: notificationData.unreadCount + chatNotificationData.unreadCount,
      chatUnreadCount: chatNotificationData.unreadCount,
      orderUnreadCount: notificationData.unreadCount,
      markAsRead: notificationData.markAsRead,
      markAllAsRead: notificationData.markAllAsRead,
      clearAll: notificationData.clearAll,
      deleteNotification: notificationData.deleteNotification,
      refreshChatCount: chatNotificationData.refreshCount,
      resetChatUnread: chatNotificationData.resetUnreadCount
    };
  }, [
    notificationData.notifications,
    notificationData.connected,
    notificationData.unreadCount,
    notificationData.markAsRead,
    notificationData.markAllAsRead,
    notificationData.clearAll,
    notificationData.deleteNotification,
    chatNotificationData.unreadCount,
    chatNotificationData.latestMessage,
    chatNotificationData.connected,
    chatNotificationData.refreshCount,
    chatNotificationData.resetUnreadCount
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notifications from any component
 * No need to create multiple WebSocket connections
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;