import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerNotifications } from "../../hooks/useOwnerNotifications";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import { formatDateTime } from "../../utils/formatters";
import { Notification } from "../../types/notification";

type Props = NativeStackScreenProps<OwnerStackParamList, "NotificationsScreen">;

export const NotificationsScreen: React.FC<Props> = () => {
  const { theme, isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead,
    deleteNotification,
  } = useOwnerNotifications();

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredList = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const getIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "BOOKING":
        return <CalendarCheck size={20} color={theme.primary} />;
      case "PAYMENT":
        return <CreditCard size={20} color="#22C55E" />;
      case "VERIFICATION":
        return <ShieldCheck size={20} color="#3B82F6" />;
      default:
        return <Bell size={20} color={theme.primary} />;
    }
  };

  const handleDelete = (notificationId: number) => {
    deleteNotification(notificationId);
  };

  return (
    <AppScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <AppHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
            : "All caught up"
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilter("ALL")}
          style={[
            styles.filterTab,
            filter === "ALL" && {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight={filter === "ALL" ? "700" : "500"}
            style={{ color: filter === "ALL" ? "#FFFFFF" : theme.foreground }}
          >
            All ({notifications.length})
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setFilter("UNREAD")}
          style={[
            styles.filterTab,
            filter === "UNREAD" && {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight={filter === "UNREAD" ? "700" : "500"}
            style={{ color: filter === "UNREAD" ? "#FFFFFF" : theme.foreground }}
          >
            Unread ({unreadCount})
          </AppText>
        </Pressable>
      </View>

      {/* List */}
      <View style={styles.listSection}>
        {isLoading && notifications.length === 0 ? (
          <AppLoader message="Fetching notifications..." />
        ) : filteredList.length === 0 ? (
          <AppEmptyState
            icon={<Bell size={44} color={theme.primary} />}
            title="No notifications"
            description="You don't have any alerts in this category."
          />
        ) : (
          filteredList.map((item) => {
            const notifId = item.notificationId || item.id || 0;
            return (
              <AppCard
                key={notifId}
                onPress={() => {
                  if (!item.isRead) markAsRead(notifId);
                }}
                style={[
                  styles.notifCard,
                  !item.isRead && {
                    backgroundColor: isDark
                      ? "rgba(124, 144, 130, 0.12)"
                      : "rgba(124, 144, 130, 0.08)",
                    borderColor: theme.primary,
                  },
                ]}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.muted }]}>
                    {getIcon(item.type)}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTop}>
                      <AppText variant="body" weight="700" style={{ flex: 1, marginRight: 6 }}>
                        {item.title}
                      </AppText>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <AppText variant="bodySmall" color="muted" style={styles.message}>
                      {item.message}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {formatDateTime(item.createdAt)}
                    </AppText>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(notifId)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color={theme.mutedForeground} />
                  </Pressable>
                </View>
              </AppCard>
            );
          })
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  notifCard: {
    padding: 14,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C9082",
  },
  message: {
    marginVertical: 4,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

export default NotificationsScreen;
