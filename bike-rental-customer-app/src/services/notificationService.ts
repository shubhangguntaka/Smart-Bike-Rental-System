import notificationApi from "../api/notificationApi";
import { Notification, NotificationDTO } from "../types/notification";

export const notificationService = {
  getNotificationsByUser: async (userId: number): Promise<Notification[]> => {
    return notificationApi.getNotificationsByUser(userId);
  },

  getUnreadNotifications: async (userId: number): Promise<Notification[]> => {
    return notificationApi.getUnreadNotifications(userId);
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    return notificationApi.getUnreadCount(userId);
  },

  sendNotification: async (notification: NotificationDTO): Promise<Notification> => {
    return notificationApi.sendNotification(notification);
  },

  markAsRead: async (id: number): Promise<Notification> => {
    return notificationApi.markAsRead(id);
  },

  deleteNotification: async (id: number): Promise<void> => {
    return notificationApi.deleteNotification(id);
  },
};

export default notificationService;
