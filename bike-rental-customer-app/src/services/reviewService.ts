import reviewApi from "../api/reviewApi";
import { Review, ReviewDTO } from "../types/review";

export const reviewService = {
  getAllReviews: async (): Promise<Review[]> => {
    return reviewApi.getAllReviews();
  },

  getReviewById: async (reviewId: number): Promise<Review> => {
    return reviewApi.getReviewById(reviewId);
  },

  addReview: async (review: ReviewDTO): Promise<Review> => {
    return reviewApi.addReview(review);
  },

  updateReview: async (reviewId: number, review: Partial<ReviewDTO>): Promise<Review> => {
    return reviewApi.updateReview(reviewId, review);
  },

  deleteReview: async (reviewId: number): Promise<string> => {
    return reviewApi.deleteReview(reviewId);
  },

  getReviewsByBike: async (bikeId: number): Promise<Review[]> => {
    return reviewApi.getReviewsByBike(bikeId);
  },

  getReviewsByCustomer: async (customerId: number): Promise<Review[]> => {
    return reviewApi.getReviewsByCustomer(customerId);
  },

  getAverageRating: async (bikeId: number): Promise<number> => {
    return reviewApi.getAverageRating(bikeId);
  },
};

export default reviewService;
