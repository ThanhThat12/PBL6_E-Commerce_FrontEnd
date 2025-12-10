import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getAccessToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import { showChatNotification, playNotificationSound, requestNotificationPermission } from '../utils/notification';

/**
 * useGlobalChatNotifications - Global WebSocket listener for chat notifications
 * Listens to all conversations and shows notifications when chat is closed
 */
export default function useGlobalChatNotifications() {
  const stompClient = useRef(null);
  const isConnected = useRef(false);

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission().catch(() => {});

    const token = getAccessToken();
    if (!token) {
      console.log('No token - skipping global notification listener');
      return;
    }

    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId || decoded.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost:8081';
    const socket = new SockJS(`${apiUrl}/ws`);
    const client = Stomp.over(socket);

    // Disable debug logs
    client.debug = () => {};

    // Connect
    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log('✅ Global notification listener connected');
        isConnected.current = true;
        stompClient.current = client;

        // Subscribe to user's personal notification queue
        client.subscribe(`/user/${userId}/queue/messages`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('🔔 New message notification:', data);

            // Show notification if page is not visible or minimized
            if (document.hidden) {
              showChatNotification({
                title: data.senderName || 'Tin nhắn mới',
                body: data.content?.length > 50 
                  ? data.content.substring(0, 50) + '...' 
                  : data.content || 'Bạn có tin nhắn mới',
                icon: data.senderAvatar,
                onClick: () => {
                  // Dispatch event to open chat
                  window.dispatchEvent(
                    new CustomEvent('openChat', {
                      detail: {
                        conversationId: data.conversationId
                      }
                    })
                  );
                }
              });
              playNotificationSound();
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });
      },
      (error) => {
        console.error('Global notification connection error:', error);
        isConnected.current = false;
      }
    );

    // Cleanup
    return () => {
      if (client && client.connected) {
        console.log('🔌 Disconnecting global notification listener');
        client.disconnect();
        isConnected.current = false;
      }
    };
  }, []);

  return null;
}
