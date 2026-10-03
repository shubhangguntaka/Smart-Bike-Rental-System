import reviewOwnerApi from "../api/reviewOwnerApi";
import { Review } from "../types/review";

export const reviewService = {
  async getAllReviews(): Promise<Review[]> {
    const res = await reviewOwnerApi.getAllReviews();
    return res.data || [];
  },

  async getReviewsByBike(bikeId: number): Promise<Review[]> {
    const res = await reviewOwnerApi.getReviewsByBike(bikeId);
    return res.data || [];
  },

  async getAverageRating(bikeId: number): Promise<number> {
    const res = await reviewOwnerApi.getAverageRating(bikeId);
    return res.data || 0;
  },
};

export default reviewService;
