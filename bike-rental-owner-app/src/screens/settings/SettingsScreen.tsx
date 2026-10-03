import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Sun,
  Moon,
  Smartphone,
  Bell,
  Globe,
  Trash2,
  LogOut,
  Info,
  ChevronRight,
} from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useTheme } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { APP_NAME, APP_VERSION } from "../../constants";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";

type Props = NativeStackScreenProps<OwnerStackParamList, "SettingsScreen">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, mode, setThemeMode } = useTheme();
  const { logout } = useAuthStore();

  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [paymentNotifs, setPaymentNotifs] = useState(true);
  const [kycNotifs, setKycNotifs] = useState(true);
  const [reviewNotifs, setReviewNotifs] = useState(true);

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Local cached files have been cleared.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => logout() },
      ]
    );
  };

  return (
    <AppScreen withTopInset contentContainerStyle={styles.container}>
      <AppHeader title="Settings" subtitle="Preferences & App Configuration" />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <View style={styles.section}>
          <AppText variant="caption" color="muted" weight="700" style={styles.sectionHeader}>
            APPEARANCE & THEME
          </AppText>

          <AppCard style={styles.card}>
            <View style={styles.themeOptionsRow}>
              {/* System */}
              <Pressable
                onPress={() => setThemeMode("system")}
                style={[
                  styles.themeOption,
                  mode === "system" && {
                    borderColor: theme.primary,
                    borderWidth: 2,
                    backgroundColor: isDark ? "rgba(124,144,130,0.15)" : "rgba(124,144,130,0.1)",
                  },
                ]}
              >
                <Smartphone size={22} color={mode === "system" ? theme.primary : theme.mutedForeground} />
                <AppText
                  variant="caption"
                  weight={mode === "system" ? "700" : "500"}
                  style={{ marginTop: 6 }}
                >
                  System
                </AppText>
              </Pressable>

              {/* Light */}
              <Pressable
                onPress={() => setThemeMode("light")}
                style={[
                  styles.themeOption,
                  mode === "light" && {
                    borderColor: theme.primary,
                    borderWidth: 2,
                    backgroundColor: "rgba(124,144,130,0.1)",
                  },
                ]}
              >
                <Sun size={22} color={mode === "light" ? theme.primary : theme.mutedForeground} />
                <AppText
                  variant="caption"
                  weight={mode === "light" ? "700" : "500"}
                  style={{ marginTop: 6 }}
                >
                  Light
                </AppText>
              </Pressable>

              {/* Dark */}
              <Pressable
                onPress={() => setThemeMode("dark")}
                style={[
                  styles.themeOption,
                  mode === "dark" && {
                    borderColor: theme.primary,
                    borderWidth: 2,
                    backgroundColor: "rgba(124,144,130,0.15)",
                  },
                ]}
              >
                <Moon size={22} color={mode === "dark" ? theme.primary : theme.mutedForeground} />
                <AppText
                  variant="caption"
                  weight={mode === "dark" ? "700" : "500"}
                  style={{ marginTop: 6 }}
                >
                  Dark
                </AppText>
              </Pressable>
            </View>
          </AppCard>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <AppText variant="caption" color="muted" weight="700" style={styles.sectionHeader}>
            NOTIFICATION PREFERENCES
          </AppText>

          <AppCard style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="600">
                  Booking Request Alerts
                </AppText>
                <AppText variant="caption" color="muted">
                  Instant push notification when customer reserves a bike
                </AppText>
              </View>
              <Switch
                value={bookingNotifs}
                onValueChange={setBookingNotifs}
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="600">
                  Payout & Payment Notifications
                </AppText>
                <AppText variant="caption" color="muted">
                  Alerts on successful settlement deposits
                </AppText>
              </View>
              <Switch
                value={paymentNotifs}
                onValueChange={setPaymentNotifs}
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="600">
                  KYC & Document Status
                </AppText>
                <AppText variant="caption" color="muted">
                  Updates on RC and Aadhaar approval
                </AppText>
              </View>
              <Switch
                value={kycNotifs}
                onValueChange={setKycNotifs}
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="600">
                  Customer Review Alerts
                </AppText>
                <AppText variant="caption" color="muted">
                  Notify when a rider rates your vehicle
                </AppText>
              </View>
              <Switch
                value={reviewNotifs}
                onValueChange={setReviewNotifs}
                trackColor={{ false: "#767577", true: theme.primary }}
              />
            </View>
          </AppCard>
        </View>

        {/* Regional & System */}
        <View style={styles.section}>
          <AppText variant="caption" color="muted" weight="700" style={styles.sectionHeader}>
            SYSTEM & DATA
          </AppText>

          <AppCard style={styles.card}>
            <Pressable onPress={handleClearCache} style={styles.actionRow}>
              <Trash2 size={18} color={theme.destructive} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="600">
                  Clear Cached Data
                </AppText>
                <AppText variant="caption" color="muted">
                  Free up local storage space
                </AppText>
              </View>
              <ChevronRight size={16} color={theme.mutedForeground} />
            </Pressable>
          </AppCard>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <AppCard style={[styles.card, { alignItems: "center" }]}>
            <AppText variant="body" weight="700">
              {APP_NAME}
            </AppText>
            <AppText variant="caption" color="muted">
              Version {APP_VERSION} • Production Build
            </AppText>
          </AppCard>
        </View>

        {/* Logout Button */}
        <AppButton
          title="Sign Out"
          variant="destructive"
          icon={<LogOut size={16} color="#FFFFFF" />}
          size="lg"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    padding: 14,
  },
  themeOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeOption: {
    flex: 0.31,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  logoutBtn: {
    marginTop: 24,
    marginBottom: 40,
  },
});

export default SettingsScreen;
