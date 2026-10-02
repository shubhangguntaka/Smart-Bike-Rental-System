import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from "react-native";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  Star,
  Phone,
  Mail,
  HelpCircle,
  Settings,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { bookingService } from "../../services/bookingService";
import Animated from "react-native-reanimated";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";
import { colors, useTheme } from "../../theme";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, refreshProfile } = useAuthStore();
  const { scrollHandler } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<Animated.ScrollView>();
  const { theme, isDark } = useTheme();

  const [verificationInfo, setVerificationInfo] = useState<{
    aadhaarVerified: boolean;
    dlVerified: boolean;
  }>({ aadhaarVerified: false, dlVerified: false });

  useEffect(() => {
    refreshProfile();
    if (user?.id) {
      bookingService.getVerificationDetails(Number(user.id)).then((d) => {
        setVerificationInfo({
          aadhaarVerified: d.aadhaarVerified,
          dlVerified: d.dlVerified,
        });
      });
    }
  }, [user?.id, refreshProfile]);

  const fullName = user?.fullName || user?.name || "Customer User";
  const email = user?.email || "customer@example.com";
  const phone = user?.phoneNumber || "Not provided";

  const getInitials = () => {
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "U")).toUpperCase();
  };

  const isVerified = verificationInfo.aadhaarVerified && verificationInfo.dlVerified;

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from your customer account?",
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
    <AppScreen edges={["top"]} scrollable={false}>
      <Animated.ScrollView
        ref={scrollRef}
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* User Card */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
          className="p-5 rounded-3xl border shadow-xs flex-row items-center gap-4"
        >
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ borderColor: theme.border }}
              className="w-16 h-16 rounded-2xl border"
            />
          ) : (
            <View className="w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center border border-primary/25">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xl font-black text-primary"
              >
                {getInitials()}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-lg font-black text-foreground"
                numberOfLines={1}
              >
                {fullName}
              </Text>
              {isVerified && <ShieldCheck size={16} color="#059669" />}
            </View>

            <View className="flex-row items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Mail size={12} color={theme.mutedForeground} />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground"
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>

            <View className="flex-row items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Phone size={12} color={theme.mutedForeground} />
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-xs text-muted-foreground"
              >
                {phone}
              </Text>
            </View>
          </View>
        </View>

        {/* KYC Status Widget */}
        <Pressable
          onPress={() => navigation.navigate("VerificationScreen")}
          style={{
            backgroundColor: isVerified ? "rgba(5, 150, 105, 0.08)" : "rgba(217, 119, 6, 0.08)",
            borderColor: isVerified ? "rgba(5, 150, 105, 0.25)" : "rgba(217, 119, 6, 0.25)",
          }}
          className="p-4 rounded-2xl border flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            {isVerified ? (
              <ShieldCheck size={20} color="#059669" />
            ) : (
              <ShieldAlert size={20} color="#D97706" />
            )}
            <View>
              <Text
                style={{ fontFamily: "Antic" }}
                className={`text-xs font-bold ${
                  isVerified
                    ? "text-emerald-900 dark:text-emerald-300"
                    : "text-amber-900 dark:text-amber-300"
                }`}
              >
                {isVerified ? "KYC Identity Verified" : "KYC Documents Incomplete"}
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className={`text-[10px] ${
                  isVerified
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {isVerified
                  ? "Aadhaar & Driving License Approved"
                  : "Upload required documents for full rental access"}
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={isVerified ? "#059669" : "#D97706"} />
        </Pressable>

        {/* Account Menu Section */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
          className="p-4 rounded-3xl border shadow-xs space-y-1"
        >
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1"
          >
            My Account
          </Text>

          <Pressable
            onPress={() => navigation.navigate("EditProfileScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <User size={16} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                Edit Profile Details
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("PaymentHistoryScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-blue-500/10 items-center justify-center">
                <CreditCard size={16} color="#2563EB" />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                Payment History & Invoices
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("RideHistoryScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
                <ShieldCheck size={16} color="#059669" />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                Ride History & Telemetry
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("ReviewsScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-amber-500/10 items-center justify-center">
                <Star size={16} color="#D97706" />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                My Reviews
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("SettingsScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-indigo-500/10 items-center justify-center">
                <Settings size={16} color="#6366F1" />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                App Preferences & Theme
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("ChangePasswordScreen")}
            className="flex-row items-center justify-between p-3 rounded-2xl active:bg-muted"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-purple-500/10 items-center justify-center">
                <Lock size={16} color="#9333EA" />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                Change Password
              </Text>
            </View>
            <ChevronRight size={16} color={theme.mutedForeground} />
          </Pressable>
        </View>

        {/* Support Card */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
          className="p-4 rounded-3xl border shadow-xs space-y-1"
        >
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1"
          >
            Customer Support & Legal
          </Text>

          <View className="p-3 flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-xl bg-muted/60 items-center justify-center">
              <HelpCircle size={16} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-foreground"
              >
                24/7 Roadside Support Hotline
              </Text>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-[11px] text-primary mt-0.5"
              >
                1800-SMART-BIKE (Toll Free)
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <AppButton
          title="Sign Out"
          variant="outline"
          size="lg"
          leftIcon={<LogOut size={16} color="#E11D48" />}
          onPress={handleLogout}
          className="mt-2 border-destructive/30 active:bg-destructive/10"
        />
      </Animated.ScrollView>
    </AppScreen>
  );
}
