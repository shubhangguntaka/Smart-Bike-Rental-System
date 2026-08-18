export interface Review {
  reviewId?: number;
  bookingId: number;
  customerId: number;
  bikeId: number;
  rating: number;
  reviewMessage: string;
  reviewDate?: string;
  createdAt?: string;
  customerName?: string;
}

export interface ReviewDTO {
  reviewId?: number;
  bookingId: number;
  bikeId: number;
  rating: number;
  reviewMessage: string;
}