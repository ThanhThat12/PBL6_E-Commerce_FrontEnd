/**
 * Storage Synchronization across multiple tabs/windows
 * Uses BroadcastChannel API and localStorage events
 */

const STORAGE_SYNC_CHANNEL = 'auth_sync_channel';

class StorageSync {
  constructor() {
    this.channel = null;
    this.listeners = new Map();
    this.initialize();
  }

  /**
   * Initialize BroadcastChannel for cross-tab communication
   */
  initialize() {
    // BroadcastChannel API (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(STORAGE_SYNC_CHANNEL);
      
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        this.notifyListeners(type, data);
      };
    }

    // Fallback: localStorage events (works in all browsers)
    window.addEventListener('storage', (event) => {
      if (event.key && event.newValue !== event.oldValue) {
        this.notifyListeners('storage_change', {
          key: event.key,
          oldValue: event.oldValue,
          newValue: event.newValue,
        });
      }
    });
  }

  /**
   * Broadcast message to all tabs
   * @param {string} type - Message type
   * @param {any} data - Message data
   */
  broadcast(type, data) {
    if (this.channel) {
      this.channel.postMessage({ type, data });
    }

    // Also trigger localStorage event for fallback
    const customEvent = new CustomEvent('storage_sync', {
      detail: { type, data }
    });
    window.dispatchEvent(customEvent);
  }

  /**
   * Add listener for storage events
   * @param {string} type - Event type
   * @param {Function} callback - Callback function
   */
  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  /**
   * Remove listener
   * @param {string} type - Event type
   * @param {Function} callback - Callback function
   */
  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  /**
   * Notify all listeners
   * @param {string} type - Event type
   * @param {any} data - Event data
   */
  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup on unmount
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
    }
    this.listeners.clear();
  }
}

// Singleton instance
const storageSync = new StorageSync();

// Event types
export const SYNC_EVENTS = {
  LOGIN: 'auth_login',
  LOGOUT: 'auth_logout',
  TOKEN_REFRESH: 'auth_token_refresh',
  USER_UPDATE: 'auth_user_update',
};

// Export utilities
export const broadcastLogin = (userData) => {
  storageSync.broadcast(SYNC_EVENTS.LOGIN, userData);
};

export const broadcastLogout = () => {
  storageSync.broadcast(SYNC_EVENTS.LOGOUT, null);
};

export const broadcastTokenRefresh = (tokenData) => {
  storageSync.broadcast(SYNC_EVENTS.TOKEN_REFRESH, tokenData);
};

export const broadcastUserUpdate = (userData) => {
  storageSync.broadcast(SYNC_EVENTS.USER_UPDATE, userData);
};

export const onAuthChange = (callback) => {
  storageSync.addListener(SYNC_EVENTS.LOGIN, callback);
  storageSync.addListener(SYNC_EVENTS.LOGOUT, callback);
  storageSync.addListener(SYNC_EVENTS.TOKEN_REFRESH, callback);
  storageSync.addListener(SYNC_EVENTS.USER_UPDATE, callback);
  
  return () => {
    storageSync.removeListener(SYNC_EVENTS.LOGIN, callback);
    storageSync.removeListener(SYNC_EVENTS.LOGOUT, callback);
    storageSync.removeListener(SYNC_EVENTS.TOKEN_REFRESH, callback);
    storageSync.removeListener(SYNC_EVENTS.USER_UPDATE, callback);
  };
};

export default storageSync;
