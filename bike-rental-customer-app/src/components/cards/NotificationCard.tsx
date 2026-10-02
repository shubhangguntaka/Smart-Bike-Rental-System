import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Bell,
  Calendar,
  CreditCard,
  Bike as BikeIcon,
  ShieldCheck,
  Check,
  Trash2,
} from "lucide-react-native";
import { Notification, NotificationType } from "../../types/notification";
import { useTheme } from "../../theme";

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkRead?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const typeIconMap: Record<
  NotificationType,
  { icon: any; color: string; bg: string }
> = {
  SYSTEM: { icon: Bell, color: "#7C9082", bg: "bg-primary/10" },
  BOOKING: { icon: Calendar, color: "#059669", bg: "bg-emerald-500/10" },
  PAYMENT: { icon: CreditCard, color: "#2563EB", bg: "bg-blue-500/10" },
  BIKE: { icon: BikeIcon, color: "#D97706", bg: "bg-amber-500/10" },
  VERIFICATION: { icon: ShieldCheck, color: "#9333EA", bg: "bg-purple-500/10" },
  RIDE: { icon: BikeIcon, color: "#059669", bg: "bg-emerald-500/10" },
};

export function NotificationCard({
  notification,
  onPress,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const { theme } = useTheme();
  const typeConfig =
    typeIconMap[notification.notificationType] || typeIconMap.SYSTEM;
  const IconComponent = typeConfig.icon;

  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <Pressable
      onPress={() => onPress && onPress(notification)}
      style={{
        backgroundColor: notification.isRead ? theme.card : (theme.primary + "12"),
        borderColor: notification.isRead ? theme.border : (theme.primary + "4D"),
      }}
      className="p-4 rounded-2xl border shadow-xs mb-3 space-y-2"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start gap-3 flex-1 pr-2">
          <View
            className={`p-2.5 rounded-xl ${typeConfig.bg} justify-center items-center shrink-0`}
          >
            <IconComponent size={18} color={typeConfig.color} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                style={{
                  fontFamily: "Antic",
                  color: theme.foreground,
                }}
                className={`text-sm ${
                  notification.isRead ? "font-semibold" : "font-black"
                }`}
              >
                {notification.title}
              </Text>
              {!notification.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary" />
              )}
            </View>

            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-xs mt-1 leading-relaxed"
            >
              {notification.message}
            </Text>

            <Text
              style={{ fontFamily: "JetBrainsMono", color: theme.mutedForeground }}
              className="text-[10px] mt-2 opacity-75"
            >
              {formattedDate}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          {!notification.isRead && onMarkRead && (
            <Pressable
              onPress={() => onMarkRead(notification.notificationId)}
              className="p-1.5 rounded-lg bg-muted/60 active:bg-muted"
            >
              <Check size={14} color={theme.primary} />
            </Pressable>
          )}

          {onDelete && (
            <Pressable
              onPress={() => onDelete(notification.notificationId)}
              className="p-1.5 rounded-lg bg-muted/60 active:bg-rose-500/10"
            >
              <Trash2 size={14} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default NotificationCard;
