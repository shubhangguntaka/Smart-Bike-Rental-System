import { create } from "zustand";
import { notificationService } from "../services/notificationService";
import { Notification } from "../types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (userId: number) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: number) => {
    set({ isLoading: true });
    try {
      const [list, count] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadCount(userId),
      ]);
      set({
        notifications: list,
        unreadCount: count,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          (n.notificationId === notificationId || n.id === notificationId)
            ? { ...n, isRead: true }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.warn("Error marking notification as read:", err);
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      set((state) => {
        const item = state.notifications.find(
          (n) => n.notificationId === notificationId || n.id === notificationId
        );
        const wasUnread = item && !item.isRead;
        return {
          notifications: state.notifications.filter(
            (n) => n.notificationId !== notificationId && n.id !== notificationId
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (err) {
      console.warn("Error deleting notification:", err);
    }
  },
}));

export default useNotificationStore;
