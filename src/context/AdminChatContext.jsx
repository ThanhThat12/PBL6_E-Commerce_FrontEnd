import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminChatService from '../services/adminChatService';
import { useAuth } from './AuthContext';

/**
 * Admin Chat Context - Manage admin chat state and WebSocket connections
 */

const AdminChatContext = createContext();

export const useAdminChat = () => {
  const context = useContext(AdminChatContext);
  if (!context) {
    throw new Error('useAdminChat must be used within AdminChatProvider');
  }
  return context;
};

export const AdminChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await adminChatService.getMyConversations();
      console.log('Fetched conversations:', response);
      setConversations(response || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await adminChatService.getConversationMessages(conversationId);
      console.log('Fetched messages:', response);
      setMessages(response || []);
      
      // Mark conversation as read
      await adminChatService.markConversationAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message via REST API
  const sendMessage = useCallback(async (messageData) => {
    try {
      const response = await adminChatService.sendMessage(messageData);
      console.log('Message sent:', response);
      
      // Add message to local state
      setMessages(prev => [...prev, response]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === messageData.conversationId
            ? { 
                ...conv, 
                lastMessage: response.content,
                lastMessageTime: response.sentAt 
              }
            : conv
        )
      );
      
      return response;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback((conversation) => {
    console.log('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    if (conversation) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, [fetchMessages]);

  // Initial load of conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const value = {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    isConnected,
    fetchConversations,
    fetchMessages,
    sendMessage,
    selectConversation,
  };

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
};

export default AdminChatContext;