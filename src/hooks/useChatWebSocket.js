import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getAccessToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';

/**
 * useChatWebSocket - Custom hook for real-time chat via WebSocket
 * 
 * @param {number} conversationId - ID of the conversation to join
 * @param {object} callbacks - Event callbacks
 * @returns {object} WebSocket methods and state
 */
export default function useChatWebSocket(conversationId, callbacks = {}) {
  const {
    onMessage = () => {},
    onTyping = () => {},
    onDeliveryConfirmation = () => {},
    onError = () => {},
  } = callbacks;

  const stompClient = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Store callbacks in refs to avoid re-connecting on callback changes
  const callbacksRef = useRef({ onMessage, onTyping, onDeliveryConfirmation, onError });
  
  useEffect(() => {
    callbacksRef.current = { onMessage, onTyping, onDeliveryConfirmation, onError };
  }, [onMessage, onTyping, onDeliveryConfirmation, onError]);

  // Get user ID from token
  const getUserIdFromToken = useCallback(() => {
    try {
      const token = getAccessToken();
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.sub;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    if (!conversationId) {
      console.log('⚠️ No conversationId - skipping WebSocket connection');
      setIsConnected(false);
      return;
    }

    console.log('🔌 Attempting to connect WebSocket for conversation:', conversationId);

    const token = getAccessToken();
    if (!token) {
      console.warn('⚠️ No authentication token found');
      setIsConnected(false);
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL_WS;
    const socket = new SockJS(`${apiUrl}`);
    const client = Stomp.over(socket);

    // Enable debug in development
    client.debug = (str) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 STOMP:', str);
      }
    };

    // Connect with JWT token
    client.connect(
      { Authorization: `Bearer ${token}` },
      (frame) => {
        console.log('✅ Chat WebSocket connected:', frame);
        setIsConnected(true);
        setConnectionError(null);
        stompClient.current = client;

        // Subscribe to conversation messages
        client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('📩 Received message:', data);
            callbacksRef.current.onMessage(data);
          } catch (error) {
            console.error('❌ Error parsing message:', error);
            callbacksRef.current.onError(error);
          }
        });

        // Subscribe to typing indicators
        client.subscribe(`/topic/conversations/${conversationId}/typing`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('⌨️ Typing indicator:', data);
            callbacksRef.current.onTyping(data);
          } catch (error) {
            console.error('❌ Error parsing typing indicator:', error);
          }
        });

        // Subscribe to delivery confirmations
        const userId = getUserIdFromToken();
        if (userId) {
          client.subscribe(`/user/${userId}/queue/confirmations`, (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log('✓ Delivery confirmation:', data);
              callbacksRef.current.onDeliveryConfirmation(data);
            } catch (error) {
              console.error('❌ Error parsing confirmation:', error);
            }
          });

          // Subscribe to error notifications
          client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log('⚠️ Notification:', data);
              if (data.errorCode) {
                callbacksRef.current.onError(data);
              }
            } catch (error) {
              console.error('❌ Error parsing notification:', error);
            }
          });
        }

        console.log(`📡 Subscribed to conversation ${conversationId}`);
      },
      (error) => {
        console.error('❌ WebSocket connection error:', error);
        setIsConnected(false);
        setConnectionError(error);
        callbacksRef.current.onError(error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (client && client.connected) {
        console.log('🔌 Disconnecting chat WebSocket...');
        client.disconnect();
        setIsConnected(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]); // Only reconnect when conversationId changes

  /**
   * Send a message to the conversation
   */
  const sendMessage = useCallback((messageData) => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.error('❌ Cannot send message: WebSocket not connected');
      callbacksRef.current.onError({ message: 'WebSocket not connected' });
      return;
    }

    const payload = {
      conversationId: conversationId,
      senderId: messageData.senderId,
      messageType: messageData.messageType || 'TEXT',
      content: messageData.content,
    };

    console.log('📤 Sending message:', payload);

    stompClient.current.send(
      '/app/chat/send',
      {},
      JSON.stringify(payload)
    );
  }, [conversationId, onError]);

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = useCallback((userId, isTyping) => {
    if (!stompClient.current || !stompClient.current.connected) {
      return;
    }

    const payload = {
      conversationId: conversationId,
      userId: userId,
      typing: isTyping,
    };

    stompClient.current.send(
      '/app/chat/typing',
      {},
      JSON.stringify(payload)
    );
  }, [conversationId]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendTypingIndicator,
    getUserIdFromToken,
  };
}
