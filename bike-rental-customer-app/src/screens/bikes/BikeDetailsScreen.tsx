import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Gauge,
  Fuel,
  User,
  Zap,
  Calendar,
  ChevronRight,
  Info,
  ShieldAlert,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { bikeService } from "../../services/bikeService";
import { reviewService } from "../../services/reviewService";
import { bookingService } from "../../services/bookingService";
import { useAuthStore } from "../../store/authStore";
import { Bike } from "../../types/bike";
import { Review } from "../../types/review";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import BikeAvailabilityBadge, {
  format12Hour,
  isBikeAvailableNow,
} from "../../components/common/BikeAvailabilityBadge";
import ReviewCard from "../../components/cards/ReviewCard";
import { useTheme } from "../../theme";

export default function BikeDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { theme, isDark } = useTheme();

  const bikeId = route.params?.bikeId;
  const initialBike = route.params?.bike as Bike | undefined;

  const [bike, setBike] = useState<Bike | null>(initialBike || null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(4.8);
  const [loading, setLoading] = useState(!initialBike);

  useEffect(() => {
    async function loadDetails() {
      if (!bikeId) return;
      try {
        const [bikeData, reviewsData, avg] = await Promise.all([
          bikeService.getBikeById(Number(bikeId)),
          reviewService.getReviewsByBike(Number(bikeId)),
          reviewService.getAverageRating(Number(bikeId)),
        ]);

        if (bikeData) {
          setBike(bikeData);
        }
        setReviews(reviewsData);
        if (avg > 0) setAvgRating(avg);
      } catch (err) {
        console.error("Failed to load bike details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [bikeId]);

  if (loading || !bike) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs text-muted-foreground mt-3 font-medium"
        >
          Loading bike specifications...
        </Text>
      </View>
    );
  }

  const hourlyRate = bike.hourlyRate || Math.round((bike.rentalPrice || 400) / 8);
  const dailyRate = bike.rentalPrice || hourlyRate * 8;
  const isEv = (bike.fuelType || "").toUpperCase().includes("ELECTRIC");
  const availableNow =
    bike.bikeStatus === "AVAILABLE" &&
    isBikeAvailableNow(bike.availableStartTime, bike.availableEndTime);

  const defaultImage =
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
  const imageUri = bike.imageUrl || defaultImage;

  const handleBookNow = async () => {
    if (!user) {
      navigation.navigate("AuthNavigator");
      return;
    }

    // Check verification status before booking
    const customerId = Number(user.id);
    const isVerified = await bookingService.checkVerificationStatus(customerId);

    if (!isVerified) {
      navigation.navigate("VerificationScreen");
      return;
    }

    navigation.navigate("BookingScreen", {
      bikeId: bike.bikeId || bike.id,
      bike,
    });
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader
        title={bike.bikeName || `${bike.brand} ${bike.model}`}
        showBack
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Hero Photo Frame */}
        <View className="relative h-64 w-full bg-muted overflow-hidden">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full object-cover"
            resizeMode="cover"
          />

          <View className="absolute top-3 right-3">
            <BikeAvailabilityBadge
              status={bike.bikeStatus}
              availableStartTime={bike.availableStartTime}
              availableEndTime={bike.availableEndTime}
            />
          </View>

          {bike.rcVerified && (
            <View className="absolute bottom-3 left-3 flex-row items-center gap-1 bg-emerald-600/90 px-3 py-1 rounded-xl shadow-xs backdrop-blur-md">
              <ShieldCheck size={14} color="#FFFFFF" />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[10px] font-bold text-white uppercase tracking-wider"
              >
                RC Verified by Transport Dept
              </Text>
            </View>
          )}
        </View>

        {/* Overview Section */}
        <View className="px-5 py-4 space-y-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <Text
                style={{ fontFamily: "Antic", color: theme.primary }}
                className="text-xs font-black uppercase tracking-wider"
              >
                {bike.brand}
              </Text>
              <Text
                style={{ fontFamily: "Antic", color: theme.foreground }}
                className="text-2xl font-black mt-0.5"
              >
                {bike.bikeName || `${bike.brand} ${bike.model}`}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={12} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                  className="text-xs font-semibold"
                >
                  {bike.location || "Hyderabad Hub"}
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
              className="items-end p-2.5 rounded-2xl border"
            >
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#EAB308" fill="#EAB308" />
                <Text
                  style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
                  className="text-sm font-black"
                >
                  {avgRating.toFixed(1)}
                </Text>
              </View>
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-[10px]"
              >
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>

          {/* Shift & Operational Timings */}
          {bike.availableStartTime && (
            <View
              style={{
                backgroundColor: isDark ? "rgba(40, 40, 44, 0.5)" : "rgba(237, 235, 230, 0.4)",
                borderColor: theme.border,
              }}
              className="p-3.5 rounded-2xl border flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <Clock size={16} color={theme.primary} />
                <View>
                  <Text
                    style={{ fontFamily: "Antic", color: theme.foreground }}
                    className="text-xs font-bold"
                  >
                    Shift Operating Hours
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono", color: theme.mutedForeground }}
                    className="text-[11px]"
                  >
                    {format12Hour(bike.availableStartTime)} – {format12Hour(bike.availableEndTime)}
                  </Text>
                </View>
              </View>

              <View
                className={`px-2 py-0.5 rounded-md ${
                  availableNow ? "bg-emerald-500/10" : "bg-muted"
                }`}
              >
                <Text
                  style={{
                    fontFamily: "Antic",
                    color: availableNow
                      ? isDark ? "#4ADE80" : "#059669"
                      : theme.mutedForeground,
                  }}
                  className="text-[10px] font-bold"
                >
                  {availableNow ? "In Shift" : "Closed"}
                </Text>
              </View>
            </View>
          )}

          {/* Technical Specifications Grid */}
          <View className="space-y-2">
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Vehicle Specifications
            </Text>
            <View className="grid grid-cols-3 gap-2 flex-row flex-wrap">
              <View
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                className="flex-1 min-w-[30%] p-3 rounded-2xl border items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                  className="text-[10px] uppercase font-bold"
                >
                  Engine
                </Text>
                <Text
                  style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
                  className="text-xs font-black mt-1"
                >
                  {bike.engineCapacity || "150 cc"}
                </Text>
              </View>

              <View
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                className="flex-1 min-w-[30%] p-3 rounded-2xl border items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                  className="text-[10px] uppercase font-bold"
                >
                  Mileage
                </Text>
                <Text
                  style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
                  className="text-xs font-black mt-1"
                >
                  {bike.mileage || "45 kmpl"}
                </Text>
              </View>

              <View
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                className="flex-1 min-w-[30%] p-3 rounded-2xl border items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                  className="text-[10px] uppercase font-bold"
                >
                  Fuel
                </Text>
                <Text
                  style={{ fontFamily: "Antic", color: theme.foreground }}
                  className="text-xs font-black mt-1"
                >
                  {isEv ? "Electric" : bike.fuelType || "Petrol"}
                </Text>
              </View>

              <View className="flex-1 min-w-[30%] p-3 rounded-2xl bg-card border border-border/70 items-center justify-center">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Gearbox
                </Text>
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-black text-foreground mt-1"
                >
                  {bike.transmission || "Manual"}
                </Text>
              </View>

              <View className="flex-1 min-w-[30%] p-3 rounded-2xl bg-card border border-border/70 items-center justify-center">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Seating
                </Text>
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-xs font-black text-foreground mt-1"
                >
                  {bike.seatingCapacity || 2} Persons
                </Text>
              </View>

              <View className="flex-1 min-w-[30%] p-3 rounded-2xl bg-card border border-border/70 items-center justify-center">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-[10px] text-muted-foreground uppercase font-bold"
                >
                  Deposit
                </Text>
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-xs font-black text-emerald-600 mt-1"
                >
                  ₹0 Free
                </Text>
              </View>
            </View>
          </View>

          {/* Host Card */}
          {bike.ownerName && (
            <View className="p-4 rounded-2xl bg-card border border-border/70 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                  <User size={18} color={theme.primary} />
                </View>
                <View>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-xs text-muted-foreground font-semibold"
                  >
                    Verified Bike Host
                  </Text>
                  <Text
                    style={{ fontFamily: "Antic" }}
                    className="text-sm font-bold text-foreground"
                  >
                    {bike.ownerName}
                  </Text>
                </View>
              </View>
              <ShieldCheck size={20} color="#059669" />
            </View>
          )}

          {/* Description */}
          {bike.description && (
            <View className="space-y-1.5">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                About This Vehicle
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-foreground/90 leading-relaxed font-normal"
              >
                {bike.description}
              </Text>
            </View>
          )}

          {/* Customer Reviews Section */}
          <View className="space-y-2 pt-2">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Rider Reviews ({reviews.length})
              </Text>
            </View>

            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((rev) => (
                <ReviewCard key={rev.reviewId} review={rev} />
              ))
            ) : (
              <View className="p-6 rounded-2xl border border-dashed border-border items-center justify-center">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs text-muted-foreground font-medium"
                >
                  No reviews yet for this bike. Be the first to ride and review!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar: Price & Book CTA */}
      <View className="p-4 bg-card border-t border-border/80 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-2xl font-black text-foreground"
            >
              ₹{hourlyRate}
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-muted-foreground font-bold"
            >
              / hour
            </Text>
          </View>
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-[10px] text-muted-foreground"
          >
            Day Pass: ₹{dailyRate}
          </Text>
        </View>

        <AppButton
          title={bike.bikeStatus === "BOOKED" ? "Slot Booked" : "Book This Ride"}
          variant={bike.bikeStatus === "BOOKED" ? "secondary" : "primary"}
          size="lg"
          disabled={bike.bikeStatus === "BOOKED"}
          onPress={handleBookNow}
          className="px-6"
        />
      </View>
    </AppScreen>
  );
}
