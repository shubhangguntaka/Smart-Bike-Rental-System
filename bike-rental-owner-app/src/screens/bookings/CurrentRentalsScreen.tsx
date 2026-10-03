import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Navigation, QrCode } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerBookings } from "../../hooks/useOwnerBookings";
import { bookingService } from "../../services/bookingService";
import AppScreen from "../../components/common/AppScreen";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import RentalCard from "../../components/cards/RentalCard";
import { BookingResponse } from "../../types/booking";

export const CurrentRentalsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const { bookings, isLoading, refetchBookings, returnBooking } = useOwnerBookings();
  const [rentals, setRentals] = useState<BookingResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRentals, setLoadingRentals] = useState(true);

  const fetchActiveRentals = async () => {
    try {
      // Map bookings that are in active or confirmed state
      const active = bookings.filter((b) => {
        const s = (b.bookingStatus || "").toUpperCase();
        return s === "CONFIRMED" || s === "APPROVED" || s === "RENTED" || s === "IN_PROGRESS";
      });

      // Convert to BookingResponse shape
      const items: BookingResponse[] = active.map((b) => ({
        bookingId: b.bookingId,
        bikeId: b.bikeId || 1,
        customerId: 1,
        bikeName: b.bikeName || "Rental Bike",
        customerName: b.customerName || "Customer",
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail,
        startTime: b.pickupDate,
        returnTime: b.returnDate,
        bookingStatus: b.bookingStatus as any,
        paymentStatus: "PENDING",
      }));

      setRentals(items);
    } finally {
      setLoadingRentals(false);
    }
  };

  useEffect(() => {
    fetchActiveRentals();
  }, [bookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBookings();
    await fetchActiveRentals();
    setRefreshing(false);
  };

  const handleReturn = (bookingId: number) => {
    Alert.alert(
      "Confirm Return",
      "Are you sure the customer has returned the vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Return",
          onPress: async () => {
            try {
              await returnBooking(bookingId);
              Alert.alert(
                "Returned",
                "Bike returned successfully. Final bill prepared on backend."
              );
              handleRefresh();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to return.");
            }
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
      <AppHeader
        title="Current Rentals"
        subtitle={`${rentals.length} active vehicle trips`}
        rightAction={
          <AppButton
            title="Scan QR"
            size="sm"
            icon={<QrCode size={16} color="#FFFFFF" />}
            onPress={() => navigation.navigate("QRScannerScreen")}
          />
        }
      />

      <View style={styles.listSection}>
        {isLoading && rentals.length === 0 ? (
          <AppLoader message="Fetching active rentals..." />
        ) : rentals.length === 0 ? (
          <AppEmptyState
            icon={<Navigation size={44} color={theme.primary} />}
            title="No active rentals"
            description="None of your bikes are currently on an active rental ride. Approved bookings will appear here once handed over."
          />
        ) : (
          rentals.map((rental) => (
            <RentalCard
              key={rental.bookingId}
              rental={rental}
              onTrack={() =>
                navigation.navigate("TrackBikeScreen", {
                  bookingId: rental.bookingId,
                  rental,
                })
              }
              onDetails={() =>
                navigation.navigate("BookingDetailsScreen", {
                  bookingId: rental.bookingId,
                  booking: rental,
                })
              }
              onReturn={() => handleReturn(rental.bookingId)}
            />
          ))
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
});

export default CurrentRentalsScreen;
