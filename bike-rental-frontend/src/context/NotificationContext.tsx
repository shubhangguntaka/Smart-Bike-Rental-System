import {
  createContext,
  useState,
  useEffect,
   type ReactNode
} from "react";

import notificationService from "../services/notificationService";
import type { Notification } from "../types/notification";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  refreshNotifications: (userId: number) => Promise<void>;
  markAsRead: (id: number, userId: number) => Promise<void>;
  deleteNotification: (id: number, userId: number) => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

import useAuth from "@/hooks/useAuth";

export const NotificationProvider = ({ children }: Props) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshNotifications = async (userId?: number, isSilent = false) => {
    const targetUserId = userId || (user?.id ? Number(user.id) : null);
    if (!targetUserId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      if (!isSilent) setLoading(true);
      const notificationList =
        await notificationService.getNotificationsByUser(targetUserId);

      const unread =
        await notificationService.getUnreadCount(targetUserId);

      setNotifications(notificationList);
      setUnreadCount(unread);
      setError("");
    } catch (err) {
      setError("Unable to load notifications.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const markAsRead = async (
    id: number,
    userId: number
  ) => {
    await notificationService.markAsRead(id);
    refreshNotifications(userId, true);
  };

  const deleteNotification = async (
    id: number,
    userId: number
  ) => {
    await notificationService.deleteNotification(id);
    refreshNotifications(userId, true);
  };

  useEffect(() => {
    if (user?.id) {
      const uId = Number(user.id);
      refreshNotifications(uId);

      const interval = setInterval(() => {
        refreshNotifications(uId, true);
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  return (

    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>

  );

};