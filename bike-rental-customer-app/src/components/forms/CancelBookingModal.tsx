import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { AlertCircle } from "lucide-react-native";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";

interface CancelBookingModalProps {
  visible: boolean;
  bookingId?: number;
  bikeName?: string;
  loading?: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelBookingModal({
  visible,
  bookingId,
  bikeName,
  loading = false,
  onConfirm,
  onClose,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const predefinedReasons = [
    "Change of travel plans",
    "Found an alternative ride",
    "Booked wrong date or time",
    "Host not reachable",
    "Other reasons",
  ];

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Please select or enter a cancellation reason.");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason("");
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Cancel Booking"
      subtitle={bikeName ? `Booking for ${bikeName}` : undefined}
    >
      <View className="space-y-4">
        <View className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex-row items-start gap-2.5">
          <AlertCircle size={18} color="#E11D48" className="shrink-0 mt-0.5" />
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-foreground/90 flex-1 leading-relaxed"
          >
            Are you sure you want to cancel this booking? Once cancelled, the reserved slot will be released back to the fleet.
          </Text>
        </View>

        {/* Quick select pills */}
        <View className="space-y-1.5">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            Select Reason
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {predefinedReasons.map((r) => (
              <AppButton
                key={r}
                title={r}
                size="sm"
                variant={reason === r ? "primary" : "outline"}
                onPress={() => setReason(r)}
                className="py-1.5 px-2.5 rounded-xl"
              />
            ))}
          </View>
        </View>

        {/* Custom text area */}
        <View className="space-y-1.5">
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs font-bold text-foreground"
          >
            Additional Details (Optional)
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Type your cancellation reason here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ fontFamily: "Antic" }}
            className="p-3 rounded-2xl border border-border bg-background text-foreground text-xs min-h-[80px]"
          />
        </View>

        {error && (
          <Text
            style={{ fontFamily: "Antic" }}
            className="text-xs text-destructive font-medium"
          >
            {error}
          </Text>
        )}

        <View className="flex-row gap-3 pt-2">
          <AppButton
            title="Keep Booking"
            variant="outline"
            className="flex-1"
            onPress={onClose}
            disabled={loading}
          />
          <AppButton
            title="Confirm Cancel"
            variant="destructive"
            className="flex-1"
            onPress={handleConfirm}
            loading={loading}
          />
        </View>
      </View>
    </AppModal>
  );
}

export default CancelBookingModal;
