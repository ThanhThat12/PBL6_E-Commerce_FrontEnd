import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

/**
 * useOrderNotification - Custom hook for subscribing to order WebSocket notifications
 * @param {string|number} userId - User ID to subscribe to
 * @param {function} onMessage - Callback when a message is received
 */
export default function useOrderNotification(userId, onMessage) {
  const stompClient = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(`${process.env.REACT_APP_API_URL || 'https://localhost:8081'}/ws`);
    const client = Stomp.over(socket);

    client.debug = (str) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 STOMP:', str);
      }
    };

    client.connect({},
      (frame) => {
        console.log('✅ WebSocket connected:', frame);
        stompClient.current = client;
        client.subscribe(`/topic/orderws/${userId}`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            onMessage(notification);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        });
        console.log('📡 Subscribed to /topic/orderws/' + userId);
      },
      (error) => {
        console.error('❌ WebSocket connection error:', error);
      }
    );

    return () => {
      if (client && client.connected) {
        console.log('🔌 Disconnecting WebSocket...');
        client.disconnect();
      }
    };
  }, [userId, onMessage]);
}
