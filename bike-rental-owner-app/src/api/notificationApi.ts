import api from "./axios";
import { Notification } from "../types/notification";

export const notificationApi = {
  getUserNotifications: (userId: number) =>
    api.get<Notification[]>(`/notifications/user/${userId}`),

  getUnreadNotifications: (userId: number) =>
    api.get<Notification[]>(`/notifications/user/${userId}/unread`),

  getUnreadCount: (userId: number) =>
    api.get<number>(`/notifications/user/${userId}/count`),

  markAsRead: (notificationId: number) =>
    api.put<Notification>(`/notifications/read/${notificationId}`),

  deleteNotification: (notificationId: number) =>
    api.delete<string>(`/notifications/notificationId/${notificationId}`).catch(() =>
      api.delete<string>(`/notifications/${notificationId}`)
    ),
};

export default notificationApi;
