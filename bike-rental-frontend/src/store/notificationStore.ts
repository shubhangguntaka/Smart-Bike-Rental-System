// src/store/notificationStore.ts

import { create } from "zustand";
import { type Notification } from "../types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  selectedNotification: Notification | null;
  loading: boolean;
  error: string | null;

  setNotifications: (notifications: Notification[]) => void;
  setSelectedNotification: (notification: Notification | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string |null) => void;

  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  selectedNotification: null,
  loading: false,
  error: null,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  setSelectedNotification: (notification) =>
    set({
      selectedNotification: notification,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  addNotification: (notification) =>
    set((state) => {
      const updated = [notification, ...state.notifications];

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((notification) =>
        notification.notificationId === id
          ? { ...notification, isRead: true }
          : notification
      );

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  deleteNotification: (id) =>
    set((state) => {
      const updated = state.notifications.filter(
        (notification) => notification.notificationId !== id
      );

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
      selectedNotification: null,
    }),
}));