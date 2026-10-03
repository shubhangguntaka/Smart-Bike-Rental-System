import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

export function useOwnerNotifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: () => (user?.id ? fetchNotifications(user.id) : Promise.resolve()),
    markAsRead,
    deleteNotification,
  };
}

export default useOwnerNotifications;
