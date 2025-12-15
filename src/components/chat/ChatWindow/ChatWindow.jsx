import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';
import { X, Minus, ChevronLeft } from 'lucide-react';
import RoomList from '../RoomList';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import useChatWebSocket from '../../../hooks/useChatWebSocket';
import chatService from '../../../services/chatService';
import { requestNotificationPermission, showChatNotification, playNotificationSound } from '../../../utils/notification';

/**
 * ChatWindow - Cửa sổ chat floating ở góc phải màn hình
 */
const ChatWindow = ({ isOpen, onClose, onMinimize, selectedConversationId: propConversationId, autoMessage }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(propConversationId || null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState(propConversationId ? 'chat' : 'list'); // 'list' or 'chat'
  const messageIdsRef = useRef(new Set()); // Track message IDs to prevent duplicates
  const pendingMessagesRef = useRef(new Map()); // Track pending optimistic messages

  console.log('ChatWindow render - selectedConversationId:', selectedConversationId, 'view:', view, 'autoMessage:', autoMessage);

  // WebSocket connection - ONLY when we have a conversation selected
  const { isConnected, sendMessage, sendTypingIndicator, getUserIdFromToken } = useChatWebSocket(
    view === 'chat' ? selectedConversationId : null, // Only connect in chat view
    {
      onMessage: (message) => {
        // Check if this is a real message (from server with actual ID)
        if (message.id && typeof message.id === 'number') {
          // Check if we already have this message
          if (messageIdsRef.current.has(message.id)) {
            console.log('⚠️ Duplicate message ignored:', message.id);
            return;
          }
          
          // Add to tracking set
          messageIdsRef.current.add(message.id);
          
          // Check if this was an optimistic message
          const tempId = Array.from(pendingMessagesRef.current.keys()).find(
            key => pendingMessagesRef.current.get(key) === true
          );
          
          setMessages((prev) => {
            // Remove optimistic message and add real one
            const filtered = tempId ? prev.filter(m => m.id !== tempId) : prev;
            return [...filtered, message];
          });
          
          // Clear pending
          if (tempId) {
            pendingMessagesRef.current.delete(tempId);
          }
        } else {
          // Fallback for messages without proper ID
          setMessages((prev) => {
            if (prev.find((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        }

        // Show notification if message is from someone else and window is not focused
        const currentUserId = getUserIdFromToken();
        if (message.senderId !== currentUserId) {
          // Check if chat window is minimized or browser tab is not focused
          if (document.hidden || !isOpen) {
            showChatNotification({
              title: message.senderName || 'Tin nhắn mới',
              body: message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content,
              icon: message.senderAvatar,
              onClick: () => {
                // Open chat window when notification is clicked
                setSelectedConversationId(selectedConversationId);
                setIsOpen(true);
              }
            });
            playNotificationSound();
          }
        }
      },
      onTyping: (typingData) => {
        const currentUserId = getUserIdFromToken();
        if (typingData.userId !== currentUserId) {
          if (typingData.typing) {
            setTypingUsers((prev) => {
              if (!prev.includes(typingData.userName)) {
                return [...prev, typingData.userName];
              }
              return prev;
            });
          } else {
            setTypingUsers((prev) => prev.filter((name) => name !== typingData.userName));
          }
        }
      },
      onDeliveryConfirmation: (confirmation) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === confirmation.messageId
              ? { ...msg, status: confirmation.status }
              : msg
          )
        );
      },
      onError: (error) => {
        console.error('Chat error:', error);
      },
    }
  );

  const loadConversations = async () => {
    try {
      console.log('📋 Loading conversations...');
      setIsLoading(true);
      const response = await chatService.getMyConversations();
      console.log('📋 Conversations response:', response);
      
      // Handle both response.data and direct response
      const conversationsData = response.data || response || [];
      console.log('📋 Conversations data:', conversationsData);
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log('💬 Loading messages for conversation:', conversationId);
      setIsLoading(true);
      
      // Clear tracking for new conversation
      messageIdsRef.current.clear();
      pendingMessagesRef.current.clear();
      
      const response = await chatService.getConversationMessages(conversationId);
      console.log('💬 Messages response:', response);
      
      // Handle both response.data and direct response
      const messagesData = response.data || response || [];
      console.log('💬 Messages data:', messagesData);
      
      // Add all loaded message IDs to tracking set
      messagesData.forEach(msg => {
        if (msg.id && typeof msg.id === 'number') {
          messageIdsRef.current.add(msg.id);
        }
      });
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update when prop changes
  useEffect(() => {
    if (propConversationId) {
      setSelectedConversationId(propConversationId);
      setView('chat');
    }
  }, [propConversationId]);

  // Load conversations on mount
  useEffect(() => {
    console.log('ChatWindow useEffect - isOpen:', isOpen);
    if (isOpen) {
      loadConversations();
      // Request notification permission when chat is opened
      requestNotificationPermission().catch(err => 
        console.log('Notification permission denied:', err)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      setView('chat');
      
      // Mark all messages as read when opening conversation
      chatService.markConversationAsRead(selectedConversationId)
        .then(() => {
          console.log('Conversation marked as read:', selectedConversationId);
          // Reload conversations to update unread count
          loadConversations();
        })
        .catch(err => console.error('Error marking conversation as read:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const handleCreateSupportChat = async () => {
    try {
      console.log('Creating support conversation...');
      
      // Check if support conversation already exists
      const existingSupport = conversations.find(conv => conv.type === 'SUPPORT');
      if (existingSupport) {
        setSelectedConversationId(existingSupport.id);
        return;
      }

      // Create new support conversation
      const response = await chatService.createConversation({
        type: 'SUPPORT',
      });

      const conversationData = response.data || response;
      
      if (conversationData && conversationData.id) {
        // Add to conversations list
        setConversations(prev => [conversationData, ...prev]);
        setSelectedConversationId(conversationData.id);
      }
    } catch (error) {
      console.error('Error creating support conversation:', error);
    }
  };

  const handleSendMessage = (messageData) => {
    const currentUserId = getUserIdFromToken();
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    // Generate unique temp ID for optimistic message
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    // Optimistic UI update
    const optimisticMessage = {
      id: tempId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      senderName: 'You',
      messageType: messageData.messageType,
      content: messageData.content,
      createdAt: new Date().toISOString(),
      status: 'SENDING',
      isOptimistic: true,
    };

    // Track this as pending
    pendingMessagesRef.current.set(tempId, true);
    
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send via WebSocket
    sendMessage({
      senderId: currentUserId,
      messageType: messageData.messageType,
      content: messageData.content,
    });
    
    // Timeout to remove optimistic message if real one doesn't arrive
    setTimeout(() => {
      if (pendingMessagesRef.current.has(tempId)) {
        console.warn('⚠️ Message send timeout, removing optimistic message:', tempId);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        pendingMessagesRef.current.delete(tempId);
      }
    }, 10000); // 10 second timeout
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedConversationId(null);
    setMessages([]);
  };

  if (!isOpen) return null;

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
console.log('ChatWindow render - selectedConversation:', selectedConversation.logoUrl);
  return (
    <div className="chat-window">
      <div className="chat-window-header">
        {view === 'chat' && (
          <button className="chat-back-btn" onClick={handleBackToList}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="chat-header-info">
          {view === 'chat' && selectedConversation?.type === 'SHOP' && selectedConversation?.logoUrl && (
            <img 
              src={selectedConversation.logoUrl} 
              alt={selectedConversation.shopName}
              className="chat-header-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <h3 className="chat-window-title">
            {view === 'chat' && selectedConversation
              ? selectedConversation.type === 'SHOP' 
                ? (selectedConversation.shopName || `Shop #${selectedConversation.id}`)
                : (selectedConversation.otherParticipantName || 'Hỗ trợ khách hàng')
              : 'Tin nhắn'}
          </h3>
        </div>
        <div className="chat-window-actions">
          {isConnected && view === 'chat' && (
            <span className="chat-connection-status">🟢</span>
          )}
          <button className="chat-action-btn" onClick={onMinimize} title="Thu nhỏ">
            <Minus size={18} />
          </button>
          <button className="chat-action-btn" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="chat-window-body">
        {view === 'list' ? (
          <RoomList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onCreateSupportChat={handleCreateSupportChat}
          />
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUserId={getUserIdFromToken()}
              typingUsers={typingUsers}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected}
              placeholder={isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
              autoMessage={autoMessage}
            />
          </>
        )}
      </div>

      {isLoading && (
        <div className="chat-loading-overlay">
          <div className="chat-loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
