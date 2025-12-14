import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotificationContext } from '../../../context/NotificationContext';

/**
 * NotificationDropdown - Dropdown thông báo cho seller
 * Hiển thị khi click vào icon chuông
 */
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    unreadCount 
  } = useNotificationContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format time ago
  const timeAgo = (createdAt) => {
    if (!createdAt) return 'Vừa xong';
    
    // Parse ISO string to milliseconds
    const timestamp = new Date(createdAt).getTime();
    if (isNaN(timestamp)) return 'Vừa xong';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return '🛒';
      case 'ORDER_PAID':
        return '💰';
      case 'ORDER_COMPLETED':
        return '🎉';
      case 'RETURN_REQUESTED':
        return '↩️';
      case 'ORDER_CANCELLED':
        return '❌';
      default:
        return '🔔';
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return 'bg-green-50 hover:bg-green-100';
      case 'ORDER_PAID':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'ORDER_COMPLETED':
        return 'bg-green-50 hover:bg-green-100';
      case 'RETURN_REQUESTED':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'ORDER_CANCELLED':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  // Map notification type to order status tab
  const getOrderStatusTab = (type) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_PLACED':
        return 'PENDING'; // Tab đơn mới
      case 'ORDER_PAID':
      case 'PAYMENT_RECEIVED':
        return 'PROCESSING'; // Tab đang xử lý
      case 'ORDER_COMPLETED':
        return 'COMPLETED'; // Tab hoàn thành
      case 'ORDER_CANCELLED':
        return 'CANCELLED'; // Tab đã hủy
      case 'RETURN_REQUESTED':
        return 'REFUND'; // Tab hoàn trả
      default:
        return 'ALL'; // Tab tất cả
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Navigate to orders page with orderId query param to open detail modal
    if (notification.orderId) {
      navigate(`/seller/orders?orderId=${notification.orderId}`);
    }
  };

  // Get latest 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                  }}
                  className="text-xs text-white hover:text-blue-100 font-medium underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-100 mt-1">
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: '450px' }}>
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellIcon className="w-16 h-16 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors
                    ${!notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${getNotificationColor(notification.type)}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {timeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.orderId && (
                          <span className="text-xs text-blue-600 font-medium">
                            Đơn hàng #{notification.orderId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa thông báo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - View All */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                to="/seller/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả thông báo ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
