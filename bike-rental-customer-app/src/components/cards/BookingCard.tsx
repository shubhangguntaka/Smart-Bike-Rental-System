import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Calendar,
  Clock,
  QrCode,
  Navigation,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react-native";
import { Booking } from "../../types/booking";
import { useTheme } from "../../theme";

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
  onQrPress?: (booking: Booking) => void;
  onDirectionsPress?: (booking: Booking) => void;
  onPayPress?: (booking: Booking) => void;
  onCancelPress?: (booking: Booking) => void;
  onReviewPress?: (booking: Booking) => void;
}

export function formatDateTime(dtStr?: string): string {
  if (!dtStr) return "N/A";
  try {
    const d = new Date(dtStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dtStr;
  }
}

export function renderStatusBadge(status?: string) {
  const s = (status || "PENDING").toUpperCase();

  if (s === "PENDING" || s === "VERIFICATION_REQUIRED") {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
        <Clock size={11} color="#D97706" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
        >
          Waiting Approval
        </Text>
      </View>
    );
  }

  if (s === "APPROVED" || s === "CONFIRMED" || s === "ACTIVE") {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
        <CheckCircle2 size={11} color="#059669" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
        >
          Confirmed
        </Text>
      </View>
    );
  }

  if (s === "CANCELLED") {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30">
        <XCircle size={11} color="#E11D48" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider"
        >
          Cancelled
        </Text>
      </View>
    );
  }

  if (s === "COMPLETED") {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30">
        <CheckCircle2 size={11} color="#2563EB" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider"
        >
          Completed
        </Text>
      </View>
    );
  }

  return (
    <View className="px-2.5 py-1 rounded-lg bg-muted border border-border">
      <Text
        style={{ fontFamily: "Antic" }}
        className="text-[10px] font-bold text-muted-foreground uppercase"
      >
        {status}
      </Text>
    </View>
  );
}

export function BookingCard({
  booking,
  onPress,
  onQrPress,
  onDirectionsPress,
  onPayPress,
  onCancelPress,
  onReviewPress,
}: BookingCardProps) {
  const { theme, isDark } = useTheme();
  const bStatus = (booking.bookingStatus || "PENDING").toUpperCase();
  const isCancellable =
    bStatus === "PENDING" ||
    bStatus === "VERIFICATION_REQUIRED" ||
    bStatus === "APPROVED" ||
    bStatus === "CONFIRMED";

  const isConfirmed =
    bStatus === "CONFIRMED" || bStatus === "ACTIVE" || bStatus === "APPROVED";

  const isCompleted = bStatus === "COMPLETED";

  return (
    <Pressable
      onPress={() => onPress(booking)}
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      className="p-4 rounded-3xl border shadow-xs mb-3.5 space-y-3"
    >
      {/* Header: ID + Status */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-1.5">
          <Text
            style={{ fontFamily: "JetBrainsMono", color: theme.mutedForeground }}
            className="text-xs font-bold"
          >
            BR-{booking.bookingId}
          </Text>
        </View>

        {renderStatusBadge(bStatus)}
      </View>

      {/* Bike Title */}
      <View>
        <Text
          style={{ fontFamily: "Antic", color: theme.foreground }}
          className="text-base font-bold"
          numberOfLines={1}
        >
          {booking.bikeName || "Rental Bike"}
        </Text>
        {booking.location && (
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-xs mt-0.5"
          >
            Hub: {booking.location}
          </Text>
        )}
      </View>

      {/* Date Timings */}
      <View
        style={{
          backgroundColor: isDark ? "rgba(40, 40, 44, 0.6)" : "rgba(232, 230, 225, 0.35)",
          borderColor: theme.border,
        }}
        className="p-3 rounded-2xl border space-y-1.5"
      >
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color={theme.primary} />
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-xs"
          >
            Pickup: <Text style={{ color: theme.foreground, fontWeight: "700" }}>{formatDateTime(booking.startTime)}</Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Clock size={13} color={theme.primary} />
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-xs"
          >
            Return: <Text style={{ color: theme.foreground, fontWeight: "700" }}>{formatDateTime(booking.returnTime)}</Text>
          </Text>
        </View>
      </View>

      {/* Cancellation Reason if any */}
      {bStatus === "CANCELLED" && booking.cancellationReason && (
        <View className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
          <Text
            style={{ fontFamily: "Antic", color: theme.destructive }}
            className="text-xs font-medium"
          >
            <Text className="font-bold">Cancelled: </Text>
            {booking.cancellationReason}
          </Text>
        </View>
      )}

      {/* Price and Action Buttons */}
      <View
        style={{ borderTopColor: theme.border }}
        className="flex-row items-center justify-between pt-2 border-t"
      >
        <View>
          <Text
            style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
            className="text-lg font-black"
          >
            ₹{booking.totalAmount}
          </Text>
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-[10px]"
          >
            {booking.paymentStatus === "SUCCESS" ? "Paid" : "Total Amount"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {isConfirmed && onQrPress && (
            <Pressable
              onPress={() => onQrPress(booking)}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25 active:bg-primary/20"
            >
              <QrCode size={13} color={theme.primary} />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-primary"
              >
                QR Pass
              </Text>
            </Pressable>
          )}

          {isConfirmed && onDirectionsPress && (
            <Pressable
              onPress={() => onDirectionsPress(booking)}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-primary active:opacity-90 shadow-xs"
            >
              <Navigation size={13} color="#FFFFFF" />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-primary-foreground"
              >
                Track
              </Text>
            </Pressable>
          )}

          {isCompleted && booking.paymentStatus !== "SUCCESS" && onPayPress && (
            <Pressable
              onPress={() => onPayPress(booking)}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-primary active:opacity-90 shadow-xs"
            >
              <CreditCard size={13} color="#FFFFFF" />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-primary-foreground"
              >
                Pay Bill
              </Text>
            </Pressable>
          )}

          {isCompleted && onReviewPress && (
            <Pressable
              onPress={() => onReviewPress(booking)}
              className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 active:bg-amber-500/20"
            >
              <Star size={13} color="#D97706" />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold text-amber-700 dark:text-amber-400"
              >
                Review
              </Text>
            </Pressable>
          )}

          {isCancellable && onCancelPress && (
            <Pressable
              onPress={() => onCancelPress(booking)}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 active:bg-rose-500/20"
            >
              <XCircle size={16} color="#E11D48" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default BookingCard;
