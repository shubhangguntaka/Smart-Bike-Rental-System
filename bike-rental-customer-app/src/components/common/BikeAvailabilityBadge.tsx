import React from "react";
import { View, Text } from "react-native";
import { Clock, CheckCircle2, AlertCircle, Wrench } from "lucide-react-native";
import { BikeStatus } from "../../types/bike";

interface BikeAvailabilityBadgeProps {
  status?: BikeStatus | string;
  availableStartTime?: string;
  availableEndTime?: string;
  compact?: boolean;
}

export function format12Hour(timeStr?: string): string {
  if (!timeStr) return "";
  try {
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export function isBikeAvailableNow(
  startTime?: string,
  endTime?: string
): boolean {
  if (!startTime || !endTime) return true;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startTotal = startH * 60 + (startM || 0);
    const endTotal = endH * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    } else {
      // Overnight shift
      return currentMinutes >= startTotal || currentMinutes <= endTotal;
    }
  } catch {
    return true;
  }
}

export function BikeAvailabilityBadge({
  status = "AVAILABLE",
  availableStartTime,
  availableEndTime,
  compact = false,
}: BikeAvailabilityBadgeProps) {
  const normStatus = (status || "AVAILABLE").toUpperCase();
  const availableNow =
    normStatus === "AVAILABLE" &&
    isBikeAvailableNow(availableStartTime, availableEndTime);

  if (normStatus === "BOOKED") {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <Clock size={compact ? 11 : 13} color="#D97706" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider"
        >
          Booked Slot
        </Text>
      </View>
    );
  }

  if (
    normStatus === "UNDER_MAINTENANCE" ||
    normStatus === "MAINTENANCE" ||
    normStatus === "NOT_AVAILABLE"
  ) {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30">
        <Wrench size={compact ? 11 : 13} color="#E11D48" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider"
        >
          Maintenance
        </Text>
      </View>
    );
  }

  if (!availableNow) {
    return (
      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-xl bg-muted/70 border border-border">
        <Clock size={compact ? 11 : 13} color="#6B7280" />
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
        >
          Off-Shift
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
      <CheckCircle2 size={compact ? 11 : 13} color="#059669" />
      <Text
        style={{ fontFamily: "Antic" }}
        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider"
      >
        Available Now
      </Text>
    </View>
  );
}

export default BikeAvailabilityBadge;
