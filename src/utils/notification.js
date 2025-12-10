/**
 * Browser Notification Utility
 * Handles permission requests and notification display
 */

/**
 * Request permission for browser notifications
 * Should be called on user interaction (e.g., button click)
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Check if notifications are enabled
 */
export const isNotificationEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Show a chat notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification message body
 * @param {string} options.icon - Notification icon URL
 * @param {Function} options.onClick - Callback when notification is clicked
 */
export const showChatNotification = ({ title, body, icon, onClick }) => {
  if (!isNotificationEnabled()) {
    console.log('Notifications not enabled');
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/logo192.png',
      badge: '/logo192.png',
      tag: 'chat-notification',
      requireInteraction: false,
      silent: false,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play sound:', err));
  } catch (error) {
    console.log('Sound not available');
  }
};
