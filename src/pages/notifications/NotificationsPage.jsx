import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * NotificationsPage - Trang xem tất cả thông báo
 */
export default function NotificationsPage() {
  const { user } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    clearAll,
    deleteNotification,
    unreadCount 
  } = useNotifications(user?.id);

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours, show relative time
    if (diff < 86400000) {
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      
      if (minutes < 1) return 'Vừa xong';
      if (minutes < 60) return `${minutes} phút trước`;
      return `${hours} giờ trước`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    const iconMap = {
      ORDER_CONFIRMED: '✅',
      ORDER_SHIPPING: '🚚',
      ORDER_COMPLETED: '🎉',
      ORDER_CANCELLED: '❌',
      ORDER_STATUS_UPDATE: '📋',
    };
    return iconMap[type] || '🔔';
  };

  // Get badge color for notification type
  const getBadgeColor = (type) => {
    const colorMap = {
      ORDER_CONFIRMED: 'bg-blue-100 text-blue-800',
      ORDER_SHIPPING: 'bg-purple-100 text-purple-800',
      ORDER_COMPLETED: 'bg-green-100 text-green-800',
      ORDER_CANCELLED: 'bg-red-100 text-red-800',
      ORDER_STATUS_UPDATE: 'bg-gray-100 text-gray-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getBadgeText = (type) => {
    const textMap = {
      ORDER_CONFIRMED: 'Đã xác nhận',
      ORDER_SHIPPING: 'Đang giao',
      ORDER_COMPLETED: 'Hoàn thành',
      ORDER_CANCELLED: 'Đã hủy',
      ORDER_STATUS_UPDATE: 'Cập nhật',
    };
    return textMap[type] || 'Thông báo';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem thông báo</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BellIcon className="w-8 h-8 text-primary-600" />
                Thông báo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo chưa đọc'}
              </p>
            </div>
            
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BellIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không có thông báo nào</p>
            <p className="text-gray-400 text-sm mt-2">
              Thông báo về đơn hàng của bạn sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  bg-white
                  rounded-lg
                  shadow-md
                  p-6
                  transition-all
                  hover:shadow-lg
                  ${!notification.read ? 'border-l-4 border-blue-500' : ''}
                `}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-3xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(notification.type)}`}>
                        {getBadgeText(notification.type)}
                      </span>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa thông báo"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className={`text-base ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.cancelReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Lý do: {notification.cancelReason}
                      </p>
                    )}
                    
                    {notification.orderId && (
                      <Link
                        to={`/orders/${notification.orderId}`}
                        className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                      >
                        → Xem chi tiết đơn hàng #{notification.orderId}
                      </Link>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
