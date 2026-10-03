import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Star, MessageSquare } from "lucide-react-native";
import { OwnerStackParamList } from "../../navigation/types";
import { useOwnerReviews } from "../../hooks/useOwnerReviews";
import { useTheme } from "../../theme";
import AppScreen from "../../components/common/AppScreen";
import AppHeader from "../../components/common/AppHeader";
import AppText from "../../components/common/AppText";
import AppCard from "../../components/common/AppCard";
import AppLoader from "../../components/common/AppLoader";
import AppEmptyState from "../../components/common/AppEmptyState";
import ReviewCard from "../../components/cards/ReviewCard";

type Props = NativeStackScreenProps<OwnerStackParamList, "ReviewsScreen">;

export const ReviewsScreen: React.FC<Props> = ({ route }) => {
  const bikeId = route.params?.bikeId;
  const { theme, isDark } = useTheme();

  const { reviews, isLoading, refetchReviews } = useOwnerReviews(bikeId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchReviews();
    setRefreshing(false);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
      : 5.0;

  return (
    <AppScreen
      refreshing={refreshing}
      onRefresh={handleRefresh}
      withTopInset
      contentContainerStyle={styles.container}
    >
      <AppHeader
        title="Fleet Reviews"
        subtitle={`${reviews.length} customer feedbacks`}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Rating Overview Card */}
        <AppCard
          style={[
            styles.overviewCard,
            {
              backgroundColor: isDark ? "#1E2A22" : "#EAF0EC",
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={styles.scoreSection}>
            <AppText variant="h1" weight="700" color="primary" style={styles.scoreText}>
              {averageRating.toFixed(1)}
            </AppText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  color="#FACC15"
                  fill={s <= Math.round(averageRating) ? "#FACC15" : "none"}
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </AppText>
          </View>
        </AppCard>

        {/* Reviews List */}
        <View style={styles.listSection}>
          {isLoading && reviews.length === 0 ? (
            <AppLoader message="Loading customer reviews..." />
          ) : reviews.length === 0 ? (
            <AppEmptyState
              icon={<MessageSquare size={44} color={theme.primary} />}
              title="No reviews yet"
              description="Customer reviews for your bikes will appear here after rentals are completed."
            />
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.reviewId || review.id}
                review={review}
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreSection: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listSection: {
    marginTop: 16,
  },
});

export default ReviewsScreen;
