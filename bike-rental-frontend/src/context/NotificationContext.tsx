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

export const NotificationProvider = ({ children }: Props) => {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const USER_ID = 1; // Replace with logged-in user id later

  const refreshNotifications = async (userId: number) => {

    try {

      setLoading(true);

      const notificationList =
        await notificationService.getNotificationsByUser(userId);

      const unread =
        await notificationService.getUnreadCount(userId);

      setNotifications(notificationList);
      setUnreadCount(unread);
      setError("");

    } catch (err) {

      setError("Unable to load notifications.");

    } finally {

      setLoading(false);

    }
  };

  const markAsRead = async (
    id: number,
    userId: number
  ) => {

    await notificationService.markAsRead(id);

    refreshNotifications(userId);
  };

  const deleteNotification = async (
    id: number,
    userId: number
  ) => {

    await notificationService.deleteNotification(id);

    refreshNotifications(userId);
  };

  useEffect(() => {

    refreshNotifications(USER_ID);

  }, []);

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