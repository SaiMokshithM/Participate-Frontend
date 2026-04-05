import axiosInstance from './axiosInstance';

export const getNotifications = () =>
  axiosInstance.get('/notifications').then((r) => r.data);

export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count').then((r) => r.data);

export const markNotificationRead = (id) =>
  axiosInstance.put(`/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  axiosInstance.put('/notifications/read-all');

export const deleteNotification = (id) =>
  axiosInstance.delete(`/notifications/${id}`);
