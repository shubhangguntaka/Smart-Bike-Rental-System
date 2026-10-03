import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CalendarClock, Search, QrCode, Filter } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerBookings } from "../../hooks/useOwnerBookings";
import AppScreen from "../../components/common/AppScreen";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import AppModal from "../../components/common/AppModal";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import BookingRequestCard from "../../components/cards/BookingRequestCard";
import { BookingRequestDTO } from "../../types/owner";

export const BookingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const {
    bookings,
    isLoading,
    approveBooking,
    rejectBooking,
    cancelBooking,
    isApproving,
    isRejecting,
    refetchBookings,
  } = useOwnerBookings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBookings();
    setRefreshing(false);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const status = (item.bookingStatus || "").toUpperCase();
      let matchesStatus = true;
      if (selectedStatus === "PENDING") matchesStatus = status === "PENDING";
      else if (selectedStatus === "CONFIRMED")
        matchesStatus = status === "CONFIRMED" || status === "APPROVED" || status === "RENTED";
      else if (selectedStatus === "COMPLETED") matchesStatus = status === "COMPLETED";
      else if (selectedStatus === "CANCELLED") matchesStatus = status === "CANCELLED";

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.customerName || "").toLowerCase().includes(q) ||
        (item.bikeName || "").toLowerCase().includes(q) ||
        (item.customerPhone || "").toLowerCase().includes(q) ||
        String(item.bookingId).includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, selectedStatus, searchQuery]);

  const handleAccept = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      Alert.alert("Approved", "Booking accepted successfully!");
    } catch (err: any) {
      Alert.alert(
        "Action Failed",
        err.response?.data?.message || "Could not approve booking."
      );
    }
  };

  const openRejectModal = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!selectedBookingId) return;
    setRejectLoading(true);
    try {
      if (rejectReason.trim()) {
        await cancelBooking({ bookingId: selectedBookingId, reason: rejectReason.trim() });
      } else {
        await rejectBooking(selectedBookingId);
      }
      setRejectModalVisible(false);
      Alert.alert("Booking Rejected", "The booking was rejected.");
    } catch (err: any) {
      Alert.alert("Failed", err.response?.data?.message || "Could not reject booking.");
    } finally {
      setRejectLoading(false);
    }
  };

  const STATUS_TABS = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed / Active", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

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
        title="Bookings"
        subtitle={`${bookings.length} total customer reservations`}
        showBack={false}
        rightAction={
          <AppButton
            title="Scan QR"
            size="sm"
            icon={<QrCode size={16} color="#FFFFFF" />}
            onPress={() => navigation.navigate("QRScannerScreen")}
          />
        }
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <AppInput
          placeholder="Search by customer, bike, booking ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={18} color={theme.mutedForeground} />}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {STATUS_TABS.map((item) => {
          const isSelected = selectedStatus === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setSelectedStatus(item.value)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected
                    ? theme.primary
                    : isDark
                    ? "#28282C"
                    : "#EDEBE6",
                },
              ]}
            >
              <AppText
                variant="bodySmall"
                weight={isSelected ? "700" : "500"}
                style={{
                  color: isSelected ? "#FFFFFF" : theme.foreground,
                }}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bookings List */}
      <View style={styles.listSection}>
        {isLoading && bookings.length === 0 ? (
          <AppLoader message="Fetching bookings..." />
        ) : filteredBookings.length === 0 ? (
          <AppEmptyState
            icon={<CalendarClock size={44} color={theme.primary} />}
            title={
              searchQuery || selectedStatus !== "ALL"
                ? "No matching bookings found"
                : "No booking requests right now"
            }
            description={
              searchQuery || selectedStatus !== "ALL"
                ? "Try adjusting your search query or filter"
                : "You don't have any booking requests at the moment. As soon as customers reserve your bikes, they will appear here."
            }
          />
        ) : (
          filteredBookings.map((booking) => (
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
              onReject={() => openRejectModal(booking.bookingId)}
              isProcessing={isApproving || isRejecting}
            />
          ))
        )}
      </View>

      {/* Rejection Modal */}
      <AppModal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        title="Reject Booking Request"
      >
        <AppText variant="body" color="muted" style={{ marginBottom: 12 }}>
          Please provide a reason for rejecting this booking request (e.g. vehicle under maintenance, unavailable timeframe).
        </AppText>

        <AppInput
          label="Reason for Rejection"
          placeholder="e.g. Scheduled maintenance"
          value={rejectReason}
          onChangeText={setRejectReason}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: "top" }}
        />

        <View style={styles.modalBtns}>
          <AppButton
            title="Cancel"
            variant="outline"
            onPress={() => setRejectModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AppButton
            title="Confirm Reject"
            variant="destructive"
            onPress={confirmReject}
            loading={rejectLoading}
            style={{ flex: 1 }}
          />
        </View>
      </AppModal>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  modalBtns: {
    flexDirection: "row",
    marginTop: 16,
  },
});

export default BookingRequestsScreen;
