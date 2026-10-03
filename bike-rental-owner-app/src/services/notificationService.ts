import notificationApi from "../api/notificationApi";
import { Notification } from "../types/notification";

export const notificationService = {
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const res = await notificationApi.getUserNotifications(userId);
    return res.data || [];
  },

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const res = await notificationApi.getUnreadNotifications(userId);
    return res.data || [];
  },

  async getUnreadCount(userId: number): Promise<number> {
    const res = await notificationApi.getUnreadCount(userId);
    return typeof res.data === "number" ? res.data : 0;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const res = await notificationApi.markAsRead(notificationId);
    return res.data;
  },

  async deleteNotification(notificationId: number): Promise<string> {
    const res = await notificationApi.deleteNotification(notificationId);
    return res.data;
  },
};

export default notificationService;
