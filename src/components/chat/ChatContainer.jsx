import React, { useState, useEffect } from 'react';
import ChatFloatingButton from './ChatFloatingButton';
import ChatWindow from './ChatWindow';
import { useNotificationContext } from '../../context/NotificationContext';

/**
 * ChatContainer - Component quản lý toàn bộ chat system
 * Hiển thị floating button và chat window
 */
const ChatContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [autoMessage, setAutoMessage] = useState(null);

  // Get chat unread count from NotificationContext
  const { chatUnreadCount, refreshChatCount } = useNotificationContext();

  console.log('ChatContainer render - isOpen:', isOpen, 'selectedConversationId:', selectedConversationId);

  // Listen for openChat event from other components
  useEffect(() => {
    const handleOpenChat = (event) => {
      console.log('ChatContainer received openChat event:', event.detail);
      const { conversationId, autoMessage: message, shouldAutoSend } = event.detail;
      setSelectedConversationId(conversationId);
      // Only set autoMessage if shouldAutoSend is true
      setAutoMessage(shouldAutoSend ? message : null);
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openChat', handleOpenChat);
    console.log('ChatContainer: openChat event listener registered');
    
    return () => {
      window.removeEventListener('openChat', handleOpenChat);
      console.log('ChatContainer: openChat event listener removed');
    };
  }, []);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
    
    // Refresh chat count when opening
    if (!isOpen) {
      refreshChatCount();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    // Refresh count when closing
    refreshChatCount();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {!isOpen && !isMinimized && (
        <ChatFloatingButton onClick={handleToggle} unreadCount={chatUnreadCount} />
      )}
      
      {(isOpen || isMinimized) && !isMinimized && (
        <ChatWindow
          isOpen={isOpen && !isMinimized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          selectedConversationId={selectedConversationId}
          autoMessage={autoMessage}
        />
      )}

      {isMinimized && (
        <ChatFloatingButton onClick={handleToggle} unreadCount={chatUnreadCount} />
      )}
    </>
  );
};

export default ChatContainer;

