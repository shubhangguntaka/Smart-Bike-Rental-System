import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Zap,
  Flame,
  ArrowRight,
} from "lucide-react-native";
import { Bike } from "../../types/bike";
import BikeAvailabilityBadge, { format12Hour } from "../common/BikeAvailabilityBadge";
import { useTheme } from "../../theme";

interface BikeCardProps {
  bike: Bike;
  onPress: (bike: Bike) => void;
  onBookPress?: (bike: Bike) => void;
  compact?: boolean;
}

export function BikeCard({
  bike,
  onPress,
  onBookPress,
  compact = false,
}: BikeCardProps) {
  const { theme, isDark } = useTheme();
  const isEv =
    (bike.fuelType || "").toUpperCase().includes("ELECTRIC") ||
    (bike.fuelType || "").toUpperCase().includes("EV");

  const hourlyRate = bike.hourlyRate || Math.round((bike.rentalPrice || 400) / 8);
  const dailyRate = bike.rentalPrice || hourlyRate * 8;
  const rating = bike.rating || 4.8;

  const defaultImage =
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
  const imageUri = bike.imageUrl || defaultImage;

  return (
    <Pressable
      onPress={() => onPress(bike)}
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      className="rounded-3xl border overflow-hidden shadow-xs active:scale-[0.99] mb-4 transition-all"
    >
      {/* Top Image Frame */}
      <View className="relative h-44 w-full bg-muted overflow-hidden">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full object-cover"
          resizeMode="cover"
        />

        {/* Location Badge */}
        <View
          style={{
            backgroundColor: isDark ? "rgba(18, 18, 18, 0.92)" : "rgba(255, 255, 255, 0.92)",
            borderColor: theme.border,
          }}
          className="absolute top-3 left-3 flex-row items-center gap-1 px-2.5 py-1 rounded-xl border shadow-xs"
        >
          <MapPin size={12} color={theme.primary} />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-[11px] font-bold text-foreground"
            numberOfLines={1}
          >
            {bike.location || "Hyderabad"}
          </Text>
        </View>

        {/* Availability Badge */}
        <View className="absolute top-3 right-3 shadow-xs">
          <BikeAvailabilityBadge
            status={bike.bikeStatus}
            availableStartTime={bike.availableStartTime}
            availableEndTime={bike.availableEndTime}
            compact
          />
        </View>

        {/* Bottom image tags */}
        <View className="absolute bottom-2.5 left-3 right-3 flex-row justify-between items-center pointer-events-none">
          {bike.rcVerified && (
            <View className="flex-row items-center gap-1 bg-emerald-600/90 px-2 py-0.5 rounded-lg">
              <ShieldCheck size={11} color="#FFFFFF" />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[9px] font-bold text-white uppercase"
              >
                RC Verified
              </Text>
            </View>
          )}

          <View
            style={{
              backgroundColor: isDark ? "rgba(18, 18, 18, 0.92)" : "rgba(255, 255, 255, 0.92)",
              borderColor: theme.border,
            }}
            className="flex-row items-center gap-1 px-2 py-0.5 rounded-lg border ml-auto"
          >
            <Star size={11} color="#EAB308" fill="#EAB308" />
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-[10px] font-bold text-foreground"
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content Area */}
      <View className="p-4 space-y-3">
        {/* Brand and Shift Timing */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-1.5">
            <View
              style={{
                backgroundColor: isDark ? "rgba(124, 144, 130, 0.15)" : "rgba(124, 144, 130, 0.1)",
                borderColor: theme.border,
              }}
              className="px-2 py-0.5 rounded-md border"
            >
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[10px] font-black uppercase text-primary tracking-wider"
              >
                {bike.brand || "Motorcycle"}
              </Text>
            </View>

            <View className="flex-row items-center gap-0.5 px-2 py-0.5 rounded-md bg-muted/60">
              {isEv ? (
                <Zap size={10} color="#059669" />
              ) : (
                <Flame size={10} color="#E11D48" />
              )}
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-[10px] font-bold text-muted-foreground uppercase"
              >
                {isEv ? "EV" : bike.fuelType || "Petrol"}
              </Text>
            </View>
          </View>

          {bike.availableStartTime && (
            <View className="flex-row items-center gap-1">
              <Clock size={11} color={theme.primary} />
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-[10px] font-medium text-muted-foreground"
              >
                {format12Hour(bike.availableStartTime)} - {format12Hour(bike.availableEndTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Bike Title and Specs summary */}
        <View>
          <Text
            style={{ fontFamily: "Antic", color: theme.foreground }}
            className="text-base font-bold"
            numberOfLines={1}
          >
            {bike.bikeName || `${bike.brand} ${bike.model}`}
          </Text>
          <Text
            style={{ fontFamily: "Antic", color: theme.mutedForeground }}
            className="text-xs mt-0.5"
            numberOfLines={1}
          >
            {bike.engineCapacity ? `${bike.engineCapacity} • ` : ""}
            {bike.transmission ? `${bike.transmission} • ` : "Manual • "}
            Reg: {bike.registrationNumber || "Verified"}
          </Text>
        </View>

        {/* Price & Action Row */}
        <View
          style={{ borderTopColor: theme.border }}
          className="flex-row items-center justify-between pt-3 border-t"
        >
          <View>
            <View className="flex-row items-baseline gap-0.5">
              <Text
                style={{ fontFamily: "JetBrainsMono", color: theme.foreground }}
                className="text-xl font-black"
              >
                ₹{hourlyRate}
              </Text>
              <Text
                style={{ fontFamily: "Antic", color: theme.mutedForeground }}
                className="text-xs font-semibold"
              >
                /hr
              </Text>
            </View>
            <Text
              style={{ fontFamily: "Antic", color: theme.mutedForeground }}
              className="text-[10px]"
            >
              Day pass: ₹{dailyRate}
            </Text>
          </View>

          <Pressable
            onPress={() => (onBookPress ? onBookPress(bike) : onPress(bike))}
            style={{ backgroundColor: theme.primary }}
            className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl active:opacity-90 shadow-2xs"
          >
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-white"
            >
              Rent Now
            </Text>
            <ArrowRight size={13} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default BikeCard;
