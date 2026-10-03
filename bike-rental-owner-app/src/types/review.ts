export interface Review {
  reviewId?: number;
  id?: number;
  bikeId: number;
  customerId?: number;
  bookingId?: number;
  customerName?: string;
  bikeName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
