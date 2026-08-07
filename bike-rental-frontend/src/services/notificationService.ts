import axios from "axios";
import type {
   Notification,
  NotificationDTO
} from "../types/notification";

const API_URL = "http://localhost:8888/api/notifications";

const notificationService = {

  getNotifications: async (): Promise<Notification[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getNotificationById: async (
    id: number
  ): Promise<Notification> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  getNotificationsByUser: async (
    userId: number
  ): Promise<Notification[]> => {
    const response = await axios.get(
      `${API_URL}/user/${userId}`
    );
    return response.data;
  },

  getUnreadNotifications: async (
    userId: number
  ): Promise<Notification[]> => {
    const response = await axios.get(
      `${API_URL}/unread/${userId}`
    );
    return response.data;
  },

  getUnreadCount: async (
    userId: number
  ): Promise<number> => {
    const response = await axios.get(
      `${API_URL}/user/${userId}/count`
    );
    return response.data;
  },

  sendNotification: async (
    notification: NotificationDTO
  ): Promise<Notification> => {
    const response = await axios.post(API_URL, notification);
    return response.data;
  },

  markAsRead: async (
    id: number
  ): Promise<Notification> => {
    const response = await axios.put(
      `${API_URL}/read/${id}`
    );
    return response.data;
  },

  deleteNotification: async (
    id: number
  ): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }

};

export default notificationService;