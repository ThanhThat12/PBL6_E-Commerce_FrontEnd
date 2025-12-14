import { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getUnreadMessagesCount } from '../services/chatService';
import { getAccessToken } from '../utils/storage';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://localhost:8081/ws';

/**
 * Hook to manage chat notifications and unread message count
 * Subscribes to WebSocket for real-time updates
 */
export default function useChatNotifications(userId) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState(null);
  const [connected, setConnected] = useState(false);
  
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      console.log('useChatNotifications: No userId, skipping fetch');
      return;
    }
    
    try {
      console.log('useChatNotifications: Fetching unread count for user:', userId);
      const response = await getUnreadMessagesCount(userId);
      console.log('useChatNotifications: Raw API response:', response);
      
      // Handle different response formats
      let count = 0;
      if (response && typeof response === 'object') {
        count = response.data || response.count || 0;
      } else if (typeof response === 'number') {
        count = response;
      }
      
      console.log('useChatNotifications: Extracted count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('useChatNotifications: Error fetching chat unread count:', error);
      console.error('Error details:', error.response?.data || error.message);
      setUnreadCount(0);
    }
  }, [userId]);

  // Connect to WebSocket and subscribe to personal queue
  useEffect(() => {
    console.log('useChatNotifications useEffect - userId:', userId);
    
    if (!userId) {
      console.log('useChatNotifications: No userId yet, waiting...');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.log('useChatNotifications: No access token, skipping');
      return;
    }

    console.log('useChatNotifications: Starting fetch and WebSocket connection...');
    
    // Fetch initial count
    fetchUnreadCount();

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No JWT token found in localStorage for chat WebSocket');
      return;
    }
    
    // Append token as query parameter to WebSocket URL
    const socketUrlWithToken = `${SOCKET_URL}?token=${token}`;
    console.log('🔑 Chat WebSocket: Connecting with token in query parameter');

    // Create WebSocket connection
    const socket = new SockJS(socketUrlWithToken);
    const stompClient = Stomp.over(socket);

    // Disable debug logs in production
    if (process.env.NODE_ENV === 'production') {
      stompClient.debug = () => {};
    }

    // Connect without Authorization header (token already in handshake URL)
    stompClient.connect(
      {}, // Empty headers - token is in query parameter
      () => {
        console.log('✅ Chat notifications WebSocket connected');
        setConnected(true);
        stompClientRef.current = stompClient;

        // Subscribe to personal message queue
        const subscription = stompClient.subscribe(
          `/user/${userId}/queue/messages`,
          (message) => {
            try {
              const newMessage = JSON.parse(message.body);
              
              // Update latest message for notification display
              setLatestMessage(newMessage);
              
              // Increment unread count
              setUnreadCount(prev => prev + 1);
              
              console.log('💬 New chat message notification:', newMessage);
            } catch (error) {
              console.error('❌ Error processing chat notification:', error);
            }
          }
        );

        subscriptionRef.current = subscription;
      },
      (error) => {
        console.error('❌ Chat WebSocket connection error:', error);
        console.error('Error details:', {
          message: error?.message,
          headers: error?.headers,
          body: error?.body
        });
        setConnected(false);
        
        // Don't retry if it's an authentication error
        if (error?.headers?.message?.includes('Failed to send message')) {
          console.error('⚠️ Authentication or connection error - not retrying');
          return;
        }
        
        // Retry connection after 5 seconds for other errors
        setTimeout(() => {
          console.log('🔄 Retrying chat WebSocket connection...');
          fetchUnreadCount();
        }, 5000);
      }
    );

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
      }
      setConnected(false);
    };
  }, [userId, fetchUnreadCount]);

  // Reset unread count when user reads messages
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
    setLatestMessage(null);
  }, []);

  // Manually refresh count
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    latestMessage,
    connected,
    resetUnreadCount,
    refreshCount
  };
}
