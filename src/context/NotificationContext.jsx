import React, { createContext, useContext, useMemo } from 'react';
import useNotifications from '../hooks/useNotifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

/**
 * NotificationProvider - Single source of truth for WebSocket notifications
 * Only ONE WebSocket connection per user, shared across all components
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Determine role based on user data - memoize to prevent re-calculation
  const role = useMemo(() => user?.role === 'SELLER' ? 'SELLER' : 'BUYER', [user?.role]);
  const userId = useMemo(() => user?.id, [user?.id]);
  
  // Single WebSocket connection for the entire app
  const notificationData = useNotifications(userId, role);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    notifications: notificationData.notifications,
    connected: notificationData.connected,
    unreadCount: notificationData.unreadCount,
    markAsRead: notificationData.markAsRead,
    markAllAsRead: notificationData.markAllAsRead,
    clearAll: notificationData.clearAll,
    deleteNotification: notificationData.deleteNotification
  }), [
    notificationData.notifications,
    notificationData.connected,
    notificationData.unreadCount,
    notificationData.markAsRead,
    notificationData.markAllAsRead,
    notificationData.clearAll,
    notificationData.deleteNotification
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
