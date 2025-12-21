import React, { useState, useEffect, useRef } from 'react';
import './MessageList.css';
import { format } from 'date-fns';
import { getUserAvatar, handleImageError, DEFAULT_AVATAR_IMAGE } from '../../../utils/placeholderImage';

/**
 * MessageList - Hiển thị danh sách tin nhắn
 */
const MessageList = ({ messages = [], currentUserId, typingUsers = [] }) => {
  const messagesEndRef = useRef(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const isOwnMessage = (message) => {
    return message.senderId === currentUserId;
  };

  // Helper function to detect and render URLs as clickable links
  const renderMessageContent = (content) => {
    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (messages.length === 0 && typingUsers.length === 0) {
    return (
      <div className="message-list-empty">
        <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-wrapper ${isOwnMessage(message) ? 'own' : 'other'}`}
          onMouseEnter={() => setHoveredMessageId(message.id)}
          onMouseLeave={() => setHoveredMessageId(null)}
        >
          {!isOwnMessage(message) && (
            <div className="message-avatar">
              <img 
                src={message.senderAvatar || DEFAULT_AVATAR_IMAGE} 
                alt={message.senderName}
                onError={(e) => handleImageError(e, DEFAULT_AVATAR_IMAGE)}
              />
            </div>
          )}
          
          <div className="message-content-wrapper">
            {!isOwnMessage(message) && (
              <div className="message-sender-name">{message.senderName}</div>
            )}
            
            <div className="message-bubble">
              {message.messageType === 'IMAGE' ? (
                <img 
                  src={message.content} 
                  alt="Message" 
                  className="message-image"
                  onClick={() => window.open(message.content, '_blank')}
                />
              ) : (
                <p className="message-text">{renderMessageContent(message.content)}</p>
              )}
              
              <div className="message-meta">
                <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                {isOwnMessage(message) && message.status && (
                  <span className={`message-status ${message.status.toLowerCase()}`}>
                    {message.status === 'SENT' && '✓'}
                    {message.status === 'DELIVERED' && '✓✓'}
                    {message.status === 'READ' && '✓✓'}
                    {message.status === 'SENDING' && '⏱'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="message-wrapper other">
          <div className="message-avatar">
            <div className="message-avatar-placeholder">
              {typingUsers[0].charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="message-content-wrapper">
            <div className="message-sender-name">{typingUsers[0]}</div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
