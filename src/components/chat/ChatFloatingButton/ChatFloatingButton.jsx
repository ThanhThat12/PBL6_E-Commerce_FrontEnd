import React from 'react';
import './ChatFloatingButton.css';
import { MessageCircle } from 'lucide-react';

/**
 * ChatFloatingButton - Nút chat nổi ở góc phải màn hình
 */
const ChatFloatingButton = ({ onClick, unreadCount = 0 }) => {
  return (
    <button 
      className="chat-floating-button" 
      onClick={onClick}
      aria-label="Open chat"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="chat-floating-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatFloatingButton;
