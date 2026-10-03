import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  XCircle,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  User,
  ArrowRight,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { bookingService } from "../../services/bookingService";
import { Booking } from "../../types/booking";
import Animated from "react-native-reanimated";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import CancelBookingModal from "../../components/forms/CancelBookingModal";
import { formatDateTime, renderStatusBadge } from "../../components/cards/BookingCard";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";
import { useTheme } from "../../theme";

export default function BookingDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { scrollHandler } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const bookingId = route.params?.bookingId;
  const initialBooking = route.params?.booking as Booking | undefined;

  const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      try {
        const data = await bookingService.getBookingById(Number(bookingId));
        if (data) setBooking(data);
      } catch (err) {
        console.error("Failed to load booking:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const bStatus = (booking.bookingStatus || "PENDING").toUpperCase();
  const isCancellable =
    bStatus === "PENDING" ||
    bStatus === "VERIFICATION_REQUIRED" ||
    bStatus === "APPROVED" ||
    bStatus === "CONFIRMED";

  const isConfirmed =
    bStatus === "CONFIRMED" || bStatus === "ACTIVE" || bStatus === "APPROVED";

  const isCompleted = bStatus === "COMPLETED";

  const handleCancel = async (reason: string) => {
    try {
      setCancelling(true);
      const updated = await bookingService.cancelBooking(booking.bookingId, reason);
      setBooking(updated);
      setCancelModalVisible(false);
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title={`Booking Receipt BR-${booking.bookingId}`} showBack />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1 px-5 py-4 space-y-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-xs text-muted-foreground font-bold"
              >
                Booking ID: BR-{booking.bookingId}
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-lg font-black text-foreground mt-0.5"
              >
                {booking.bikeName || "Rental Motorcycle"}
              </Text>
            </View>

            {renderStatusBadge(bStatus)}
          </View>

          {isConfirmed && (
            <View className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <QrCode size={18} color="#059669" />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-300"
                >
                  Digital QR Pass Ready
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  navigation.navigate("BookingQRCodeScreen", {
                    bookingId: booking.bookingId,
                    booking,
                  })
                }
              >
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-emerald-700 underline"
                >
                  View QR
                </Text>
              </Pressable>
            </View>
          )}

          {bStatus === "CANCELLED" && booking.cancellationReason && (
            <View className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-1">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-destructive"
              >
                Cancellation Reason
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-foreground"
              >
                {booking.cancellationReason}
              </Text>
              {booking.cancelledBy && (
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground"
                >
                  Cancelled by: {booking.cancelledBy}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Schedule & Location */}
        <View className="p-5 rounded-3xl bg-card border border-border/80 space-y-3.5">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Rental Schedule & Location
          </Text>

          <View className="space-y-2.5">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Calendar size={14} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Pickup Schedule
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  {formatDateTime(booking.startTime)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Clock size={14} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Return Schedule
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  {formatDateTime(booking.returnTime)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <MapPin size={14} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Hub Pickup Location
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  {booking.location || "Hyderabad Hub Station"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Host Info */}
        {booking.ownerName && (
          <View className="p-4 rounded-3xl bg-card border border-border/80 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <User size={18} color={theme.primary} />
              </View>
              <View>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground font-bold uppercase"
                >
                  Bike Host
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-sm font-bold text-foreground"
                >
                  {booking.ownerName}
                </Text>
              </View>
            </View>
            <ShieldCheck size={20} color="#059669" />
          </View>
        )}

        {/* Fare Summary */}
        <View className="p-5 rounded-3xl bg-card border border-border/80 space-y-3">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Payment Breakdown
          </Text>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Rental Fare
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{booking.rentalAmount || booking.totalAmount}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Platform Fee & Insurance
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-emerald-600">
              Included
            </Text>
          </View>

          <View className="pt-2 border-t border-border/60 flex-row justify-between items-center">
            <Text style={{ fontFamily: "Antic" }} className="text-sm font-bold text-foreground">
              Total Amount
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="text-2xl font-black text-foreground">
              ₹{booking.totalAmount}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 border-t border-border/80 flex-row gap-3 backdrop-blur-md">
        {isConfirmed && (
          <AppButton
            title="View QR Code"
            variant="outline"
            className="flex-1"
            leftIcon={<QrCode size={16} color={theme.foreground} />}
            onPress={() =>
              navigation.navigate("BookingQRCodeScreen", {
                bookingId: booking.bookingId,
                booking,
              })
            }
          />
        )}

        {isConfirmed && (
          <AppButton
            title="Track Ride"
            variant="primary"
            className="flex-1"
            leftIcon={<Navigation size={16} color="#FFFFFF" />}
            onPress={() =>
              navigation.navigate("LiveTrackingScreen", {
                bookingId: booking.bookingId,
                booking,
              })
            }
          />
        )}

        {isCompleted && booking.paymentStatus !== "SUCCESS" && (
          <AppButton
            title="Pay Final Bill"
            variant="primary"
            className="flex-1"
            leftIcon={<CreditCard size={16} color="#FFFFFF" />}
            onPress={() =>
              navigation.navigate("PaymentScreen", {
                bookingId: booking.bookingId,
                booking,
              })
            }
          />
        )}

        {isCancellable && (
          <AppButton
            title="Cancel"
            variant="destructive"
            className="px-4"
            onPress={() => setCancelModalVisible(true)}
          />
        )}
      </View>

      {/* Cancel Modal */}
      <CancelBookingModal
        visible={cancelModalVisible}
        bookingId={booking.bookingId}
        bikeName={booking.bikeName}
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelModalVisible(false)}
      />
    </AppScreen>
  );
}
