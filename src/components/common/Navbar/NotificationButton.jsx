import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

/**
 * NotificationButton Component
 * Hiển thị icon thông báo với badge số lượng và dropdown danh sách thông báo
 */
export default function NotificationButton({ notifications = [], onMarkAsRead, onClearAll, variant = 'customer' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Style variants
  const isAdmin = variant === 'admin';
  const buttonClass = isAdmin 
    ? 'p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
    : 'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors group';
  
  const iconClass = isAdmin
    ? 'w-5 h-5'
    : hasUnread 
      ? 'w-6 h-6 text-yellow-300 group-hover:text-yellow-200 transition-colors animate-wiggle'
      : 'w-6 h-6 text-white group-hover:text-primary-100 transition-colors';

  const badgeClass = isAdmin
    ? 'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full shadow-md'
    : 'absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse';

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
  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Vừa xong'; // Handle undefined/null timestamp
    
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
      case 'CHAT_MESSAGE':
        return '💬';
      case 'ORDER_CONFIRMED':
        return '✅';
      case 'ORDER_SHIPPING':
        return '🚚';
      case 'ORDER_COMPLETED':
        return '🎉';
      case 'ORDER_CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  };

  // Map notification type to order status tab
  const getOrderStatusTab = (type) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_PLACED':
        return 'PENDING'; // Tab đơn mới (cho seller)
      case 'ORDER_CONFIRMED':
        return 'PROCESSING'; // Tab đang xử lý (cho buyer)
      case 'ORDER_SHIPPING':
        return 'SHIPPING'; // Tab đang giao
      case 'ORDER_COMPLETED':
      case 'PAYMENT_RECEIVED':
        return 'COMPLETED'; // Tab hoàn thành
      case 'ORDER_CANCELLED':
        return 'CANCELLED'; // Tab đã hủy
      default:
        return 'ALL'; // Tab tất cả
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    onMarkAsRead?.(notification.id);
    
    setIsOpen(false);
    
    if (notification.type === 'CHAT_MESSAGE') {
      console.log('💬 Opening chat for notification');
      if (variant === 'admin') {
        if (notification.conversationId) {
          navigate('/admin/chat', {
            state: { conversationId: notification.conversationId }
          });
        } else {
          navigate('/admin/chat');
        }
      } else {
        if (notification.conversationId) {
          window.dispatchEvent(new CustomEvent('openChat', {
            detail: { conversationId: notification.conversationId }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('openChat', {
            detail: {}
          }));
        }
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="Thông báo"
      >
        {hasUnread ? (
          <BellIconSolid className={iconClass} />
        ) : (
          <BellIcon className={iconClass} />
        )}
        
        {/* Badge */}
        {hasUnread && (
          <span className={badgeClass}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {!isAdmin && (
          <span className="hidden lg:inline text-sm font-medium text-white group-hover:text-primary-100 transition-colors">
            Thông báo
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute
          right-0
          mt-2
          w-80
          sm:w-96
          bg-white
          rounded-xl
          shadow-2xl
          border
          border-gray-200
          overflow-hidden
          z-50
          animate-fadeIn
        ">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-primary border-b border-primary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Thông báo
                {hasUnread && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    onClearAll?.();
                    setIsOpen(false);
                  }}
                  className="text-xs text-white hover:text-primary-100 underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      px-4 py-3
                      hover:bg-gray-50
                      transition-colors
                      cursor-pointer
                      ${!notification.read ? 'bg-blue-50' : ''}
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
                        {notification.orderId && (
                          <Link
                            to={`/orders/${notification.orderId}`}
                            className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Xem đơn hàng #{notification.orderId}
                          </Link>
                        )}
                        {notification.type === 'CHAT_MESSAGE' && (
                          <p className="text-xs text-primary-600 mt-1">
                            Nhấn để xem tin nhắn
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {timeAgo(notification.timestamp)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <Link
                to="/notifications"
                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
