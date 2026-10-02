import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
} from "react-native";
import {
  Bike as BikeIcon,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Sparkles,
  Compass,
  Calendar,
  Zap,
  ListTodo,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Bell,
  Search,
  Sun,
  Moon,
  Smartphone,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { bikeService } from "../../services/bikeService";
import { bookingService } from "../../services/bookingService";
import { Bike } from "../../types/bike";
import { Booking } from "../../types/booking";
import { BikeCard } from "../../components/cards/BikeCard";
import { colors, useTheme } from "../../theme";
import Animated from "react-native-reanimated";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { scrollHandler } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<Animated.ScrollView>();
  const { theme, isDark, themeMode, toggleTheme } = useTheme();

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [verificationInfo, setVerificationInfo] = useState<{
    aadhaarVerified: boolean;
    dlVerified: boolean;
    aadhaarStatus?: string;
    dlStatus?: string;
  }>({ aadhaarVerified: false, dlVerified: false });

  const loadData = useCallback(async () => {
    try {
      const customerId = user?.id ? Number(user.id) : undefined;
      const [bikesData, bookingsData, verifData] = await Promise.all([
        bikeService.getAllBikes(),
        customerId ? bookingService.getCustomerBookings(customerId) : Promise.resolve([]),
        customerId ? bookingService.getVerificationDetails(customerId) : Promise.resolve(null),
      ]);

      setBikes(bikesData);
      setUserBookings(bookingsData);

      if (verifData) {
        setVerificationInfo({
          aadhaarVerified: verifData.aadhaarVerified,
          dlVerified: verifData.dlVerified,
          aadhaarStatus: verifData.aadhaarData?.status,
          dlStatus: verifData.dlData?.status,
        });
      }

      if (customerId) {
        fetchNotifications(customerId);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.fullName?.split(" ")[0] ||
    "Rider";

  const getInitials = () => {
    const name = user?.fullName || user?.name || "Customer User";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "U")).toUpperCase();
  };

  const isVerified = verificationInfo.aadhaarVerified && verificationInfo.dlVerified;

  const activeRentalsCount = userBookings.filter(
    (b) =>
      b.bookingStatus === "APPROVED" ||
      b.bookingStatus === "CONFIRMED" ||
      b.bookingStatus === "ACTIVE"
  ).length;

  const categories = [
    { id: "ALL", label: "All Fleet" },
    { id: "PETROL", label: "Petrol" },
    { id: "ELECTRIC", label: "EV Scooters" },
  ];

  const filteredBikes = bikes.filter((b) => {
    if (selectedCategory === "ALL") return true;
    const isEv = (b.fuelType || "").toUpperCase().includes("ELECTRIC");
    if (selectedCategory === "ELECTRIC") return isEv;
    if (selectedCategory === "PETROL") return !isEv;
    return true;
  });

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <Animated.ScrollView
        ref={scrollRef}
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Top Header Card */}
        <View className="px-5 pt-2 pb-2">
          <View className="flex-row items-center justify-between py-3">
            {/* Left: Avatar + Customer Greeting & Identity */}
            <View className="flex-1 flex-row items-center gap-3 pr-3">
              {/* Profile Avatar Button */}
              <Pressable
                onPress={() => navigation.navigate("ProfileTab")}
                accessibilityRole="button"
                accessibilityLabel="My Profile"
                style={{ backgroundColor: isDark ? "rgba(124, 144, 130, 0.2)" : "rgba(124, 144, 130, 0.12)", borderColor: theme.border }}
                className="w-12 h-12 rounded-2xl border items-center justify-center overflow-hidden active:opacity-80 shadow-2xs"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-base font-black text-primary"
                  >
                    {getInitials()}
                  </Text>
                )}
              </Pressable>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text
                    style={{ fontFamily: "Antic", color: theme.foreground }}
                    className="text-lg font-black"
                    numberOfLines={1}
                  >
                    Hi, {firstName}! 👋
                  </Text>
                  {isVerified && (
                    <ShieldCheck size={16} color="#059669" />
                  )}
                </View>
                <Text
                  style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  Ready to find and unlock your ride?
                </Text>
              </View>
            </View>

            {/* Right: Theme Toggle & Notification Buttons */}
            <View className="flex-row items-center gap-2">
              {/* Theme Toggle Button (Light / Dark / System) */}
              <Pressable
                onPress={toggleTheme}
                accessibilityRole="button"
                accessibilityLabel={`Current theme: ${themeMode}. Tap to toggle theme.`}
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                className="w-11 h-11 rounded-2xl border items-center justify-center relative active:opacity-80 shadow-2xs"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {themeMode === "light" && (
                  <Sun size={20} color="#D97706" />
                )}
                {themeMode === "dark" && (
                  <Moon size={20} color="#818CF8" />
                )}
                {themeMode === "system" && (
                  <Smartphone size={20} color={theme.primary} />
                )}
              </Pressable>

              {/* Notification Bell Button */}
              <Pressable
                onPress={() => navigation.navigate("NotificationsScreen")}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                className="w-11 h-11 rounded-2xl border items-center justify-center relative active:opacity-80 shadow-2xs"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Bell size={20} color={theme.foreground} />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-destructive rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center border-2 border-card">
                    <Text
                      style={{ fontFamily: "JetBrainsMono", color: "#FFFFFF" }}
                      className="text-[9px] font-bold"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

        {/* KYC Verification Alert Banner */}
        {!isVerified && (
          <Pressable
            onPress={() => navigation.navigate("VerificationScreen")}
            style={{
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.08)",
              borderColor: isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(245, 158, 11, 0.25)",
            }}
            className="mt-3 p-3.5 rounded-2xl border flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5 flex-1 pr-2">
              <ShieldAlert size={20} color={isDark ? "#FBBF24" : "#D97706"} />
              <View className="flex-1">
                <Text
                  style={{
                    fontFamily: "Antic",
                    color: isDark ? "#FDE68A" : "#92400E",
                  }}
                  className="text-xs font-bold"
                >
                  Identity Verification Pending
                </Text>
                <Text
                  style={{
                    fontFamily: "Antic",
                    color: isDark ? "#FCD34D" : "#B45309",
                  }}
                  className="text-[11px]"
                >
                  Upload Aadhaar & Driving License for keyless instant rentals.
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={isDark ? "#FBBF24" : "#D97706"} />
          </Pressable>
        )}
      </View>

      {/* Metrics Row */}
      <View className="px-5 py-3">
        <View className="flex-row gap-3">
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3.5 rounded-2xl border shadow-xs"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                My Rides
              </Text>
              <BikeIcon size={14} color={theme.primary} />
            </View>
            <Text
              style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
              className="text-xl font-black"
            >
              {userBookings.length}
            </Text>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-[10px]"
            >
              Total bookings
            </Text>
          </View>

          <View
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3.5 rounded-2xl border shadow-xs"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Active
              </Text>
              <Zap size={14} color="#059669" />
            </View>
            <Text
              style={{ fontFamily: "JetBrainsMono", color: isDark ? "#34D399" : "#059669" }}
              className="text-xl font-black"
            >
              {activeRentalsCount}
            </Text>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-[10px]"
            >
              Ongoing rentals
            </Text>
          </View>

          <View
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3.5 rounded-2xl border shadow-xs"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Fleet
              </Text>
              <Compass size={14} color={theme.primary} />
            </View>
            <Text
              style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
              className="text-xl font-black"
            >
              {bikes.length}
            </Text>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-[10px]"
            >
              Available nearby
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Navigation Grid */}
      <View className="px-5 py-2">
        <Text
          style={{ fontFamily: "Antic", color: theme.mutedForeground }}
          className="text-xs font-bold uppercase tracking-wider mb-3"
        >
          Quick Actions
        </Text>
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={() => navigation.navigate("SearchTab")}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3 rounded-2xl border items-center justify-center active:opacity-80 shadow-xs"
          >
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-1.5">
              <Compass size={18} color={theme.primary} />
            </View>
            <Text
              style={{ fontFamily: "Antic", color: theme.foreground }}
              className="text-xs font-bold"
            >
              Browse Fleet
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("BookingsTab")}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3 rounded-2xl border items-center justify-center active:opacity-80 shadow-xs"
          >
            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mb-1.5">
              <ListTodo size={18} color="#059669" />
            </View>
            <Text
              style={{ fontFamily: "Antic", color: theme.foreground }}
              className="text-xs font-bold"
            >
              My Bookings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("MapExploreScreen")}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3 rounded-2xl border items-center justify-center active:opacity-80 shadow-xs"
          >
            <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mb-1.5">
              <MapPin size={18} color="#2563EB" />
            </View>
            <Text
              style={{ fontFamily: "Antic", color: theme.foreground }}
              className="text-xs font-bold"
            >
              Live Map
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("VerificationScreen")}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            className="flex-1 p-3 rounded-2xl border items-center justify-center active:opacity-80 shadow-xs"
          >
            <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mb-1.5">
              <FileText size={18} color="#9333EA" />
            </View>
            <Text
              style={{ fontFamily: "Antic", color: theme.foreground }}
              className="text-xs font-bold"
            >
              KYC Docs
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Available Bikes Header + Filter Pills */}
      <View className="px-5 pt-5 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text
              style={{ fontFamily: "Antic", color: theme.foreground }}
              className="text-base font-bold"
            >
              Available Rides Near You
            </Text>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-xs"
            >
              Verified bikes listed by verified hosts
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("SearchTab")}
            className="flex-row items-center gap-1"
          >
            <Text
              style={{ fontFamily: "Antic", color: theme.primary }}
              className="text-xs font-bold"
            >
              See All
            </Text>
            <ArrowRight size={13} color={theme.primary} />
          </Pressable>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="mb-4"
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={{
                backgroundColor: selectedCategory === cat.id ? theme.primary : theme.card,
                borderColor: selectedCategory === cat.id ? theme.primary : theme.border,
              }}
              className="px-3.5 py-1.5 rounded-xl border active:opacity-80"
            >
              <Text
                style={{ fontFamily: "Antic" }}
                className={`text-xs font-bold ${
                  selectedCategory === cat.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Bike Cards List */}
        {filteredBikes.slice(0, 5).map((bike) => (
          <BikeCard
            key={bike.bikeId || bike.id || bike.registrationNumber}
            bike={bike}
            onPress={(b) =>
              navigation.navigate("BikeDetailsScreen", {
                bikeId: b.bikeId || b.id,
                bike: b,
              })
            }
            onBookPress={(b) =>
              navigation.navigate("BookingScreen", {
                bikeId: b.bikeId || b.id,
                bike: b,
              })
            }
          />
        ))}

        {filteredBikes.length === 0 && !loading && (
          <View className="p-8 rounded-3xl border border-dashed border-border bg-card items-center justify-center space-y-2">
            <BikeIcon size={32} color="#9CA3AF" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-muted-foreground"
            >
              No bikes available in this category
            </Text>
          </View>
        )}
      </View>

      {/* Roadside Assistance & Help Card */}
      <View className="px-5 pt-3">
        <View className="p-5 rounded-3xl bg-primary/10 border border-primary/20 space-y-2">
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color={theme.primary} />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-primary uppercase tracking-wider"
            >
              24/7 Roadside Assistance
            </Text>
          </View>
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-sm font-bold text-foreground"
          >
            Need help on your ride?
          </Text>
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-muted-foreground leading-relaxed"
          >
            Every rental includes real-time GPS tracking and dedicated support.
          </Text>
        </View>
      </View>
    </Animated.ScrollView>
  </AppScreen>
);
}
