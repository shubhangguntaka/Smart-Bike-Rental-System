import api from "../api/axios";
import type {
  Notification,
  NotificationDTO
} from "../types/notification";

const BASE_URL = "/notifications";

const notificationService = {

  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get(BASE_URL);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getNotificationById: async (
    id: number
  ): Promise<Notification> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data?.data ?? response.data;
  },

  getNotificationsByUser: async (
    userId: number
  ): Promise<Notification[]> => {
    const response = await api.get(`${BASE_URL}/user/${userId}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getUnreadNotifications: async (
    userId: number
  ): Promise<Notification[]> => {
    const response = await api.get(`${BASE_URL}/user/${userId}/unread`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  getUnreadCount: async (
    userId: number
  ): Promise<number> => {
    const response = await api.get(`${BASE_URL}/user/${userId}/count`);
    const data = response.data?.data ?? response.data;
    return typeof data === "number" ? data : 0;
  },

  sendNotification: async (
    notification: NotificationDTO
  ): Promise<Notification> => {
    const response = await api.post(BASE_URL, notification);
    return response.data?.data ?? response.data;
  },

  markAsRead: async (
    id: number
  ): Promise<Notification> => {
    const response = await api.put(`${BASE_URL}/read/${id}`);
    return response.data?.data ?? response.data;
  },

  deleteNotification: async (
    id: number
  ): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  }

};

export default notificationService;