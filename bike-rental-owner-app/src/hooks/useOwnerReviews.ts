import { useQuery } from "@tanstack/react-query";
import { reviewService } from "../services/reviewService";
import { Review } from "../types/review";

export const OWNER_REVIEWS_QUERY_KEY = ["ownerReviews"];

export function useOwnerReviews(bikeId?: number) {
  const query = useQuery<Review[]>({
    queryKey: bikeId ? [...OWNER_REVIEWS_QUERY_KEY, bikeId] : OWNER_REVIEWS_QUERY_KEY,
    queryFn: () => {
      if (bikeId) return reviewService.getReviewsByBike(bikeId);
      return reviewService.getAllReviews();
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    reviews: query.data || [],
    refetchReviews: query.refetch,
  };
}

export default useOwnerReviews;
