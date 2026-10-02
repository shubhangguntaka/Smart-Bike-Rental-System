import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  Switch,
} from "react-native";
import {
  Search,
  X,
  Compass,
  Filter,
  ArrowUpDown,
  Bike as BikeIcon,
  Flame,
  Zap,
  RotateCcw,
  MapPin,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { bikeService } from "../../services/bikeService";
import { Bike } from "../../types/bike";
import { BikeCard } from "../../components/cards/BikeCard";
import { isBikeAvailableNow } from "../../components/common/BikeAvailabilityBadge";
import { useTheme } from "../../theme";
import Animated from "react-native-reanimated";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import useCollapsibleTabBar from "../../hooks/useCollapsibleTabBar";
import useTabScrollToTop from "../../hooks/useTabScrollToTop";

export default function ExploreBikesScreen() {
  const navigation = useNavigation<any>();
  const { scrollHandler } = useCollapsibleTabBar();
  const flatListRef = useTabScrollToTop<any>();
  const { theme } = useTheme();

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [onlyAvailableNow, setOnlyAvailableNow] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"PRICE_ASC" | "PRICE_DESC" | "RATING" | "NAME">("PRICE_ASC");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const loadBikes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bikeService.getAllBikes();
      setBikes(data);
    } catch (err) {
      console.error("Failed to load bikes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBikes();
  }, [loadBikes]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBikes();
  };

  // Extract unique locations
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    bikes.forEach((b) => {
      if (b.location && b.location.trim()) {
        set.add(b.location.trim());
      }
    });
    return Array.from(set);
  }, [bikes]);

  // Filter and sort bikes
  const filteredBikes = useMemo(() => {
    return bikes
      .filter((bike) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const nameMatch = (bike.bikeName || "").toLowerCase().includes(q);
          const brandMatch = (bike.brand || "").toLowerCase().includes(q);
          const modelMatch = (bike.model || "").toLowerCase().includes(q);
          const locMatch = (bike.location || "").toLowerCase().includes(q);
          if (!nameMatch && !brandMatch && !modelMatch && !locMatch) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== "ALL") {
          const isEv = (bike.fuelType || "").toUpperCase().includes("ELECTRIC");
          if (selectedCategory === "ELECTRIC" && !isEv) return false;
          if (selectedCategory === "PETROL" && isEv) return false;
        }

        // Location
        if (selectedLocation !== "ALL") {
          if (bike.location?.toLowerCase() !== selectedLocation.toLowerCase()) {
            return false;
          }
        }

        // Available Now
        if (onlyAvailableNow) {
          if (bike.bikeStatus !== "AVAILABLE") return false;
          if (
            !isBikeAvailableNow(
              bike.availableStartTime,
              bike.availableEndTime
            )
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const rateA = a.hourlyRate || Math.round((a.rentalPrice || 400) / 8);
        const rateB = b.hourlyRate || Math.round((b.rentalPrice || 400) / 8);

        if (sortBy === "PRICE_ASC") return rateA - rateB;
        if (sortBy === "PRICE_DESC") return rateB - rateA;
        if (sortBy === "RATING") return (b.rating || 4.5) - (a.rating || 4.5);
        if (sortBy === "NAME") return (a.bikeName || "").localeCompare(b.bikeName || "");
        return 0;
      });
  }, [bikes, searchTerm, selectedCategory, selectedLocation, onlyAvailableNow, sortBy]);

  const categories = [
    { id: "ALL", label: "All Rides", icon: BikeIcon },
    { id: "PETROL", label: "Petrol", icon: Flame },
    { id: "ELECTRIC", label: "EV Scooters", icon: Zap },
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedLocation("ALL");
    setOnlyAvailableNow(false);
    setSortBy("PRICE_ASC");
  };

  const renderHeader = () => (
    <View className="px-5 pt-3 pb-2 space-y-3">
      {/* Title & Stats */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text
            style={{ fontFamily: "Antic", color: theme.foreground }}
            className="text-2xl font-black"
          >
            Explore Fleet
          </Text>
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-xs"
          >
            {filteredBikes.length} {filteredBikes.length === 1 ? "ride" : "rides"} available in catalog
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate("MapExploreScreen")}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20"
        >
          <MapPin size={14} color={theme.primary} />
          <Text
            style={{ fontFamily: "Antic", color: theme.primary }}
            className="text-xs font-bold"
          >
            Map View
          </Text>
        </Pressable>
      </View>

      {/* Search Input Bar */}
      <View className="relative">
        <View className="absolute left-3.5 top-3 z-10">
          <Search size={16} color={theme.mutedForeground} />
        </View>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by model, brand, or city..."
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

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={{
                backgroundColor: isSelected ? theme.primary : theme.card,
                borderColor: isSelected ? theme.primary : theme.border,
              }}
              className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-xl border"
            >
              <Icon size={12} color={isSelected ? "#FFFFFF" : theme.mutedForeground} />
              <Text
                style={{
                  fontFamily: "Antic",
                  color: isSelected ? theme.primaryForeground : theme.mutedForeground,
                }}
                className="text-xs font-bold"
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Secondary Controls Bar: Location, Sort, Available Now */}
      <View
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
        className="p-3 rounded-2xl border space-y-2.5"
      >
        <View className="flex-row items-center justify-between">
          <Text
            style={{ fontFamily: "Antic", color: theme.foreground }}
            className="text-xs font-bold"
          >
            Available Now Only
          </Text>
          <Switch
            value={onlyAvailableNow}
            onValueChange={setOnlyAvailableNow}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Sort selector chips */}
        <View className="flex-row items-center gap-1.5 flex-wrap pt-1 border-t border-border/40">
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-[10px] font-bold uppercase mr-1"
          >
            Sort:
          </Text>
          <Pressable
            onPress={() => setSortBy("PRICE_ASC")}
            className={`px-2 py-1 rounded-lg ${
              sortBy === "PRICE_ASC"
                ? "bg-primary/15 border border-primary/30"
                : "bg-muted/50"
            }`}
          >
            <Text
              style={{
                fontFamily: "Antic",
                color: sortBy === "PRICE_ASC" ? theme.primary : theme.mutedForeground,
              }}
              className="text-[10px] font-bold"
            >
              Price: Low → High
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy("PRICE_DESC")}
            className={`px-2 py-1 rounded-lg ${
              sortBy === "PRICE_DESC"
                ? "bg-primary/15 border border-primary/30"
                : "bg-muted/50"
            }`}
          >
            <Text
              style={{
                fontFamily: "Antic",
                color: sortBy === "PRICE_DESC" ? theme.primary : theme.mutedForeground,
              }}
              className="text-[10px] font-bold"
            >
              Price: High → Low
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy("RATING")}
            className={`px-2 py-1 rounded-lg ${
              sortBy === "RATING"
                ? "bg-primary/15 border border-primary/30"
                : "bg-muted/50"
            }`}
          >
            <Text
              style={{
                fontFamily: "Antic",
                color: sortBy === "RATING" ? theme.primary : theme.mutedForeground,
              }}
              className="text-[10px] font-bold"
            >
              Top Rated
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <AppScreen edges={["top"]} scrollable={false}>
      <Animated.FlatList
        ref={flatListRef}
        data={filteredBikes}
        keyExtractor={(item, index) =>
          String(item.bikeId || item.id || item.registrationNumber || index)
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <BikeCard
              bike={item}
              onPress={(b) =>
                navigation.navigate("BikeDetailsScreen", {
                  bikeId: b.bikeId || b.id,
                  bike: b,
                })
              }
              onBookPress={(b) =>
                navigation.navigate("BookingScreen", {
                  bikeId: b.bikeId || b.id,
                  bike: b,
                })
              }
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View className="p-12 items-center justify-center space-y-3">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                <BikeIcon size={32} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-base font-bold text-foreground"
              >
                No Rides Match Your Filters
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground text-center"
              >
                Try changing your search query or reset active filters.
              </Text>
              <AppButton
                title="Reset Filters"
                size="sm"
                variant="outline"
                onPress={resetFilters}
                className="mt-2"
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
    </AppScreen>
  );
}
