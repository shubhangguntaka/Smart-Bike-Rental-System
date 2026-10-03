import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Bike,
  QrCode,
  Navigation,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import { OwnerStackParamList } from "../../navigation/types";
import { bookingService } from "../../services/bookingService";
import { ownerService } from "../../services/ownerService";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppBadge from "../../components/common/AppBadge";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { BookingResponse } from "../../types/booking";

type Props = NativeStackScreenProps<OwnerStackParamList, "BookingDetailsScreen">;

export const BookingDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, booking: initialBooking } = route.params;
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const [booking, setBooking] = useState<BookingResponse | null>(
    (initialBooking as BookingResponse) || null
  );
  const [loading, setLoading] = useState(!initialBooking);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const fetched = await bookingService.getBookingById(bookingId);
        if (fetched) setBooking(fetched);
      } catch (err) {
        console.warn("Could not fetch booking details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await ownerService.approveBooking(bookingId);
      const updated = await bookingService.getBookingById(bookingId);
      setBooking(updated);
      Alert.alert("Approved", "Booking approved successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHandover = async () => {
    setActionLoading(true);
    try {
      const updated = await bookingService.handoverBooking(bookingId);
      setBooking(updated);
      Alert.alert("Bike Handed Over", "Ride started successfully! Customer is now riding.");
    } catch (err: any) {
      Alert.alert("Handover Failed", err.response?.data?.message || "Failed to handover.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    Alert.alert(
      "Confirm Bike Return",
      "Confirm that customer has returned the vehicle? This will calculate the final rental duration and billing.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Return",
          onPress: async () => {
            setActionLoading(true);
            try {
              const updated = await bookingService.returnBooking(bookingId);
              setBooking(updated);
              Alert.alert(
                "Rental Completed",
                "Bike returned successfully. The backend has calculated final billing and customer can now complete payment."
              );
            } catch (err: any) {
              Alert.alert("Return Failed", err.response?.data?.message || "Failed to return.");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !booking) {
    return <AppLoader fullScreen message="Loading reservation details..." />;
  }

  const status = (booking.bookingStatus || "").toUpperCase();
  const isPending = status === "PENDING";
  const isConfirmed = status === "CONFIRMED" || status === "APPROVED";
  const isRented = status === "RENTED" || status === "IN_PROGRESS";
  const isCompleted = status === "COMPLETED";

  const statusVariant =
    isCompleted || isConfirmed || isRented
      ? "success"
      : isPending
      ? "warning"
      : "neutral";

  return (
    <AppScreen withTopInset scrollable={false} style={styles.container}>
      <AppHeader
        title={`Booking #${booking.bookingId}`}
        subtitle={booking.bookingReference || "Reservation Details"}
      />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <AppCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <AppText variant="caption" color="muted">
                CURRENT STATUS
              </AppText>
              <AppText variant="h3" weight="700" style={{ marginTop: 2 }}>
                {booking.bookingStatus || "PENDING"}
              </AppText>
            </View>
            <AppBadge label={booking.bookingStatus || "PENDING"} variant={statusVariant} />
          </View>

          {/* Payment Status row */}
          <View style={[styles.paymentStatusRow, { borderTopColor: theme.border }]}>
            <CreditCard size={16} color={theme.primary} style={{ marginRight: 6 }} />
            <AppText variant="bodySmall" color="muted">
              Payment Status:{" "}
              <AppText variant="bodySmall" weight="700" color="foreground">
                {booking.paymentStatus || "PENDING"}
              </AppText>
            </AppText>
          </View>
        </AppCard>

        {/* Customer Information */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Customer Information
          </AppText>
          <AppCard style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <User size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="700">
                  {booking.customerName || "Customer"}
                </AppText>
                <AppText variant="caption" color="muted">
                  ID: #{booking.customerId}
                </AppText>
              </View>
            </View>

            {booking.customerPhone && (
              <View style={styles.infoRow}>
                <Phone size={15} color={theme.mutedForeground} style={{ marginRight: 8 }} />
                <AppText variant="bodySmall">{booking.customerPhone}</AppText>
              </View>
            )}

            {booking.customerEmail && (
              <View style={styles.infoRow}>
                <Mail size={15} color={theme.mutedForeground} style={{ marginRight: 8 }} />
                <AppText variant="bodySmall">{booking.customerEmail}</AppText>
              </View>
            )}
          </AppCard>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Reserved Bike
          </AppText>
          <AppCard style={styles.bikeCard}>
            <View style={styles.bikeRow}>
              <View
                style={[
                  styles.bikeThumb,
                  { backgroundColor: isDark ? "#28282C" : "#EDEBE6" },
                ]}
              >
                {booking.bikeImage ? (
                  <Image
                    source={{ uri: booking.bikeImage }}
                    style={styles.bikeImg}
                    resizeMode="cover"
                  />
                ) : (
                  <Bike size={32} color={theme.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="700">
                  {booking.bikeName || "Bike"}
                </AppText>
                <AppText variant="caption" color="muted">
                  Reg: {booking.registrationNumber || "Pending"}
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Schedule & Duration */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Rental Timeline
          </AppText>
          <AppCard style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <Calendar size={18} color={theme.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color="muted">
                  Scheduled Pickup
                </AppText>
                <AppText variant="bodySmall" weight="700">
                  {formatDateTime(booking.startTime)}
                </AppText>
              </View>
            </View>

            <View style={[styles.timelineRow, { marginTop: 12 }]}>
              <Calendar size={18} color={theme.destructive} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color="muted">
                  Scheduled Return
                </AppText>
                <AppText variant="bodySmall" weight="700">
                  {formatDateTime(booking.returnTime)}
                </AppText>
              </View>
            </View>

            {booking.actualPickupTime && (
              <View style={[styles.timelineRow, { marginTop: 12 }]}>
                <Clock size={18} color="#10B981" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color="muted">
                    Actual Ride Start
                  </AppText>
                  <AppText variant="bodySmall" weight="700">
                    {formatDateTime(booking.actualPickupTime)}
                  </AppText>
                </View>
              </View>
            )}

            {booking.actualReturnTime && (
              <View style={[styles.timelineRow, { marginTop: 12 }]}>
                <Clock size={18} color="#6B7280" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color="muted">
                    Actual Ride Return
                  </AppText>
                  <AppText variant="bodySmall" weight="700">
                    {formatDateTime(booking.actualReturnTime)}
                  </AppText>
                </View>
              </View>
            )}
          </AppCard>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.section}>
          <AppText variant="h3" weight="700" style={styles.sectionTitle}>
            Estimated Billing
          </AppText>
          <AppCard style={styles.billingCard}>
            <View style={styles.billingRow}>
              <AppText variant="bodySmall" color="muted">
                Base Rental
              </AppText>
              <AppText variant="body" weight="700">
                {formatCurrency(booking.rentalAmount || booking.totalAmount || 0)}
              </AppText>
            </View>
            <View style={[styles.billingRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <AppText variant="body" weight="700">
                Total Amount
              </AppText>
              <AppText variant="h3" weight="700" color="primary">
                {formatCurrency(booking.totalAmount || booking.rentalAmount || 0)}
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* Action Controls depending on state */}
        <View style={styles.actionControls}>
          {isPending && (
            <AppButton
              title="Approve Booking"
              size="lg"
              onPress={handleApprove}
              loading={actionLoading}
              style={styles.actionBtn}
            />
          )}

          {isConfirmed && (
            <View style={styles.btnRow}>
              <AppButton
                title="Scan Customer QR"
                variant="outline"
                size="lg"
                icon={<QrCode size={18} color={theme.primary} />}
                onPress={() => navigation.navigate("QRScannerScreen")}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Handover Bike"
                size="lg"
                onPress={handleHandover}
                loading={actionLoading}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {isRented && (
            <View style={styles.btnRow}>
              <AppButton
                title="Track Ride"
                variant="outline"
                size="lg"
                icon={<Navigation size={18} color={theme.primary} />}
                onPress={() =>
                  navigation.navigate("TrackBikeScreen", {
                    bookingId: booking.bookingId,
                    rental: booking,
                  })
                }
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton
                title="Confirm Return"
                size="lg"
                onPress={handleReturn}
                loading={actionLoading}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>
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
  statusCard: {
    padding: 16,
    marginTop: 12,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  paymentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  customerCard: {
    padding: 14,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  bikeCard: {
    padding: 12,
  },
  bikeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bikeThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bikeImg: {
    width: "100%",
    height: "100%",
  },
  timelineCard: {
    padding: 14,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  billingCard: {
    padding: 14,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionControls: {
    marginTop: 24,
    marginBottom: 40,
  },
  actionBtn: {
    width: "100%",
  },
  btnRow: {
    flexDirection: "row",
  },
});

export default BookingDetailsScreen;
