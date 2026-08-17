import api from "@/api/axios";
import type { Review, ReviewDTO } from "../types/review";

const BASE_URL = "/reviews";

const reviewService = {
  // Get all reviews in system
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get(BASE_URL);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get single review by ID
  getReviewById: async (reviewId: number): Promise<Review> => {
    const response = await api.get(`${BASE_URL}/${reviewId}`);
    return response.data?.data ?? response.data;
  },

  // Add new review
  addReview: async (review: ReviewDTO): Promise<Review> => {
    const response = await api.post(BASE_URL, review);
    return response.data?.data ?? response.data;
  },

  // Update existing review
  updateReview: async (reviewId: number, review: Partial<ReviewDTO>): Promise<Review> => {
    const response = await api.put(`${BASE_URL}/${reviewId}`, review);
    return response.data?.data ?? response.data;
  },

  // Delete review by ID
  deleteReview: async (reviewId: number): Promise<string> => {
    const response = await api.delete(`${BASE_URL}/${reviewId}`);
    return response.data?.data ?? response.data;
  },

  // Get all reviews for a specific bike
  getReviewsByBike: async (bikeId: number): Promise<Review[]> => {
    const response = await api.get(`${BASE_URL}/bike/${bikeId}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get all reviews written by a specific customer
  getReviewsByCustomer: async (customerId: number): Promise<Review[]> => {
    const response = await api.get(`${BASE_URL}/customer/${customerId}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get average rating for a specific bike
  getAverageRating: async (bikeId: number): Promise<number> => {
    const response = await api.get(`${BASE_URL}/bike/${bikeId}/average`);
    const data = response.data?.data ?? response.data;
    return typeof data === "number" ? data : Number(data) || 0;
  },
};

export default reviewService;