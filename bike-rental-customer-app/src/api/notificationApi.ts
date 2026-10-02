import api from "./axios";
import { Notification, NotificationDTO } from "../types/notification";

const BASE_URL = "/notifications";

export const notificationApi = {
  getNotificationsByUser: async (userId: number): Promise<Notification[]> => {
    const res = await api.get(`${BASE_URL}/user/${userId}`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  getUnreadNotifications: async (userId: number): Promise<Notification[]> => {
    const res = await api.get(`${BASE_URL}/user/${userId}/unread`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const res = await api.get(`${BASE_URL}/user/${userId}/count`);
    const data = res.data?.data ?? res.data;
    return typeof data === "number" ? data : 0;
  },

  sendNotification: async (notification: NotificationDTO): Promise<Notification> => {
    const res = await api.post(BASE_URL, notification);
    return res.data?.data ?? res.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const res = await api.put(`${BASE_URL}/read/${id}`);
    return res.data?.data ?? res.data;
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};

export default notificationApi;
