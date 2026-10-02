import React, { useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Pressable } from "react-native";
import { Bell, CheckCheck, Trash2 } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import NotificationCard from "../../components/cards/NotificationCard";
import AppHeader from "../../components/common/AppHeader";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  const loadAll = useCallback(() => {
    if (user?.id) {
      fetchNotifications(Number(user.id));
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) {
        markAsRead(n.notificationId, Number(user?.id));
      }
    });
  };

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <AppHeader
        title="Activity Notifications"
        rightAction={
          unreadCount > 0 ? (
            <Pressable
              onPress={handleMarkAllRead}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 active:bg-primary/20"
            >
              <CheckCheck size={14} color={theme.primary} />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-primary"
              >
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.notificationId)}
        renderItem={({ item }) => (
          <View className="px-5">
            <NotificationCard
              notification={item}
              onMarkRead={(id) => markAsRead(id, Number(user?.id))}
              onDelete={(id) => deleteNotification(id, Number(user?.id))}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="p-16 items-center justify-center space-y-3">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                <Bell size={32} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-base font-bold text-foreground"
              >
                No Notifications
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground text-center"
              >
                Booking confirmations, ride status, and payment updates will appear here.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAll}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}
