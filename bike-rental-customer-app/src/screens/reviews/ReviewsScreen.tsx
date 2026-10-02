import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { Star, MessageSquare } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { reviewService } from "../../services/reviewService";
import { Review } from "../../types/review";
import ReviewCard from "../../components/cards/ReviewCard";
import AppHeader from "../../components/common/AppHeader";
import AppScreen from "../../components/common/AppScreen";
import { useTheme } from "../../theme";

export default function ReviewsScreen() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await reviewService.getReviewsByCustomer(Number(user.id));
      setReviews(data);
    } catch (err) {
      console.error("Failed to load customer reviews:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  return (
    <AppScreen edges={["top", "bottom"]} scrollable={false}>
      <AppHeader title="My Ride Reviews" showBack />

      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.reviewId)}
        renderItem={({ item }) => (
          <View className="px-5">
            <ReviewCard review={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="p-16 items-center justify-center space-y-3">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                <Star size={32} color={theme.primary} />
              </View>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-base font-bold text-foreground"
              >
                No Reviews Submitted
              </Text>
              <Text
                style={{ fontFamily: "Antic" }}
                className="text-xs text-muted-foreground text-center"
              >
                You can write reviews for bikes from your completed bookings history.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}
