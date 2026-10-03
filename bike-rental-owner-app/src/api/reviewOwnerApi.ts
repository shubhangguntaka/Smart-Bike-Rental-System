import api from "./axios";
import { Review } from "../types/review";

export const reviewOwnerApi = {
  getAllReviews: () =>
    api.get<Review[]>("/reviews"),

  getReviewsByBike: (bikeId: number) =>
    api.get<Review[]>(`/reviews/bike/${bikeId}`),

  getAverageRating: (bikeId: number) =>
    api.get<number>(`/reviews/bike/${bikeId}/average`),
};

export default reviewOwnerApi;
