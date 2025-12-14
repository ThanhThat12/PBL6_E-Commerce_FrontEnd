import api from './api';

export const notificationService = {
  // Lấy danh sách notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Đếm số notifications chưa đọc
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data?.count || 0;
  },

  // Đánh dấu một notification là đã đọc
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Đánh dấu tất cả là đã đọc
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Xóa một notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Xóa tất cả notifications
  clearAll: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },
};