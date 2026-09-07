import {
  createContext,
  useState,
  useEffect,
  useRef,
  type ReactNode
} from "react";
import { useToasterStore } from "react-hot-toast";

import notificationService from "../services/notificationService";
import type { Notification, NotificationType } from "../types/notification";
import useAuth from "@/hooks/useAuth";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  refreshNotifications: (userId?: number, isSilent?: boolean) => Promise<void>;
  markAsRead: (id: number, userId?: number) => Promise<void>;
  deleteNotification: (id: number, userId?: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const STORAGE_KEY_PREFIX = "smartbike_toast_notifications_";

export const NotificationProvider = ({ children }: Props) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const processedToastIds = useRef<Set<string>>(new Set());

  const { toasts } = useToasterStore();

  const getStorageKey = (userId?: number | string) => {
    return `${STORAGE_KEY_PREFIX}${userId || "guest"}`;
  };

  const getStoredLocalNotifications = (userId?: number | string): Notification[] => {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveStoredLocalNotifications = (userId: number | string | undefined, list: Notification[]) => {
    try {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list.slice(0, 50))); // Keep last 50
    } catch (err) {
      console.error("Failed to save local notifications:", err);
    }
  };

  const refreshNotifications = async (userId?: number, isSilent = false) => {
    const targetUserId = userId || (user?.id ? Number(user.id) : null);
    const localList = getStoredLocalNotifications(targetUserId ?? "guest");

    if (!targetUserId) {
      setNotifications(localList);
      setUnreadCount(localList.filter((n) => !n.isRead).length);
      return;
    }

    try {
      if (!isSilent) setLoading(true);

      let serverList: Notification[] = [];
      try {
        serverList = await notificationService.getNotificationsByUser(targetUserId);
      } catch (e) {
        console.warn("Could not fetch remote notifications, using local store:", e);
      }

      // Merge serverList and localList, deduplicating by notificationId or title+message
      const mergedMap = new Map<string, Notification>();

      [...localList, ...serverList].forEach((n) => {
        const uniqueKey = n.notificationId
          ? String(n.notificationId)
          : `${n.title}_${n.message}_${n.createdAt}`;
        
        // If existing exists, prefer whichever is marked as read or newest
        if (!mergedMap.has(uniqueKey)) {
          mergedMap.set(uniqueKey, n);
        } else {
          const existing = mergedMap.get(uniqueKey)!;
          if (n.isRead) {
            mergedMap.set(uniqueKey, { ...existing, isRead: true });
          }
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setNotifications(mergedList);
      setUnreadCount(mergedList.filter((n) => !n.isRead).length);
      setError("");
    } catch (err) {
      setError("Unable to load notifications.");
      setNotifications(localList);
      setUnreadCount(localList.filter((n) => !n.isRead).length);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Listen to new toast messages across the entire app
  useEffect(() => {
    if (!toasts || toasts.length === 0) return;

    let hasNewNotification = false;
    const currentUserId = user?.id ? Number(user.id) : undefined;
    const localList = getStoredLocalNotifications(currentUserId);

    toasts.forEach((t) => {
      if (!t.id || processedToastIds.current.has(t.id)) return;
      processedToastIds.current.add(t.id);

      // Resolve message string
      let messageText = "";
      if (typeof t.message === "function") {
        const res = (t.message as any)(t);
        messageText = typeof res === "string" ? res : String(res?.props?.children || res || "");
      } else if (typeof t.message === "string") {
        messageText = t.message;
      } else if (t.message && typeof t.message === "object") {
        messageText = (t.message as any)?.props?.children
          ? String((t.message as any).props.children)
          : String(t.message);
      }

      const trimmed = messageText.trim();
      if (!trimmed || trimmed === "Loading..." || trimmed.toLowerCase().includes("please wait")) {
        return;
      }

      // Infer notification metadata
      const textUpper = trimmed.toUpperCase();
      let type: NotificationType = "SYSTEM";
      let title = "System Notification";

      if (textUpper.includes("BOOKING") || textUpper.includes("RENTAL")) {
        type = "BOOKING";
        title = t.type === "error" ? "Booking Alert" : "Booking Update";
      } else if (
        textUpper.includes("PAYMENT") ||
        textUpper.includes("TRANSACTION") ||
        textUpper.includes("INR") ||
        textUpper.includes("₹")
      ) {
        type = "PAYMENT";
        title = t.type === "error" ? "Payment Alert" : "Payment Update";
      } else if (textUpper.includes("BIKE") || textUpper.includes("FLEET")) {
        type = "BIKE";
        title = t.type === "error" ? "Fleet Alert" : "Fleet Update";
      } else if (
        textUpper.includes("VERIF") ||
        textUpper.includes("DOCUMENT") ||
        textUpper.includes("KYC") ||
        textUpper.includes("AADHAAR")
      ) {
        type = "VERIFICATION";
        title = t.type === "error" ? "Verification Alert" : "Verification Update";
      } else if (t.type === "success") {
        title = "Action Successful";
      } else if (t.type === "error") {
        title = "Action Alert";
      }

      const newNotification: Notification = {
        notificationId: Date.now() + Math.floor(Math.random() * 1000),
        userId: currentUserId || 0,
        title,
        message: trimmed,
        notificationType: type,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      localList.unshift(newNotification);
      hasNewNotification = true;
    });

    if (hasNewNotification) {
      saveStoredLocalNotifications(currentUserId, localList);
      setNotifications(localList);
      setUnreadCount(localList.filter((n) => !n.isRead).length);
    }
  }, [toasts, user?.id]);

  const markAsRead = async (id: number, userId?: number) => {
    const targetUserId = userId || (user?.id ? Number(user.id) : undefined);
    
    // Update server if possible
    try {
      await notificationService.markAsRead(id);
    } catch {
      // ignore server failure for locally generated toast notifications
    }

    // Update local storage
    const localList = getStoredLocalNotifications(targetUserId);
    const updatedLocal = localList.map((n) =>
      n.notificationId === id ? { ...n, isRead: true } : n
    );
    saveStoredLocalNotifications(targetUserId, updatedLocal);

    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const deleteNotification = async (id: number, userId?: number) => {
    const targetUserId = userId || (user?.id ? Number(user.id) : undefined);

    // Delete from server if possible
    try {
      await notificationService.deleteNotification(id);
    } catch {
      // ignore
    }

    // Delete from local storage
    const localList = getStoredLocalNotifications(targetUserId);
    const updatedLocal = localList.filter((n) => n.notificationId !== id);
    saveStoredLocalNotifications(targetUserId, updatedLocal);

    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    setUnreadCount(updatedLocal.filter((n) => !n.isRead).length);
  };

  const clearAll = async () => {
    const targetUserId = user?.id ? Number(user.id) : undefined;
    saveStoredLocalNotifications(targetUserId, []);
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (user?.id) {
      const uId = Number(user.id);
      void refreshNotifications(uId);

      const interval = setInterval(() => {
        void refreshNotifications(uId, true);
      }, 10000);

      return () => clearInterval(interval);
    } else {
      const guestList = getStoredLocalNotifications("guest");
      setNotifications(guestList);
      setUnreadCount(guestList.filter((n) => !n.isRead).length);
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
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};