import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  User,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Bike,
  TrendingUp,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Edit,
} from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { useOwnerDashboard } from "../../hooks/useOwnerDashboard";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import { getInitials } from "../../utils/helpers";
import { formatCurrency } from "../../utils/formatters";

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const { user, ownerProfile, logout, refreshProfile } = useAuthStore();
  const { dashboardData } = useOwnerDashboard();

  const [refreshing, setRefreshing] = useState(false);

  const ownerName = ownerProfile?.ownerName || user?.fullName || user?.name || "Owner";
  const email = ownerProfile?.email || user?.email || "owner@example.com";
  const phone = ownerProfile?.phone || ownerProfile?.phoneNumber || user?.phoneNumber || user?.phone || "";
  const isVerified = !!(ownerProfile?.verificationStatus ?? user?.isVerified);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your Owner account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <AppScreen
      onScroll={onScroll}
      scrollRef={scrollRef}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      {/* Profile Info Card */}
      <AppCard style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <AppText variant="h2" weight="700" style={{ color: "#FFFFFF" }}>
              {getInitials(ownerName)}
            </AppText>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <AppText variant="h3" weight="700">
                {ownerName}
              </AppText>
            </View>
            <AppText variant="bodySmall" color="muted">
              {email}
            </AppText>
            {phone ? (
              <AppText variant="caption" color="muted">
                {phone}
              </AppText>
            ) : null}
          </View>

          <Pressable
            onPress={() => navigation.navigate("EditProfileScreen")}
            style={styles.editBtn}
          >
            <Edit size={18} color={theme.primary} />
          </Pressable>
        </View>

        {/* Verification Badge Bar */}
        <View
          style={[
            styles.verificationBar,
            {
              backgroundColor: isVerified
                ? isDark
                  ? "#1E2A22"
                  : "#DEF7EC"
                : isDark
                ? "#2E2A1E"
                : "#FEF3C7",
            },
          ]}
        >
          {isVerified ? (
            <ShieldCheck size={18} color="#22C55E" style={{ marginRight: 8 }} />
          ) : (
            <ShieldAlert size={18} color="#F59E0B" style={{ marginRight: 8 }} />
          )}
          <View style={{ flex: 1 }}>
            <AppText variant="bodySmall" weight="700">
              {isVerified ? "Verified Partner Status" : "Verification Incomplete"}
            </AppText>
            <AppText variant="caption" color="muted">
              {isVerified
                ? "Your account and documents are approved"
                : "Upload your Aadhaar & RC to get verified"}
            </AppText>
          </View>
          <ChevronRight size={16} color={theme.mutedForeground} />
        </View>
      </AppCard>

      {/* Overview Stats */}
      <View style={styles.statsRow}>
        <AppCard style={styles.statBox}>
          <AppText variant="h3" weight="700" color="primary">
            {dashboardData?.totalBikes ?? 0}
          </AppText>
          <AppText variant="caption" color="muted">
            Fleet Bikes
          </AppText>
        </AppCard>

        <AppCard style={styles.statBox}>
          <AppText variant="h3" weight="700" color="primary">
            {dashboardData?.totalBookings ?? 0}
          </AppText>
          <AppText variant="caption" color="muted">
            Total Rides
          </AppText>
        </AppCard>

        <AppCard style={styles.statBox}>
          <AppText variant="h3" weight="700" color="primary">
            {formatCurrency(dashboardData?.totalEarnings || 0)}
          </AppText>
          <AppText variant="caption" color="muted">
            Lifetime
          </AppText>
        </AppCard>
      </View>

      {/* Menu Navigation Sections */}
      <View style={styles.menuSection}>
        <AppText variant="caption" color="muted" weight="700" style={styles.menuHeader}>
          MANAGEMENT & SETTLEMENTS
        </AppText>

        <AppCard style={styles.menuCard}>
          <Pressable
            onPress={() => navigation.navigate("BankAccountScreen")}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(124,144,130,0.15)" }]}>
              <Building2 size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="600">
                Payout Bank Account
              </AppText>
              <AppText variant="caption" color="muted">
                Direct deposit settings for rental payouts
              </AppText>
            </View>
            <ChevronRight size={18} color={theme.mutedForeground} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => navigation.navigate("VerificationScreen")}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
              <ShieldCheck size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="600">
                KYC & Documents Verification
              </AppText>
              <AppText variant="caption" color="muted">
                Aadhaar, RC, Insurance & DL status
              </AppText>
            </View>
            <ChevronRight size={18} color={theme.mutedForeground} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => navigation.navigate("ReviewsScreen", {})}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(234,179,8,0.15)" }]}>
              <Star size={18} color="#EAB308" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="600">
                Customer Reviews
              </AppText>
              <AppText variant="caption" color="muted">
                Feedback and ratings for your fleet
              </AppText>
            </View>
            <ChevronRight size={18} color={theme.mutedForeground} />
          </Pressable>
        </AppCard>
      </View>

      {/* App Settings & Logout */}
      <View style={styles.menuSection}>
        <AppText variant="caption" color="muted" weight="700" style={styles.menuHeader}>
          PREFERENCES
        </AppText>

        <AppCard style={styles.menuCard}>
          <Pressable
            onPress={() => navigation.navigate("SettingsScreen")}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.muted }]}>
              <Settings size={18} color={theme.foreground} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="600">
                Application Settings
              </AppText>
              <AppText variant="caption" color="muted">
                Theme mode, notifications, regional display
              </AppText>
            </View>
            <ChevronRight size={18} color={theme.mutedForeground} />
          </Pressable>
        </AppCard>
      </View>

      {/* Logout Button */}
      <AppButton
        title="Sign Out"
        variant="destructive"
        leftIcon={<LogOut size={18} color="#FFFFFF" />}
        size="lg"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  profileCard: {
    padding: 16,
    marginTop: 12,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editBtn: {
    padding: 8,
  },
  verificationBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statBox: {
    flex: 0.31,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuSection: {
    marginTop: 20,
  },
  menuHeader: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  logoutBtn: {
    marginTop: 28,
    marginBottom: 40,
  },
});

export default ProfileScreen;
