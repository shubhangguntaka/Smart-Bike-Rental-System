import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plus, Search, Bike, Filter } from "lucide-react-native";
import { useTheme } from "../../theme";
import { useOwnerBikes } from "../../hooks/useOwnerBikes";
import AppScreen from "../../components/common/AppScreen";
import { useCollapsibleTabBar } from "../../hooks/useCollapsibleTabBar";
import { useTabScrollToTop } from "../../hooks/useTabScrollToTop";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import AppBadge from "../../components/common/AppBadge";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import BikeOwnerCard from "../../components/cards/BikeOwnerCard";
import { BikeDTO } from "../../types/bike";

export const MyBikesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { onScroll } = useCollapsibleTabBar();
  const scrollRef = useTabScrollToTop<any>();

  const { bikes, isLoading, isError, refetchBikes } = useOwnerBikes();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBikes();
    setRefreshing(false);
  };

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      const matchesStatus =
        selectedStatus === "ALL" ||
        (bike.bikeStatus || "AVAILABLE").toUpperCase() === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (bike.bikeName || "").toLowerCase().includes(q) ||
        (bike.brand || "").toLowerCase().includes(q) ||
        (bike.model || "").toLowerCase().includes(q) ||
        (bike.registrationNumber || "").toLowerCase().includes(q) ||
        (bike.location || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bikes, selectedStatus, searchQuery]);

  const STATUS_FILTERS = [
    { label: "All", value: "ALL" },
    { label: "Available", value: "AVAILABLE" },
    { label: "Booked", value: "BOOKED" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Inactive", value: "INACTIVE" },
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
        title="My Bikes"
        subtitle={`${bikes.length} registered vehicles`}
        showBack={false}
        rightAction={
          <AppButton
            title="Add Bike"
            size="sm"
            icon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => navigation.navigate("AddBikeScreen")}
          />
        }
      />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <AppInput
          placeholder="Search by name, model, reg #..."
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

      {/* Bike List */}
      <View style={styles.listSection}>
        {isLoading && bikes.length === 0 ? (
          <AppLoader message="Fetching your fleet..." />
        ) : filteredBikes.length === 0 ? (
          <AppEmptyState
            icon={<Bike size={44} color={theme.primary} />}
            title={
              searchQuery || selectedStatus !== "ALL"
                ? "No matching bikes found"
                : "No bikes added yet"
            }
            description={
              searchQuery || selectedStatus !== "ALL"
                ? "Try adjusting your search query or filter"
                : "You haven't added any bikes yet. Start listing your bikes to earn money."
            }
            actionTitle={
              searchQuery || selectedStatus !== "ALL" ? undefined : "Add First Bike"
            }
            onAction={
              searchQuery || selectedStatus !== "ALL"
                ? undefined
                : () => navigation.navigate("AddBikeScreen")
            }
          />
        ) : (
          filteredBikes.map((bike) => (
            <BikeOwnerCard
              key={bike.bikeId || bike.registrationNumber}
              bike={bike}
              onPress={() =>
                navigation.navigate("BikeDetailsScreen", {
                  bikeId: bike.bikeId!,
                  bike,
                })
              }
              onEdit={() =>
                navigation.navigate("EditBikeScreen", {
                  bikeId: bike.bikeId!,
                  bike,
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
});

export default MyBikesScreen;
