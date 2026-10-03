import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, Wallet } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerEarnings } from "../../hooks/useOwnerEarnings";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import PaymentCard from "../../components/cards/PaymentCard";

export const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();

  const { payments, isLoadingPayments, refetchAll } = useOwnerEarnings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const status = (item.paymentStatus || "").toUpperCase();
      let matchesStatus = true;
      if (selectedStatus === "SUCCESS") matchesStatus = status === "SUCCESS";
      else if (selectedStatus === "PENDING")
        matchesStatus = status === "PENDING" || status === "PROCESSING" || status === "READY_FOR_PAYMENT";
      else if (selectedStatus === "FAILED") matchesStatus = status === "FAILED";

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.customerName || "").toLowerCase().includes(q) ||
        (item.bikeName || "").toLowerCase().includes(q) ||
        (item.invoiceNumber || "").toLowerCase().includes(q) ||
        String(item.bookingId).includes(q) ||
        String(item.paymentId).includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [payments, selectedStatus, searchQuery]);

  const STATUS_FILTERS = [
    { label: "All", value: "ALL" },
    { label: "Success", value: "SUCCESS" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <AppScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <AppHeader
        title="Transaction History"
        subtitle={`${payments.length} total payout transactions`}
      />

      {/* Search Input */}
      <View style={styles.searchSection}>
        <AppInput
          placeholder="Search by invoice, booking ID, customer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={18} color={theme.mutedForeground} />}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {STATUS_FILTERS.map((item) => {
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

      {/* List */}
      <View style={styles.listSection}>
        {isLoadingPayments && payments.length === 0 ? (
          <AppLoader message="Fetching transaction records..." />
        ) : filteredPayments.length === 0 ? (
          <AppEmptyState
            icon={<Wallet size={44} color={theme.primary} />}
            title="No transactions found"
            description="No transactions match your selected search or filter criteria."
          />
        ) : (
          filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.paymentId}
              payment={payment}
              onPress={() =>
                navigation.navigate("PaymentDetailsScreen", {
                  paymentId: payment.paymentId,
                  payment,
                })
              }
            />
          ))
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
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
});

export default TransactionHistoryScreen;
