import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Bell, Moon, Sun, ShieldCheck, ShieldAlert } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../theme";
import { useOwnerNotifications } from "../../hooks/useOwnerNotifications";
import AppText from "../common/AppText";
import AppBadge from "../common/AppBadge";
import { getInitials } from "../../utils/helpers";

export interface OwnerHeaderProps {
  title?: string;
  subtitle?: string;
  showWelcome?: boolean;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  title,
  subtitle,
  showWelcome = true,
}) => {
  const navigation = useNavigation<any>();
  const { user, ownerProfile } = useAuthStore();
  const { theme, isDark, setThemeMode, mode } = useTheme();
  const { unreadCount } = useOwnerNotifications();

  const ownerName = ownerProfile?.ownerName || user?.fullName || user?.name || "Owner";
  const isVerified = !!(ownerProfile?.verificationStatus ?? user?.isVerified);

  const toggleTheme = () => {
    if (mode === "system") {
      setThemeMode(isDark ? "light" : "dark");
    } else if (mode === "dark") {
      setThemeMode("light");
    } else {
      setThemeMode("dark");
    }
  };

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <View style={styles.leftSection}>
        {/* Avatar */}
        <Pressable
          onPress={() => navigation.navigate("ProfileTab")}
          style={[styles.avatar, { backgroundColor: theme.primary }]}
        >
          <AppText variant="bodySmall" weight="700" style={{ color: "#FFFFFF" }}>
            {getInitials(ownerName)}
          </AppText>
        </Pressable>

        <View style={styles.textContainer}>
          {showWelcome ? (
            <>
              <View style={styles.nameRow}>
                <AppText variant="h3" weight="700" numberOfLines={1}>
                  Hi, {ownerName.split(" ")[0]}!
                </AppText>
                {isVerified ? (
                  <ShieldCheck size={16} color="#22C55E" style={styles.verifiedIcon} />
                ) : (
                  <ShieldAlert size={16} color="#F59E0B" style={styles.verifiedIcon} />
                )}
              </View>
              <AppText variant="caption" color="muted">
                {isVerified ? "Verified Partner" : "Verification Pending"}
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="h3" weight="700" numberOfLines={1}>
                {title}
              </AppText>
              {subtitle && (
                <AppText variant="caption" color="muted">
                  {subtitle}
                </AppText>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* Theme Toggle */}
        <Pressable
          onPress={toggleTheme}
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#28282C" : "#EDEBE6" },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isDark ? (
            <Sun size={18} color="#FACC15" />
          ) : (
            <Moon size={18} color={theme.foreground} />
          )}
        </Pressable>

        {/* Notifications */}
        <Pressable
          onPress={() => navigation.navigate("NotificationsScreen")}
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#28282C" : "#EDEBE6" },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bell size={18} color={theme.foreground} />
          {unreadCount > 0 && (
            <View style={styles.notificationDot}>
              <AppText variant="caption" weight="700" style={styles.dotText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#C73E3A",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  dotText: {
    color: "#FFFFFF",
    fontSize: 9,
  },
});

export default OwnerHeader;
