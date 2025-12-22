import React, { useState, useEffect } from 'react';
import './ChatWindow.css';
import { X, Minus, ChevronLeft } from 'lucide-react';
import RoomList from '../RoomList';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import useChatWebSocket from '../../../hooks/useChatWebSocket';
import chatService from '../../../services/chatService';
import chatbotService from '../../../services/chatbotService';
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
  const [inputMode, setInputMode] = useState('chat'); // 'chat' | 'bot'
  const [botMessages, setBotMessages] = useState([]);

  console.log('ChatWindow render - selectedConversationId:', selectedConversationId, 'view:', view, 'autoMessage:', autoMessage);

  // WebSocket connection - ONLY when we have a conversation selected
  const { isConnected, sendMessage, sendTypingIndicator, getUserIdFromToken } = useChatWebSocket(
    view === 'chat' ? selectedConversationId : null, // Only connect in chat view
    {
      onMessage: (message) => {
        setMessages((prev) => {
          // 1) If server message already exists by id, ignore
          if (prev.find((m) => m.id === message.id)) {
            return prev;
          }

          // 2) Replace optimistic (SENDING) message from same sender & content
          const optimisticIndex = prev.findIndex(
            (m) =>
              m.status === 'SENDING' &&
              m.senderId === message.senderId &&
              m.content === message.content
          );

          if (optimisticIndex !== -1) {
            const newMessages = [...prev];
            newMessages.splice(optimisticIndex, 1, message);
            return newMessages;
          }

          // 3) Default: append new message
          return [...prev, message];
        });

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
      const response = await chatService.getConversationMessages(conversationId);
      console.log('💬 Messages response:', response);
      
      // Handle both response.data and direct response
      const messagesData = response.data || response || [];
      console.log('💬 Messages data:', messagesData);
      
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
    if (inputMode === 'bot') {
      // Local-only chatbot flow
      const currentUserId = getUserIdFromToken();
      const userMsg = {
        id: Date.now(),
        senderId: currentUserId,
        senderName: 'You',
        messageType: messageData.messageType,
        content: messageData.content,
        createdAt: new Date().toISOString(),
        status: 'SENT',
      };
      setBotMessages((prev) => [...prev, userMsg]);

      // Call chatbot API
      chatbotService
        .ask({ question: messageData.content })
        .then((reply) => {
          const text = reply?.answer || reply?.data?.answer || reply?.message || 'Bot không có câu trả lời.';
          const botMsg = {
            id: Date.now() + 1,
            senderId: 'BOT',
            senderName: 'Chatbot',
            messageType: 'TEXT',
            content: text,
            createdAt: new Date().toISOString(),
            status: 'SENT',
          };
          setBotMessages((prev) => [...prev, botMsg]);
        })
        .catch((err) => {
          const botMsg = {
            id: Date.now() + 2,
            senderId: 'BOT',
            senderName: 'Chatbot',
            messageType: 'TEXT',
            content: 'Xin lỗi, chatbot đang gặp lỗi. Vui lòng thử lại.',
            createdAt: new Date().toISOString(),
            status: 'ERROR',
          };
          console.error('Chatbot error:', err);
          setBotMessages((prev) => [...prev, botMsg]);
        });
      return;
    }

    // Normal chat flow
    const currentUserId = getUserIdFromToken();
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    const optimisticMessage = {
      id: Date.now(),
      conversationId: selectedConversationId,
      senderId: currentUserId,
      senderName: 'You',
      messageType: messageData.messageType,
      content: messageData.content,
      createdAt: new Date().toISOString(),
      status: 'SENDING',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    sendMessage({
      senderId: currentUserId,
      messageType: messageData.messageType,
      content: messageData.content,
    });
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedConversationId(null);
    setMessages([]);
  };

  if (!isOpen) return null;

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        {view === 'chat' && (
          <button className="chat-back-btn" onClick={handleBackToList}>
            <ChevronLeft size={20} />
          </button>
        )}
        <h3 className="chat-window-title">
          {inputMode === 'bot'
            ? 'Chatbot'
            : (view === 'chat' && selectedConversation
                ? (selectedConversation.type === 'SHOP'
                    ? (selectedConversation.shopName || `Shop ${selectedConversation.id}`)
                    : (selectedConversation.otherParticipantName || 'Hỗ trợ khách hàng'))
                : 'Tin nhắn')}
        </h3>
        <div className="chat-window-actions">
          {isConnected && view === 'chat' && inputMode !== 'bot' && (
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
            {inputMode === 'bot' ? (
              <MessageList
                messages={botMessages}
                currentUserId={getUserIdFromToken()}
                typingUsers={[]}
              />
            ) : (
              <MessageList
                messages={messages}
                currentUserId={getUserIdFromToken()}
                typingUsers={typingUsers}
              />
            )}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={inputMode === 'bot' ? false : !isConnected}
              placeholder={inputMode === 'bot' ? 'Nhập tin nhắn cho chatbot...' : (isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...')}
              autoMessage={autoMessage}
              mode={inputMode}
              onChangeMode={setInputMode}
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