import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { BookingRequestDTO } from "../../types/owner";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import AppBadge from "../common/AppBadge";
import AppButton from "../common/AppButton";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { Calendar, User, Phone, Check, X } from "lucide-react-native";

export interface BookingRequestCardProps {
  booking: BookingRequestDTO;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onPress,
  onAccept,
  onReject,
  isProcessing = false,
}) => {
  const { theme, isDark } = useTheme();

  const isPending = (booking.bookingStatus || "").toUpperCase() === "PENDING";

  const statusVariant =
    booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "APPROVED"
      ? "success"
      : booking.bookingStatus === "PENDING"
      ? "warning"
      : booking.bookingStatus === "CANCELLED"
      ? "error"
      : "neutral";

  return (
    <AppCard onPress={onPress} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.bikeInfo}>
          <AppText variant="body" weight="700" numberOfLines={1}>
            {booking.bikeName || "Bike"}
          </AppText>
          <AppText variant="caption" color="muted">
            Booking #{booking.bookingId}
          </AppText>
        </View>
        <AppBadge
          label={booking.bookingStatus || "PENDING"}
          variant={statusVariant}
          size="sm"
        />
      </View>

      {/* Customer Info */}
      <View style={styles.customerRow}>
        <User size={15} color={theme.mutedForeground} style={{ marginRight: 6 }} />
        <AppText variant="bodySmall" weight="600" style={styles.customerName}>
          {booking.customerName || "Customer"}
        </AppText>
        {booking.customerPhone && (
          <View style={styles.phoneTag}>
            <Phone size={12} color={theme.mutedForeground} style={{ marginRight: 4 }} />
            <AppText variant="caption" color="muted">
              {booking.customerPhone}
            </AppText>
          </View>
        )}
      </View>

      {/* Schedule */}
      <View
        style={[
          styles.scheduleBox,
          { backgroundColor: isDark ? "#28282C" : "#F8F7F4" },
        ]}
      >
        <View style={styles.scheduleRow}>
          <Calendar size={14} color={theme.primary} style={{ marginRight: 6 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color="muted">
              Pickup
            </AppText>
            <AppText variant="bodySmall" weight="600">
              {formatDateTime(booking.pickupDate)}
            </AppText>
          </View>
        </View>

        <View style={[styles.scheduleRow, { marginTop: 6 }]}>
          <Calendar size={14} color={theme.destructive} style={{ marginRight: 6 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color="muted">
              Return
            </AppText>
            <AppText variant="bodySmall" weight="600">
              {formatDateTime(booking.returnDate)}
            </AppText>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <AppText variant="caption" color="muted">
            Estimated Amount
          </AppText>
          <AppText variant="h3" weight="700" color="primary">
            {formatCurrency(booking.rentalAmount)}
          </AppText>
        </View>

        {isPending && onAccept && onReject && (
          <View style={styles.actionButtons}>
            <AppButton
              title="Reject"
              variant="destructive"
              size="sm"
              onPress={onReject}
              disabled={isProcessing}
              style={[styles.btn, { marginRight: 8 }]}
            />
            <AppButton
              title="Accept"
              variant="primary"
              size="sm"
              onPress={onAccept}
              disabled={isProcessing}
              style={styles.btn}
            />
          </View>
        )}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  bikeInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customerName: {
    marginRight: 10,
  },
  phoneTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  btn: {
    minWidth: 80,
    height: 36,
  },
});

export default BookingRequestCard;
