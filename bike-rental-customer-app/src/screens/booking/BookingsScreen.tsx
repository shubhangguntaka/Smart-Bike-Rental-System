import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import {
  Search,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  CreditCard,
  Star,
  Navigation,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { bookingService } from "../../services/bookingService";
import { reviewService } from "../../services/reviewService";
import { useAuthStore } from "../../store/authStore";
import { Booking } from "../../types/booking";
import { Review } from "../../types/review";
import BookingCard from "../../components/cards/BookingCard";
import CancelBookingModal from "../../components/forms/CancelBookingModal";
import ReviewForm from "../../components/forms/ReviewForm";
import AppModal from "../../components/common/AppModal";
import { useTheme } from "../../theme";
import Animated from "react-native-reanimated";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";

export default function BookingsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { scrollHandler } = useCollapsibleTabBar();
  const flatListRef = useTabScrollToTop<any>();
  const { theme, isDark } = useTheme();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const customerId = Number(user.id);
      const [list, reviews] = await Promise.all([
        bookingService.getCustomerBookings(customerId),
        reviewService.getReviewsByCustomer(customerId).catch(() => []),
      ]);

      setBookings(list);
      setUserReviews(reviews);
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelTarget.bookingId, reason);
      setCancelTarget(null);
      loadBookings();
    } catch (err: any) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (dto: any) => {
    try {
      const existing = userReviews.find((r) => r.bookingId === dto.bookingId);
      if (existing) {
        await reviewService.updateReview(existing.reviewId, dto);
      } else {
        await reviewService.addReview(dto);
      }
      setReviewTarget(null);
      loadBookings();
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const s = (b.bookingStatus || "PENDING").toUpperCase();

    // Status filter
    if (statusFilter === "ACTIVE") {
      if (s !== "APPROVED" && s !== "CONFIRMED" && s !== "ACTIVE") return false;
    } else if (statusFilter === "COMPLETED") {
      if (s !== "COMPLETED") return false;
    } else if (statusFilter === "CANCELLED") {
      if (s !== "CANCELLED") return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const bId = `BR-${b.bookingId}`.toLowerCase();
      const name = (b.bikeName || "").toLowerCase();
      if (!bId.includes(q) && !name.includes(q)) return false;
    }

    return true;
  });

  const statusTabs = [
    { id: "ALL", label: "All" },
    { id: "ACTIVE", label: "Active & Reserved" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 space-y-3">
        <Text
          style={{ fontFamily: "Antic", color: theme.foreground }}
          className="text-2xl font-black"
        >
          My Bookings
        </Text>

        {/* Search */}
        <View className="relative">
          <View className="absolute left-3.5 top-3 z-10">
            <Search size={16} color={theme.mutedForeground} />
          </View>
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search by Booking ID or Bike name..."
            placeholderTextColor={theme.mutedForeground}
            style={{
              fontFamily: "Antic",
              color: theme.foreground,
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
            className="w-full border rounded-2xl pl-10 pr-10 py-2.5 text-xs shadow-2xs"
          />
          {searchTerm.length > 0 && (
            <Pressable
              onPress={() => setSearchTerm("")}
              className="absolute right-3.5 top-3 z-10"
            >
              <X size={16} color={theme.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Status Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setStatusFilter(tab.id)}
                style={{
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                }}
                className="px-3.5 py-1.5 rounded-xl border"
              >
                <Text
                  style={{
                    fontFamily: "Antic",
                    color: isSelected ? theme.primaryForeground : theme.mutedForeground,
                  }}
                  className="text-xs font-bold"
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={filteredBookings}
        keyExtractor={(item) => String(item.bookingId)}
        renderItem={({ item }) => (
          <View className="px-5">
            <BookingCard
              booking={item}
              onPress={(b) =>
                navigation.navigate("BookingDetailsScreen", {
                  bookingId: b.bookingId,
                  booking: b,
                })
              }
              onQrPress={(b) =>
                navigation.navigate("BookingQRCodeScreen", {
                  bookingId: b.bookingId,
                  booking: b,
                })
              }
              onDirectionsPress={(b) =>
                navigation.navigate("LiveTrackingScreen", {
                  bookingId: b.bookingId,
                  booking: b,
                })
              }
              onPayPress={(b) =>
                navigation.navigate("PaymentScreen", {
                  bookingId: b.bookingId,
                  booking: b,
                })
              }
              onCancelPress={(b) => setCancelTarget(b)}
              onReviewPress={(b) => setReviewTarget(b)}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="p-12 items-center justify-center space-y-3">
              <View
                style={{ backgroundColor: isDark ? "rgba(40, 40, 44, 0.6)" : "rgba(232, 230, 225, 0.5)" }}
                className="w-16 h-16 rounded-full items-center justify-center mb-1"
              >
                <Calendar size={28} color={theme.mutedForeground} />
              </View>
              <Text
                style={{ fontFamily: "Antic", color: theme.foreground }}
                className="text-base font-bold text-center"
              >
                No bookings found
              </Text>
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-xs text-center max-w-[260px] leading-relaxed"
              >
                You haven't made any bike reservations under this filter yet.
              </Text>
              <AppButton
                title="Browse Available Fleet"
                size="sm"
                variant="primary"
                onPress={() => navigation.navigate("SearchTab")}
                className="mt-3"
              />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />

      {/* Cancel Booking Dialog */}
      <CancelBookingModal
        visible={Boolean(cancelTarget)}
        bookingId={cancelTarget?.bookingId}
        bikeName={cancelTarget?.bikeName}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />

      {/* Review Dialog */}
      <AppModal
        visible={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title="Review Rental Ride"
        subtitle={reviewTarget?.bikeName}
      >
        {reviewTarget && (
          <ReviewForm
            bookingId={reviewTarget.bookingId}
            bikeId={reviewTarget.bikeId}
            customerId={Number(user?.id || 1)}
            initialRating={
              userReviews.find((r) => r.bookingId === reviewTarget.bookingId)?.rating || 5
            }
            initialMessage={
              userReviews.find((r) => r.bookingId === reviewTarget.bookingId)?.reviewMessage || ""
            }
            isEditMode={userReviews.some((r) => r.bookingId === reviewTarget.bookingId)}
            onSubmit={handleReviewSubmit}
            onCancel={() => setReviewTarget(null)}
          />
        )}
      </AppModal>
    </AppScreen>
  );
}
