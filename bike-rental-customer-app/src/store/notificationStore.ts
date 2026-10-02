import { create } from "zustand";
import { Notification, NotificationType } from "../types/notification";
import notificationService from "../services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotifications: (userId: number) => Promise<void>;
  markAsRead: (id: number, userId?: number) => Promise<void>;
  deleteNotification: (id: number, userId?: number) => Promise<void>;
  addLocalAlert: (title: string, message: string, type: NotificationType, userId: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const list = await notificationService.getNotificationsByUser(userId);
      const count = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: count, loading: false });
    } catch (err) {
      set({ loading: false, error: "Failed to load notifications" });
    }
  },

  markAsRead: async (id: number, userId?: number) => {
    try {
      await notificationService.markAsRead(id).catch(() => {});
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.notificationId === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
    } catch {
      // Ignore
    }
  },

  deleteNotification: async (id: number, userId?: number) => {
    try {
      await notificationService.deleteNotification(id).catch(() => {});
      set((state) => {
        const item = state.notifications.find((n) => n.notificationId === id);
        const updated = state.notifications.filter((n) => n.notificationId !== id);
        return {
          notifications: updated,
          unreadCount: item && !item.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch {
      // Ignore
    }
  },

  addLocalAlert: (title: string, message: string, type: NotificationType, userId: number) => {
    const newNotif: Notification = {
      notificationId: Date.now() + Math.floor(Math.random() * 1000),
      userId,
      title,
      message,
      notificationType: type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
