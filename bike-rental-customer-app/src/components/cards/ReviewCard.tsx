import React from "react";
import { View, Text } from "react-native";
import { Star, User } from "lucide-react-native";
import { Review } from "../../types/review";
import { useTheme } from "../../theme";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { theme, isDark } = useTheme();
  const stars = [1, 2, 3, 4, 5];
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Verified Rider";

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
      className="p-4 rounded-2xl border mb-3 space-y-2.5"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
            <User size={14} color={theme.primary} />
          </View>
          <View>
            <Text
              style={{ fontFamily: "Antic" }}
              className="text-xs font-bold text-foreground"
            >
              {review.customerName || `Rider #${review.customerId}`}
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-[10px] text-muted-foreground"
            >
              {dateStr}
            </Text>
          </View>
        </View>

        {/* Rating Stars */}
        <View className="flex-row items-center gap-0.5">
          {stars.map((s) => (
            <Star
              key={s}
              size={12}
              color={s <= review.rating ? "#EAB308" : (isDark ? "#3F3F46" : "#D1D5DB")}
              fill={s <= review.rating ? "#EAB308" : "none"}
            />
          ))}
        </View>
      </View>

      <Text
        style={{ fontFamily: "Antic" }}
        className="text-xs text-foreground/90 leading-relaxed font-normal"
      >
        {review.reviewMessage}
      </Text>
    </View>
  );
}

export default ReviewCard;
