export interface Booking {
  bookingId: number;
  bikeId: number;
  customerId: number;
  bookingReference: string;
  startTime: string;
  returnTime: string;
  totalDays: number;
  totalAmount: number;
  rentalAmount?: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingDate: string;
  createdAt?: string;
  qrCode?: string;
  bikeName?: string;
  bikeImage?: string;
}

export interface BookingRequest {
  bikeId: number;
  startTime: string;
  returnTime: string;
}