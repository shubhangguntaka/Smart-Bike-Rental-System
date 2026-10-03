import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  PlusCircle,
  Bike,
  CalendarClock,
  TrendingUp,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Star,
  Navigation,
  ChevronRight,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerDashboard } from "../../hooks/useOwnerDashboard";
import { useOwnerBookings } from "../../hooks/useOwnerBookings";
import { useOwnerBikes } from "../../hooks/useOwnerBikes";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import OwnerHeader from "../../components/navigation/OwnerHeader";
import AppScreen from "../../components/common/AppScreen";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import AppErrorState from "../../components/common/AppErrorState";
import BookingRequestCard from "../../components/cards/BookingRequestCard";
import EarningStatCard from "../../components/cards/EarningStatCard";
import { formatCurrency } from "../../utils/formatters";

export const OwnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const {
    dashboardData,
    isLoading: isLoadingDashboard,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useOwnerDashboard();

  const {
    bookings,
    approveBooking,
    rejectBooking,
    isApproving,
    isRejecting,
    refetchBookings,
  } = useOwnerBookings();

  const { bikes, refetchBikes } = useOwnerBikes();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDashboard(), refetchBookings(), refetchBikes()]);
    setRefreshing(false);
  };

  const handleAccept = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      Alert.alert("Success", "Booking approved successfully!");
    } catch (err: any) {
      Alert.alert(
        "Action Failed",
        err.response?.data?.message || "Could not approve booking."
      );
    }
  };

  const handleReject = (bookingId: number) => {
    Alert.alert(
      "Reject Booking",
      "Are you sure you want to reject this booking request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectBooking(bookingId);
              Alert.alert("Booking Rejected", "The booking request was rejected.");
            } catch (err: any) {
              Alert.alert(
                "Action Failed",
                err.response?.data?.message || "Could not reject booking."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoadingDashboard && !dashboardData) {
    return <AppLoader fullScreen message="Loading Owner Dashboard..." />;
  }

  if (isDashboardError && !dashboardData) {
    return (
      <AppErrorState
        title="Dashboard Error"
        message="Could not load owner dashboard data from server."
        onRetry={handleRefresh}
      />
    );
  }

  const pendingRequests = bookings.filter(
    (b) => (b.bookingStatus || "").toUpperCase() === "PENDING"
  );
  const activeRentals = bookings.filter(
    (b) =>
      (b.bookingStatus || "").toUpperCase() === "CONFIRMED" ||
      (b.bookingStatus || "").toUpperCase() === "APPROVED" ||
      (b.bookingStatus || "").toUpperCase() === "RENTED" ||
      (b.bookingStatus || "").toUpperCase() === "IN_PROGRESS"
  );

  return (
    <AppScreen
      onScroll={onScroll}
      scrollRef={scrollRef}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <OwnerHeader />

      {/* KPI Stats Overview */}
      <View style={styles.statsSection}>
        <View style={styles.kpiRow}>
          {/* Total Earnings Card */}
          <AppCard
            onPress={() => navigation.navigate("EarningsTab")}
            style={[
              styles.kpiCardHero,
              { backgroundColor: isDark ? "#1E2A22" : "#EAF0EC", borderColor: theme.primary },
            ]}
          >
            <View style={styles.kpiHeroHeader}>
              <AppText variant="caption" color="primary" weight="700">
                TOTAL NET EARNINGS
              </AppText>
              <Wallet size={20} color={theme.primary} />
            </View>
            <AppText variant="h1" weight="700" color="primary" style={styles.kpiHeroAmount}>
              {formatCurrency(dashboardData?.totalEarnings || 0)}
            </AppText>
            <View style={styles.kpiHeroFooter}>
              <AppText variant="caption" color="muted">
                Today:{" "}
                <AppText variant="caption" weight="700" color="foreground">
                  {formatCurrency(dashboardData?.todayEarnings || 0)}
                </AppText>
              </AppText>
              <AppText variant="caption" color="muted">
                Pending:{" "}
                <AppText variant="caption" weight="700" color="foreground">
                  {formatCurrency(dashboardData?.pendingPayments || 0)}
                </AppText>
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* 4 Stats Grid */}
        <View style={styles.gridRow}>
          <AppCard
            onPress={() => navigation.navigate("MyBikesTab")}
            style={styles.gridCard}
          >
            <View style={styles.gridCardHeader}>
              <Bike size={18} color={theme.primary} />
              <AppBadge
                label={`${dashboardData?.availableBikes || 0} Avail`}
                variant="success"
                size="sm"
              />
            </View>
            <AppText variant="h2" weight="700">
              {dashboardData?.totalBikes ?? bikes.length}
            </AppText>
            <AppText variant="caption" color="muted">
              Total Fleet Bikes
            </AppText>
          </AppCard>

          <AppCard
            onPress={() => navigation.navigate("BookingsTab")}
            style={styles.gridCard}
          >
            <View style={styles.gridCardHeader}>
              <CalendarClock size={18} color="#F59E0B" />
              <AppBadge
                label={`${pendingRequests.length} New`}
                variant="warning"
                size="sm"
              />
            </View>
            <AppText variant="h2" weight="700">
              {dashboardData?.pendingBookings ?? pendingRequests.length}
            </AppText>
            <AppText variant="caption" color="muted">
              Pending Requests
            </AppText>
          </AppCard>
        </View>

        <View style={styles.gridRow}>
          <AppCard
            onPress={() => navigation.navigate("CurrentRentalsScreen")}
            style={styles.gridCard}
          >
            <View style={styles.gridCardHeader}>
              <Navigation size={18} color="#3B82F6" />
              <AppBadge
                label="Live"
                variant="info"
                size="sm"
              />
            </View>
            <AppText variant="h2" weight="700">
              {dashboardData?.bookedBikes ?? activeRentals.length}
            </AppText>
            <AppText variant="caption" color="muted">
              Active Rentals
            </AppText>
          </AppCard>

          <AppCard
            onPress={() => navigation.navigate("EarningsTab")}
            style={styles.gridCard}
          >
            <View style={styles.gridCardHeader}>
              <TrendingUp size={18} color={theme.primary} />
              <AppBadge
                label="Month"
                variant="primary"
                size="sm"
              />
            </View>
            <AppText variant="h2" weight="700">
              {formatCurrency(dashboardData?.monthlyEarnings || 0)}
            </AppText>
            <AppText variant="caption" color="muted">
              Monthly Revenue
            </AppText>
          </AppCard>
        </View>
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.sectionHeader}>
        <AppText variant="h3" weight="700">
          Quick Actions
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shortcutsScroll}
      >
        <Pressable
          onPress={() => navigation.navigate("AddBikeScreen")}
          style={[styles.shortcutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: "rgba(124,144,130,0.15)" }]}>
            <PlusCircle size={22} color={theme.primary} />
          </View>
          <AppText variant="bodySmall" weight="600" style={styles.shortcutLabel}>
            Add Bike
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("QRScannerScreen")}
          style={[styles.shortcutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
            <QrCode size={22} color="#3B82F6" />
          </View>
          <AppText variant="bodySmall" weight="600" style={styles.shortcutLabel}>
            Scan QR
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("CurrentRentalsScreen")}
          style={[styles.shortcutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
            <Navigation size={22} color="#10B981" />
          </View>
          <AppText variant="bodySmall" weight="600" style={styles.shortcutLabel}>
            Live Rentals
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("VerificationScreen")}
          style={[styles.shortcutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
            <ShieldCheck size={22} color="#F59E0B" />
          </View>
          <AppText variant="bodySmall" weight="600" style={styles.shortcutLabel}>
            KYC & RC
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("ReviewsScreen", {})}
          style={[styles.shortcutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: "rgba(234,179,8,0.15)" }]}>
            <Star size={22} color="#EAB308" />
          </View>
          <AppText variant="bodySmall" weight="600" style={styles.shortcutLabel}>
            Reviews
          </AppText>
        </Pressable>
      </ScrollView>

      {/* Pending Booking Requests */}
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="h3" weight="700">
            Booking Requests
          </AppText>
          <AppText variant="caption" color="muted">
            {pendingRequests.length} awaiting your approval
          </AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate("BookingsTab")}
          style={styles.viewAllBtn}
        >
          <AppText variant="bodySmall" color="primary" weight="600">
            View All
          </AppText>
          <ChevronRight size={16} color={theme.primary} />
        </Pressable>
      </View>

      <View style={styles.listSection}>
        {pendingRequests.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <CheckCircle2 size={32} color={theme.primary} style={{ marginBottom: 8 }} />
            <AppText variant="body" weight="700">
              All caught up!
            </AppText>
            <AppText variant="caption" color="muted" style={{ textAlign: "center", marginTop: 4 }}>
              No pending booking requests right now.
            </AppText>
          </AppCard>
        ) : (
          pendingRequests.slice(0, 3).map((booking) => (
            <BookingRequestCard
              key={booking.bookingId}
              booking={booking}
              onPress={() =>
                navigation.navigate("BookingDetailsScreen", {
                  bookingId: booking.bookingId,
                  booking,
                })
              }
              onAccept={() => handleAccept(booking.bookingId)}
              onReject={() => handleReject(booking.bookingId)}
              isProcessing={isApproving || isRejecting}
            />
          ))
        )}
      </View>

      {/* Active Rentals Shortcut Banner */}
      {activeRentals.length > 0 && (
        <View style={styles.activeRentalsBanner}>
          <AppCard
            onPress={() => navigation.navigate("CurrentRentalsScreen")}
            style={[styles.bannerCard, { backgroundColor: isDark ? "#1E2A38" : "#EBF5FF" }]}
          >
            <View style={styles.bannerRow}>
              <View style={styles.bannerLeft}>
                <Navigation size={24} color="#3B82F6" style={{ marginRight: 12 }} />
                <View>
                  <AppText variant="body" weight="700" style={{ color: "#1E429F" }}>
                    {activeRentals.length} Bike{activeRentals.length > 1 ? "s" : ""} Currently on Ride
                  </AppText>
                  <AppText variant="caption" style={{ color: "#3B82F6" }}>
                    Track live location and view return status
                  </AppText>
                </View>
              </View>
              <ChevronRight size={20} color="#3B82F6" />
            </View>
          </AppCard>
        </View>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  kpiRow: {
    marginBottom: 10,
  },
  kpiCardHero: {
    padding: 18,
    borderRadius: 16,
  },
  kpiHeroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  kpiHeroAmount: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 12,
  },
  kpiHeroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,144,130,0.2)",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridCard: {
    flex: 0.485,
    padding: 14,
    borderRadius: 14,
  },
  gridCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  shortcutsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  shortcutBtn: {
    width: 88,
    height: 94,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    padding: 8,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  shortcutLabel: {
    textAlign: "center",
  },
  listSection: {
    paddingHorizontal: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activeRentalsBanner: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  bannerCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});

export default OwnerDashboardScreen;
