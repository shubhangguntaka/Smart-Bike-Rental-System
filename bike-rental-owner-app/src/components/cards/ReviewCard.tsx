import React from "react";
import { View, StyleSheet } from "react-native";
import { Review } from "../../types/review";
import { useTheme } from "../../theme";
import AppText from "../common/AppText";
import AppCard from "../common/AppCard";
import { formatDate } from "../../utils/formatters";
import { Star, User } from "lucide-react-native";

export interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const { theme } = useTheme();

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userSection}>
          <View style={[styles.avatar, { backgroundColor: theme.muted }]}>
            <User size={16} color={theme.primary} />
          </View>
          <View>
            <AppText variant="bodySmall" weight="700">
              {review.customerName || "Verified Customer"}
            </AppText>
            <AppText variant="caption" color="muted">
              {formatDate(review.createdAt)}
            </AppText>
          </View>
        </View>

        {/* Rating Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              color={star <= review.rating ? "#FACC15" : theme.border}
              fill={star <= review.rating ? "#FACC15" : "none"}
              style={{ marginLeft: 2 }}
            />
          ))}
        </View>
      </View>

      {review.bikeName && (
        <AppText variant="caption" color="primary" weight="600" style={styles.bikeTag}>
          Bike: {review.bikeName}
        </AppText>
      )}

      {review.comment && (
        <AppText variant="bodySmall" style={styles.comment}>
          "{review.comment}"
        </AppText>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bikeTag: {
    marginBottom: 6,
  },
  comment: {
    fontStyle: "italic",
    lineHeight: 18,
  },
});

export default ReviewCard;
