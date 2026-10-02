import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  Bike as BikeIcon,
  Clock,
  Navigation,
  MapPin,
  Calendar,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { gpsService } from "../../services/gpsService";
import { Ride } from "../../types/gps";
import { useAuthStore } from "../../store/authStore";
import AppHeader from "../../components/common/AppHeader";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export function formatRideDuration(startTime?: string, endTime?: string): string {
  if (!startTime) return "—";
  try {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diffSec = Math.max(0, Math.floor((end - start) / 1000));
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  } catch {
    return "—";
  }
}

export function formatRideDate(value?: string): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function RideHistoryScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { theme, isDark } = useTheme();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const customerId = user?.id ? Number(user.id) : undefined;

  const loadRides = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      setErrorMessage("Customer authentication is required to view ride telemetry.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await gpsService.getCustomerRides(customerId);
      setRides(data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load past ride history.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const renderRideCard = ({ item }: { item: Ride }) => {
    const distanceText =
      item.totalDistance != null && item.totalDistance >= 0
        ? `${Number(item.totalDistance).toFixed(2)} km`
        : "— km";

    const isLive = item.status === "STARTED" || item.status === "RESUMED";
    const isPaused = item.status === "PAUSED";

    return (
      <View
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
        className="p-4 rounded-3xl border shadow-xs mb-3.5 space-y-3"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
              <BikeIcon size={16} color={theme.primary} />
            </View>
            <View>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-xs font-bold text-foreground"
              >
                Ride #{item.rideId || item.id || item.bookingId}
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[11px] text-muted-foreground"
              >
                Booking BR-{item.bookingId}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: isLive
                ? "rgba(5, 150, 105, 0.1)"
                : isPaused
                ? "rgba(217, 119, 6, 0.1)"
                : "rgba(107, 114, 128, 0.1)",
              borderColor: isLive
                ? "rgba(5, 150, 105, 0.25)"
                : isPaused
                ? "rgba(217, 119, 6, 0.25)"
                : theme.border,
            }}
            className="px-2.5 py-1 rounded-full border flex-row items-center gap-1"
          >
            <Text
              style={{
                fontFamily: "Antic",
                color: isLive ? "#059669" : isPaused ? "#D97706" : theme.mutedForeground,
              }}
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              {item.status || "COMPLETED"}
            </Text>
          </View>
        </View>

        {/* Telemetry metrics row */}
        <View
          style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: theme.border }}
          className="p-3 rounded-2xl border flex-row justify-between"
        >
          <View className="items-center flex-1">
            <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground uppercase font-bold">
              Distance
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="text-sm font-black text-foreground mt-0.5">
              {distanceText}
            </Text>
          </View>

          <View style={{ width: 1, backgroundColor: theme.border }} />

          <View className="items-center flex-1">
            <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground uppercase font-bold">
              Duration
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="text-sm font-black text-foreground mt-0.5">
              {formatRideDuration(item.startTime, item.endTime)}
            </Text>
          </View>
        </View>

        {/* Timestamps */}
        <View className="space-y-1 pt-1">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={12} color={theme.mutedForeground} />
            <Text style={{ fontFamily: "Antic" }} className="text-xs text-muted-foreground">
              Start: {formatRideDate(item.startTime)}
            </Text>
          </View>

          {item.endTime && (
            <View className="flex-row items-center gap-1.5">
              <Clock size={12} color={theme.mutedForeground} />
              <Text style={{ fontFamily: "Antic" }} className="text-xs text-muted-foreground">
                End: {formatRideDate(item.endTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Live track link if ongoing */}
        {(isLive || isPaused) && (
          <Pressable
            onPress={() =>
              navigation.navigate("LiveTrackingScreen", {
                bookingId: item.bookingId,
              })
            }
            style={{ backgroundColor: theme.primary }}
            className="p-2.5 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90 mt-1"
          >
            <Navigation size={14} color="#FFFFFF" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-white"
            >
              Open Live GPS Tracking
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <AppHeader title="Ride History & Telemetry" showBack />

      <FlatList
        data={rides}
        keyExtractor={(item) => String(item.rideId || item.id || item.bookingId)}
        renderItem={renderRideCard}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View className="p-12 items-center justify-center space-y-3">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                <Compass size={32} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-base font-bold text-foreground"
              >
                No Ride History Found
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground text-center"
              >
                Completed rides, GPS routes, and distance telemetry will appear here once you take your first ride.
              </Text>
            </View>
          ) : (
            <View className="p-12 items-center justify-center">
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ fontFamily: "Antic" }} className="text-xs text-muted-foreground mt-3">
                Loading your ride history...
              </Text>
            </View>
          )
        }
      />
    </AppScreen>
  );
}
