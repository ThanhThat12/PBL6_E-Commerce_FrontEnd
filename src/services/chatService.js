import api from './api';

/**
 * Chat Service - Handle chat-related API calls
 */

// Create or get conversation
export const createConversation = async (data) => {
  const response = await api.post('/conversations', data);
  return response.data;
};

// Get all conversations for current user
export const getMyConversations = async () => {
  const response = await api.get('/conversations/my');
  return response.data;
};

// Get conversation details
export const getConversationDetails = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId) => {
  const response = await api.get(`/messages/conversation/${conversationId}`);
  return response.data;
};

// Get messages with pagination
export const getConversationMessagesPaginated = async (conversationId, page = 0, size = 50) => {
  const response = await api.get(`/messages/conversation/${conversationId}/paginated`, {
    params: { page, size }
  });
  return response.data;
};

// Send message via REST API (fallback)
export const sendMessage = async (data) => {
  const response = await api.post('/messages', data);
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const response = await api.post(`/messages/${messageId}/read`);
  return response.data;
};

// Mark all messages in conversation as read
export const markConversationAsRead = async (conversationId) => {
  const response = await api.post(`/messages/conversation/${conversationId}/read-all`);
  return response.data;
};

// Get unread count for conversation
export const getUnreadCount = async (conversationId) => {
  const response = await api.get(`/messages/conversation/${conversationId}/unread-count`);
  return response.data;
};

// Get total unread messages count for user
export const getUnreadMessagesCount = async (userId) => {
  console.log('Fetching unread count for user:', userId);
  const response = await api.get(`/messages/user/${userId}/unread-count`);
  console.log('Unread count API response:', response);
  return response.data;
};

// Upload image for chat
export const uploadChatImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'chat'); // Tạo folder riêng cho chat images
  
  const response = await api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // api interceptor already unwrapped response.data
  // response is now { status, message, data: { url, publicId, ... } }
  return response;
};

const chatService = {
  createConversation,
  getMyConversations,
  getConversationDetails,
  getConversationMessages,
  getConversationMessagesPaginated,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadCount,
  getUnreadMessagesCount,
  uploadChatImage,
};

export default chatService;
