import api from "./axios";
import { Review, ReviewDTO } from "../types/review";

const BASE_URL = "/reviews";

export const reviewApi = {
  getAllReviews: async (): Promise<Review[]> => {
    const res = await api.get(BASE_URL);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  getReviewById: async (reviewId: number): Promise<Review> => {
    const res = await api.get(`${BASE_URL}/${reviewId}`);
    return res.data?.data ?? res.data;
  },

  addReview: async (review: ReviewDTO): Promise<Review> => {
    const res = await api.post(BASE_URL, review);
    return res.data?.data ?? res.data;
  },

  updateReview: async (reviewId: number, review: Partial<ReviewDTO>): Promise<Review> => {
    const res = await api.put(`${BASE_URL}/${reviewId}`, review);
    return res.data?.data ?? res.data;
  },

  deleteReview: async (reviewId: number): Promise<string> => {
    const res = await api.delete(`${BASE_URL}/${reviewId}`);
    return res.data?.data ?? res.data;
  },

  getReviewsByBike: async (bikeId: number): Promise<Review[]> => {
    const res = await api.get(`${BASE_URL}/bike/${bikeId}`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  getReviewsByCustomer: async (customerId: number): Promise<Review[]> => {
    const res = await api.get(`${BASE_URL}/customer/${customerId}`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  getAverageRating: async (bikeId: number): Promise<number> => {
    const res = await api.get(`${BASE_URL}/bike/${bikeId}/average`);
    const data = res.data?.data ?? res.data;
    return typeof data === "number" ? data : Number(data) || 0;
  },
};

export default reviewApi;
