import axios from "axios";
import type { Review, ReviewDTO } from "../types/review";

const API_URL = "http://localhost:8888/api/reviews";

const reviewService = {

  getAllReviews: async (): Promise<Review[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getReviewById: async (id: number): Promise<Review> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  addReview: async (review: ReviewDTO): Promise<Review> => {
    const response = await axios.post(API_URL, review);
    return response.data;
  },

  updateReview: async (
    id: number,
    review: ReviewDTO
  ): Promise<Review> => {
    const response = await axios.put(`${API_URL}/${id}`, review);
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  getBikeRatings: async (bikeId: number): Promise<number> => {
    const response = await axios.get(
      `${API_URL}/bike/${bikeId}/average`
    );
    return response.data;
  }

};

export default reviewService;