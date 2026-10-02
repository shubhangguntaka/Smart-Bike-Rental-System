import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Info,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { bookingService } from "../../services/bookingService";
import { useAuthStore } from "../../store/authStore";
import { Bike } from "../../types/bike";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { theme } = useTheme();

  const bike = route.params?.bike as Bike;

  const [startDate, setStartDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours later by default
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [activePickerTarget, setActivePickerTarget] = useState<"start" | "return">("start");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate rental duration in hours
  const durationHours = useMemo(() => {
    const diffMs = returnDate.getTime() - startDate.getTime();
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return hours;
  }, [startDate, returnDate]);

  const hourlyRate = bike?.hourlyRate || Math.round((bike?.rentalPrice || 400) / 8);
  const totalRentalAmount = durationHours * hourlyRate;

  const openPicker = (target: "start" | "return", mode: "date" | "time") => {
    setActivePickerTarget(target);
    setPickerMode(mode);
    if (target === "start") setShowStartPicker(true);
    else setShowReturnPicker(true);
  };

  const onStartDateChange = (_: any, selected: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selected) {
      setStartDate(selected);
      // If return date is earlier, push it 2 hours ahead
      if (selected.getTime() >= returnDate.getTime()) {
        setReturnDate(new Date(selected.getTime() + 2 * 60 * 60 * 1000));
      }
    }
  };

  const onReturnDateChange = (_: any, selected: Date) => {
    setShowReturnPicker(Platform.OS === "ios");
    if (selected) {
      if (selected.getTime() <= startDate.getTime()) {
        setErrorMessage("Return time must be after the pickup time.");
      } else {
        setErrorMessage(null);
        setReturnDate(selected);
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!user?.id) {
      navigation.navigate("AuthNavigator");
      return;
    }

    if (returnDate.getTime() <= startDate.getTime()) {
      setErrorMessage("Return time must be after the pickup time.");
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const customerId = Number(user.id);
      const bikeId = Number(bike.bikeId || bike.id);

      // 1. Check availability on backend
      const startIso = startDate.toISOString();
      const returnIso = returnDate.toISOString();

      const isAvailable = await bookingService.checkAvailability(
        bikeId,
        startIso,
        returnIso
      );

      if (!isAvailable) {
        setErrorMessage(
          "This bike is already booked for the selected time slot. Please choose another time or bike."
        );
        setSubmitting(false);
        return;
      }

      // 2. Submit booking creation to backend
      const newBooking = await bookingService.createBooking(customerId, {
        bikeId,
        startTime: startIso,
        returnTime: returnIso,
      });

      // 3. Navigate to Booking Details / Confirmation
      navigation.replace("BookingDetailsScreen", {
        bookingId: newBooking.bookingId,
        booking: newBooking,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create booking. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="Reserve Bike" showBack />

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bike Summary Card */}
        <View className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs mb-5 flex-row items-center gap-3.5">
          <View className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
            {bike?.imageUrl ? (
              <View className="w-full h-full bg-cover" />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary/10">
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-primary"
                >
                  Bike
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-[10px] font-black uppercase tracking-wider text-primary"
            >
              {bike?.brand}
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-base font-bold text-foreground"
              numberOfLines={1}
            >
              {bike?.bikeName || `${bike?.brand} ${bike?.model}`}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <MapPin size={11} color={theme.primary} />
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground font-medium"
              >
                {bike?.location || "Hyderabad Hub"}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-base font-black text-foreground"
            >
              ₹{hourlyRate}
            </Text>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-[10px] text-muted-foreground font-semibold"
            >
              / hour
            </Text>
          </View>
        </View>

        {/* Error Banner */}
        {errorMessage && (
          <View className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/30 mb-4 flex-row items-start gap-2.5">
            <AlertCircle size={16} color="#E11D48" className="shrink-0 mt-0.5" />
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs text-destructive font-medium flex-1 leading-relaxed"
            >
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Date / Time Selectors */}
        <View className="space-y-4 mb-5">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Rental Schedule
          </Text>

          {/* Pickup Selection */}
          <View className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-foreground"
            >
              Pickup Time (Start Rental)
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => openPicker("start", "date")}
                className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 flex-row items-center gap-2"
              >
                <Calendar size={14} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  {startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => openPicker("start", "time")}
                className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 flex-row items-center gap-2"
              >
                <Clock size={14} color={theme.primary} />
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-xs font-bold text-foreground"
                >
                  {startDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Return Selection */}
          <View className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-foreground"
            >
              Return Time (Drop-off)
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => openPicker("return", "date")}
                className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 flex-row items-center gap-2"
              >
                <Calendar size={14} color={theme.primary} />
                <Text
                  style={{ fontFamily: "Antic" }}
                  className="text-xs font-bold text-foreground"
                >
                  {returnDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => openPicker("return", "time")}
                className="flex-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 flex-row items-center gap-2"
              >
                <Clock size={14} color={theme.primary} />
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-xs font-bold text-foreground"
                >
                  {returnDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Pricing Estimate Card */}
        <View className="p-4 rounded-3xl bg-card border border-border/80 space-y-3 mb-5">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Estimated Fare Summary
          </Text>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Rental Duration
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              {durationHours} {durationHours === 1 ? "Hour" : "Hours"}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Rate per Hour
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-foreground">
              ₹{hourlyRate}
            </Text>
          </View>

          <View className="flex-row justify-between text-xs">
            <Text style={{ fontFamily: "Antic" }} className="text-muted-foreground">
              Security Deposit
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="font-bold text-emerald-600">
              ₹0 (Waived)
            </Text>
          </View>

          <View className="pt-2 border-t border-border/60 flex-row justify-between items-center">
            <Text style={{ fontFamily: "Antic" }} className="text-sm font-bold text-foreground">
              Estimated Total
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono" }} className="text-xl font-black text-foreground">
              ₹{totalRentalAmount}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 pt-1">
            <Info size={12} color="#6B7280" />
            <Text style={{ fontFamily: "Antic" }} className="text-[10px] text-muted-foreground">
              Final billing is calculated upon vehicle return based on exact rental time.
            </Text>
          </View>
        </View>

        {/* Security & Support Note */}
        <View className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center gap-2.5">
          <ShieldCheck size={18} color="#059669" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-emerald-800 dark:text-emerald-300 flex-1 leading-relaxed"
          >
            Digital QR code pass is generated immediately upon reservation for instant host handover.
          </Text>
        </View>

        {/* Date Time Picker Overlays */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode={pickerMode}
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={onStartDateChange}
            onDismiss={() => setShowStartPicker(false)}
            minimumDate={new Date()}
          />
        )}

        {showReturnPicker && (
          <DateTimePicker
            value={returnDate}
            mode={pickerMode}
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={onReturnDateChange}
            onDismiss={() => setShowReturnPicker(false)}
            minimumDate={startDate}
          />
        )}
      </ScrollView>

      {/* Floating Confirm Button */}
      <View className="p-4 bg-card border-t border-border/80">
        <AppButton
          title="Confirm & Generate QR Pass"
          variant="primary"
          size="lg"
          loading={submitting}
          onPress={handleConfirmBooking}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
        />
      </View>
    </AppScreen>
  );
}
