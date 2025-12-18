import api from './api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Admin Chat Service
 * Service for admin chat functionality with sellers and customers
 */

// WebSocket client instance
let stompClient = null;
let isConnected = false;

/**
 * Get admin token for WebSocket authentication
 */
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Connect to WebSocket for real-time chat
 * @param {Function} onMessageReceived - Callback for incoming messages
 * @param {Function} onTypingReceived - Callback for typing indicators
 * @param {Function} onConnected - Callback when connected
 * @param {Function} onError - Callback for errors
 */
export const connectWebSocket = (onMessageReceived, onTypingReceived, onConnected, onError) => {
  const token = getAdminToken();
  
  if (!token) {
    console.error('No admin token found for WebSocket connection');
    if (onError) onError('Authentication required');
    return null;
  }

  // Create SockJS connection
  const socket = new SockJS('https://localhost:8081/ws');
  
  // Create STOMP client
  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    debug: (str) => {
      console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    
    onConnect: (frame) => {
      console.log('✅ WebSocket Connected:', frame);
      isConnected = true;
      
      if (onConnected) {
        onConnected();
      }
    },
    
    onStompError: (frame) => {
      console.error('❌ STOMP Error:', frame);
      isConnected = false;
      
      if (onError) {
        onError(frame.headers.message || 'WebSocket error');
      }
    },
    
    onWebSocketError: (error) => {
      console.error('❌ WebSocket Error:', error);
      isConnected = false;
      
      if (onError) {
        onError('WebSocket connection failed');
      }
    },
  });

  // Activate the client
  stompClient.activate();
  
  return stompClient;
};

/**
 * Subscribe to a conversation for real-time messages
 * @param {number} conversationId - The conversation ID to subscribe to
 * @param {Function} onMessageReceived - Callback for incoming messages
 * @param {Function} onTypingReceived - Callback for typing indicators
 */
export const subscribeToConversation = (conversationId, onMessageReceived, onTypingReceived) => {
  if (!stompClient || !isConnected) {
    console.error('WebSocket not connected');
    return null;
  }

  // Subscribe to conversation messages
  const messageSubscription = stompClient.subscribe(
    `/topic/conversations/${conversationId}`,
    (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('📩 Received message:', data);
        
        if (onMessageReceived) {
          onMessageReceived(data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  );

  // Subscribe to typing indicators
  const typingSubscription = stompClient.subscribe(
    `/topic/conversations/${conversationId}/typing`,
    (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('✍️ Typing indicator:', data);
        
        if (onTypingReceived) {
          onTypingReceived(data);
        }
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    }
  );

  return {
    messageSubscription,
    typingSubscription,
    unsubscribe: () => {
      messageSubscription.unsubscribe();
      typingSubscription.unsubscribe();
    }
  };
};

/**
 * Send message via WebSocket
 * @param {object} messageData - { conversationId, senderId, messageType, content }
 */
export const sendMessageViaWebSocket = (messageData) => {
  if (!stompClient || !isConnected) {
    console.error('WebSocket not connected');
    throw new Error('WebSocket not connected');
  }

  stompClient.publish({
    destination: '/app/chat/send',
    body: JSON.stringify(messageData)
  });

  console.log('📤 Message sent via WebSocket:', messageData);
};

/**
 * Send typing indicator via WebSocket
 * @param {number} conversationId - The conversation ID
 * @param {number} userId - The user ID (admin)
 * @param {boolean} typing - Whether user is typing
 */
export const sendTypingIndicator = (conversationId, userId, typing) => {
  if (!stompClient || !isConnected) {
    return;
  }

  stompClient.publish({
    destination: '/app/chat/typing',
    body: JSON.stringify({
      conversationId,
      userId,
      typing
    })
  });

  console.log('✍️ Typing indicator sent:', { conversationId, userId, typing });
};

/**
 * Disconnect WebSocket
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    isConnected = false;
    console.log('🔌 WebSocket disconnected');
  }
};

/**
 * Check if WebSocket is connected
 */
export const isWebSocketConnected = () => {
  return isConnected;
};

// ==================== REST API CALLS ====================

/**
 * Get all conversations for admin
 */
export const getMyConversations = async () => {
  try {
    const response = await api.get('/conversations/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation details
 * @param {number} conversationId 
 */
export const getConversationDetails = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 * @param {number} conversationId 
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Get messages with pagination
 * @param {number} conversationId 
 * @param {number} page 
 * @param {number} size 
 */
export const getConversationMessagesPaginated = async (conversationId, page = 0, size = 50) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}/paginated`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated messages:', error);
    throw error;
  }
};

/**
 * Send message via REST API (fallback when WebSocket unavailable)
 * @param {object} data - { conversationId, messageType, content }
 */
export const sendMessage = async (data) => {
  try {
    const response = await api.post('/messages', data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark all messages in conversation as read
 * @param {number} conversationId 
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await api.post(`/messages/conversation/${conversationId}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * Get unread count for conversation
 * @param {number} conversationId 
 */
export const getUnreadCount = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Get total unread messages count for admin
 * @param {number} userId - Admin user ID
 */
export const getUnreadMessagesCount = async (userId) => {
  try {
    const response = await api.get(`/messages/user/${userId}/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching total unread count:', error);
    throw error;
  }
};

/**
 * Get latest message in conversation
 * @param {number} conversationId 
 */
export const getLatestMessage = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}/latest`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest message:', error);
    throw error;
  }
};

/**
 * Get message count for conversation
 * @param {number} conversationId 
 */
export const getMessageCount = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}/count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message count:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {number} messageId 
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Create a new conversation (for support chats)
 * @param {object} data - { type: "SUPPORT", targetUserId }
 */
export const createConversation = async (data) => {
  try {
    const response = await api.post('/conversations', data);
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

const adminChatService = {
  // WebSocket methods
  connectWebSocket,
  subscribeToConversation,
  sendMessageViaWebSocket,
  sendTypingIndicator,
  disconnectWebSocket,
  isWebSocketConnected,
  
  // REST API methods
  getMyConversations,
  getConversationDetails,
  getConversationMessages,
  getConversationMessagesPaginated,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  getUnreadMessagesCount,
  getLatestMessage,
  getMessageCount,
  deleteMessage,
  createConversation,
};

export default adminChatService;
