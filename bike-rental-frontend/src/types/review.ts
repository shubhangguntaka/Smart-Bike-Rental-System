
export interface Review {
  reviewId?: number;
  bookingId: number;
  bikeId: number;
  customerId: number;
  rating: number;
  reviewMessage: string;
  reviewDate?: string;
  createdAt?: string;
}

export interface ReviewDTO {
  reviewId?: number;
  bookingId: number;
  bikeId: number;
  customerId: number;
  rating: number;
  reviewMessage: string;
}