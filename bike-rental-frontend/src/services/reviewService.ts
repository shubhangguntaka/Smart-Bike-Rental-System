import api from "@/api/axios";
import type { Review, ReviewDTO } from "../types/review";

const BASE_URL = "/api/reviews";

const reviewService = {
  // Get all reviews in system
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>(BASE_URL);
    return response.data;
  },

  // Get single review by ID
  getReviewById: async (reviewId: number): Promise<Review> => {
    const response = await api.get<Review>(`${BASE_URL}/${reviewId}`);
    return response.data;
  },

  // Add new review
  addReview: async (review: ReviewDTO): Promise<Review> => {
    const response = await api.post<Review>(BASE_URL, review);
    return response.data;
  },

  // Update existing review
  updateReview: async (reviewId: number, review: Partial<ReviewDTO>): Promise<Review> => {
    const response = await api.put<Review>(`${BASE_URL}/${reviewId}`, review);
    return response.data;
  },

  // Delete review by ID
  deleteReview: async (reviewId: number): Promise<string> => {
    const response = await api.delete<string>(`${BASE_URL}/${reviewId}`);
    return response.data;
  },

  // Get all reviews for a specific bike
  getReviewsByBike: async (bikeId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`${BASE_URL}/bike/${bikeId}`);
    return response.data;
  },

  // Get all reviews written by a specific customer
  getReviewsByCustomer: async (customerId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`${BASE_URL}/customer/${customerId}`);
    return response.data;
  },

  // Get average rating for a specific bike
  getAverageRating: async (bikeId: number): Promise<number> => {
    const response = await api.get<number>(`${BASE_URL}/bike/${bikeId}/average`);
    return response.data;
  },
};

export default reviewService;