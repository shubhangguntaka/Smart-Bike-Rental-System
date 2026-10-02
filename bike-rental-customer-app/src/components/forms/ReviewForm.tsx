import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Star } from "lucide-react-native";
import { ReviewDTO } from "../../types/review";
import AppButton from "../common/AppButton";

interface ReviewFormProps {
  bookingId: number;
  bikeId: number;
  customerId: number;
  initialRating?: number;
  initialMessage?: string;
  isEditMode?: boolean;
  onSubmit: (dto: ReviewDTO) => Promise<void>;
  onCancel: () => void;
}

export function ReviewForm({
  bookingId,
  bikeId,
  customerId,
  initialRating = 5,
  initialMessage = "",
  isEditMode = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [message, setMessage] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please write a few words about your rental experience.");
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      await onSubmit({
        bookingId,
        bikeId,
        customerId,
        rating,
        reviewMessage: message.trim(),
      });
    } catch (err: any) {
      setError(err?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const starValues = [1, 2, 3, 4, 5];

  return (
    <View className="space-y-4">
      {/* Rating Stars Selector */}
      <View className="items-center py-2 space-y-2">
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
        >
          Select Your Rating
        </Text>
        <View className="flex-row items-center gap-2">
          {starValues.map((val) => (
            <Pressable
              key={val}
              onPress={() => setRating(val)}
              className="p-1 active:scale-125 transition-transform"
            >
              <Star
                size={32}
                color={val <= rating ? "#EAB308" : "#9CA3AF"}
                fill={val <= rating ? "#EAB308" : "none"}
              />
            </Pressable>
          ))}
        </View>
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs font-bold text-primary"
        >
          {rating === 5
            ? "Excellent Experience! 🌟"
            : rating === 4
            ? "Very Good Ride 👍"
            : rating === 3
            ? "Average Experience 😐"
            : rating === 2
            ? "Below Expectations 👎"
            : "Poor Experience 😞"}
        </Text>
      </View>

      {/* Review Feedback Text Input */}
      <View className="space-y-1.5">
        <Text
          style={{ fontFamily: "Antic" }}
          className="text-xs font-bold text-foreground"
        >
          Your Feedback
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Share details about bike condition, host handover, or performance..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ fontFamily: "Antic" }}
          className="p-3.5 rounded-2xl border border-border bg-card text-foreground text-xs min-h-[100px]"
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

      {/* Action Buttons */}
      <View className="flex-row gap-3 pt-2">
        <AppButton
          title="Cancel"
          variant="outline"
          className="flex-1"
          onPress={onCancel}
          disabled={submitting}
        />
        <AppButton
          title={isEditMode ? "Update Review" : "Submit Review"}
          variant="primary"
          className="flex-1"
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>
    </View>
  );
}

export default ReviewForm;
