export interface Review {
  reviewId: number;
  bookingId: number;
  bikeId: number;
  customerId: number;
  customerName?: string;
  rating: number;
  reviewMessage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewDTO {
  bookingId: number;
  bikeId: number;
  customerId: number;
  rating: number;
  reviewMessage: string;
}
