import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Send, MessageSquare, Search as SearchIcon, Image as ImageIcon } from 'lucide-react';
import chatService from '../../../services/chatService';
import { getAccessToken } from '../../../utils/storage';
import { jwtDecode } from 'jwt-decode';
import './ChatInterface.css';

const ChatInterface = () => {
  const location = useLocation();
  const initialConversationId = location.state?.conversationId || null;

  // Hide parent scroll when component mounts
  useEffect(() => {
    // Save original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // Find and hide overflow on multiple possible containers
    const containers = [
      document.body,
      document.documentElement,
      document.querySelector('.admin-layout'),
      document.querySelector('.admin-content'),
      document.querySelector('[class*="content"]'),
      document.querySelector('main'),
      document.querySelector('[class*="main"]')
    ].filter(Boolean);
    
    const originalOverflows = containers.map(el => ({
      element: el,
      overflow: el.style.overflow
    }));
    
    // Hide overflow on all containers
    containers.forEach(el => {
      el.style.overflow = 'hidden';
    });
    
    // Restore original overflow when component unmounts
    return () => {
      originalOverflows.forEach(({ element, overflow }) => {
        element.style.overflow = overflow;
      });
    };
  }, []);

  const [conversations, setConversations] = useState([]);

  // State
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageSearchRef = useRef(null);

  const getCurrentUserId = () => {
    try {
      const token = getAccessToken() || localStorage.getItem('adminToken');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.sub || null;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const getTimeLabel = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'HH:mm dd/MM', { locale: vi });
    } catch (e) {
      return '';
    }
  };

  const mapConversationToUser = (conversation) => {
    const name =
      conversation.type === 'SHOP'
        ? conversation.shopName || 'Shop'
        : conversation.otherParticipantName || 'Hỗ trợ khách hàng';

    const lastMessageText = conversation.lastMessage ? conversation.lastMessage.content : 'Chưa có tin nhắn';
    const time = getTimeLabel(conversation.lastActivityAt || conversation.createdAt);

    return {
      id: conversation.id,
      name,
      avatar: conversation.otherParticipantAvatar || 'https://i.pravatar.cc/150?img=12',
      lastMessage: lastMessageText.length > 60 ? lastMessageText.substring(0, 60) + '...' : lastMessageText,
      time,
      isOnline: false,
      unread: conversation.unreadCount > 0
    };
  };

  const mapMessages = (rawMessages) =>
    rawMessages.map((m) => {
      const isImage = m.messageType === 'IMAGE';
      const isOwnMessage = currentUserId && m.senderId === currentUserId;
      return {
        id: m.id,
        sender: isOwnMessage ? 'me' : 'other',
        senderId: m.senderId,
        senderName: m.senderName || 'Người dùng',
        text: isImage ? '' : m.content,
        image: isImage ? m.content : null,
        time: getTimeLabel(m.createdAt),
        avatar: m.senderAvatar || 'https://i.pravatar.cc/150?img=12',
        status: m.status,
        messageType: m.messageType
      };
    });

  const loadConversations = async () => {
    try {
      const response = await chatService.getMyConversations();
      const data = response.data || response || [];
      setConversations(data);

      let initialConversation = null;
      if (initialConversationId) {
        initialConversation = data.find((c) => c.id === initialConversationId) || null;
      }
      if (!initialConversation && data.length > 0) {
        initialConversation = data[0];
      }

      if (initialConversation) {
        const user = mapConversationToUser(initialConversation);
        setSelectedUser(user);
        const messagesResponse = await chatService.getConversationMessages(initialConversation.id);
        const messagesData = messagesResponse.data || messagesResponse || [];
        setMessages(mapMessages(messagesData));
      }
    } catch (e) {
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const messagesResponse = await chatService.getConversationMessages(conversationId);
      const messagesData = messagesResponse.data || messagesResponse || [];
      setMessages(mapMessages(messagesData));
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close message search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageSearchRef.current && !messageSearchRef.current.contains(event.target)) {
        setShowMessageSearch(false);
        setMessageSearchQuery('');
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showMessageSearch) {
        setShowMessageSearch(false);
        setMessageSearchQuery('');
      }
    };

    if (showMessageSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showMessageSearch]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    if (user && user.id) {
      loadMessages(user.id);
      try {
        await chatService.markConversationAsRead(user.id);
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === user.id ? { ...conversation, unreadCount: 0 } : conversation
          )
        );
      } catch (e) {}
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '' && !selectedImage) return;

    if (!selectedUser) return;

    const content = inputText.trim();
    const imageToSend = selectedImage;

    const send = async () => {
      try {
        const payload = {
          conversationId: selectedUser.id,
          messageType: imageToSend ? 'IMAGE' : 'TEXT',
          content: imageToSend || content
        };
        const response = await chatService.sendMessage(payload);
        const messageData = response.data || response;
        if (messageData) {
          const isImage = messageData.messageType === 'IMAGE';
        const isOwnMessage = currentUserId && messageData.senderId === currentUserId;
        const mapped = {
          id: messageData.id,
          sender: isOwnMessage ? 'me' : 'other',
          senderId: messageData.senderId,
          senderName: messageData.senderName || 'Người dùng',
          text: isImage ? '' : messageData.content,
          image: isImage ? messageData.content : null,
          time: getTimeLabel(messageData.createdAt),
          avatar: messageData.senderAvatar || 'https://i.pravatar.cc/150?img=12',
          status: messageData.status,
          messageType: messageData.messageType
        };
          setMessages((prev) => [...prev, mapped]);
          setInputText('');
          setSelectedImage(null);
        }
      } catch (error) {
        const optimisticIsImage = !!imageToSend;
        const optimistic = {
          id: `temp-${Date.now()}`,
          sender: 'me',
          text: optimisticIsImage ? '' : content,
          image: optimisticIsImage ? imageToSend : null,
          time: getTimeLabel(new Date().toISOString()),
          avatar: 'https://i.pravatar.cc/150?img=12',
          status: 'SENDING',
          messageType: optimisticIsImage ? 'IMAGE' : 'TEXT'
        };
        setMessages((prev) => [...prev, optimistic]);
        setInputText('');
        setSelectedImage(null);
      }
    };

    send();
  };

  // Handle image upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Toggle message search
  const handleToggleMessageSearch = () => {
    setShowMessageSearch(!showMessageSearch);
    if (!showMessageSearch) {
      setMessageSearchQuery('');
    }
  };

  const filteredMessages = messageSearchQuery
    ? messages.filter(message =>
        message.text.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    : messages;

  const users = conversations.map(mapConversationToUser);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-chat-interface">
      {/* Left Sidebar - Chat List */}
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Chats</h2>
        </div>

        <div className="admin-chat-search-box">
          <input
            type="text"
            className="admin-chat-search-input"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-chat-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`admin-chat-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="admin-chat-avatar-container">
                <img src={user.avatar} alt={user.name} className="admin-chat-avatar" />
                {user.isOnline && <span className="admin-chat-online-status"></span>}
              </div>
              <div className="admin-chat-info">
                <div className="admin-chat-header">
                  <h4 className="admin-chat-name">{user.name}</h4>
                  <span className="admin-chat-time">{user.time}</span>
                </div>
                <p className={`admin-chat-preview ${user.unread ? 'unread' : ''}`}>
                  {user.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="admin-chat-window">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="admin-chat-window-header">
              <div className="admin-chat-header-user-info">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="admin-chat-header-avatar" />
                <div className="admin-chat-header-details">
                  <h3>{selectedUser.name}</h3>
                  <span className="admin-chat-header-status">
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="admin-chat-header-actions">
                <button className="admin-chat-action-btn">
                  <SearchIcon size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-chat-messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`admin-chat-message ${message.sender === 'other' ? 'received' : 'sent'}`}>
                  {message.sender === 'other' && (
                    <div className="admin-chat-message-avatar-container">
                      {message.avatar ? (
                        <img src={message.avatar} alt={message.senderName} className="admin-chat-message-avatar" />
                      ) : (
                        <div className="admin-chat-message-avatar-placeholder">
                          {message.senderName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="admin-chat-message-content-wrapper">
                    {message.sender === 'other' && (
                      <div className="admin-chat-message-sender-name">{message.senderName}</div>
                    )}
                    <div className="admin-chat-message-bubble">
                      {message.image ? (
                        <img src={message.image} alt="Uploaded" className="admin-chat-message-image" />
                      ) : (
                        message.text
                      )}
                    </div>
                    <div className="admin-chat-message-timestamp">
                      {message.time}
                      {message.sender === 'me' && (
                        <>
                          {' · '}
                          <span>{message.status === 'READ' ? 'Đã đọc' : 'Chưa đọc'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="admin-chat-message-input-area" onSubmit={handleSendMessage}>
              <div className="admin-chat-input-wrapper">
                <input
                  type="text"
                  className="admin-chat-message-input"
                  placeholder="Write your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="admin-chat-send-btn"
                disabled={inputText.trim() === ''}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="admin-chat-empty-state">
            <MessageSquare size={64} color="#65676b" />
            <h3>Select a chat</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
