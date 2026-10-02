import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import {
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Bike as BikeIcon,
  CheckCircle2,
  Info,
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Booking } from "../../types/booking";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { formatDateTime } from "../../components/cards/BookingCard";
import { useTheme } from "../../theme";

export default function BookingQRCodeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();

  const booking = route.params?.booking as Booking;
  const bookingId = route.params?.bookingId || booking?.bookingId;

  // Generate deterministic pass code
  const passCode = `BR-${bookingId}-${String(booking?.bikeId || 101).padStart(3, "0")}`;

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="Digital QR Pass" showBack />

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pass Card */}
        <View className="bg-card rounded-3xl border border-border/80 shadow-lg p-6 items-center space-y-4">
          <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
            <ShieldCheck size={14} color={theme.primary} />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-primary uppercase tracking-wider"
            >
              Verified Keyless Pass
            </Text>
          </View>

          {/* Simulated High-Res QR Visual */}
          <View className="p-6 rounded-3xl bg-white border-2 border-border/80 items-center justify-center shadow-inner">
            <QrCode size={180} color="#1A1F2E" />
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-xs font-black text-gray-800 tracking-widest mt-3"
            >
              {passCode}
            </Text>
          </View>

          <View className="items-center space-y-1">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-lg font-black text-foreground text-center"
            >
              {booking?.bikeName || "Rental Vehicle"}
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-muted-foreground text-center"
            >
              Show this QR code to the host at pickup to unlock and inspect the vehicle.
            </Text>
          </View>

          {/* Details */}
          <View className="w-full pt-4 border-t border-border/70 space-y-2.5">
            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
                Booking Reference
              </Text>
              <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
                BR-{bookingId}
              </Text>
            </View>

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
                Pickup Schedule
              </Text>
              <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
                {formatDateTime(booking?.startTime)}
              </Text>
            </View>

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
                Return Schedule
              </Text>
              <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
                {formatDateTime(booking?.returnTime)}
              </Text>
            </View>

            <View className="flex-row justify-between text-xs">
              <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
                Location
              </Text>
              <Text style={{ fontFamily: "Antic" }} className="font-bold text-foreground">
                {booking?.location || "Hyderabad Hub"}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/60 flex-row items-start gap-2.5">
          <Info size={16} color={theme.primary} className="shrink-0 mt-0.5" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-muted-foreground leading-relaxed flex-1"
          >
            Please inspect the vehicle for existing scratches or fuel level before the host scans this QR code for key handover.
          </Text>
        </View>

        <AppButton
          title="Back to Bookings"
          variant="outline"
          size="lg"
          onPress={() => navigation.goBack()}
          className="mt-6"
        />
      </ScrollView>
    </AppScreen>
  );
}
