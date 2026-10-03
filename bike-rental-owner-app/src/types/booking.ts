export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "APPROVED"
  | "CANCELLED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "RENTED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY_FOR_PAYMENT"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface BookingResponse {
  bookingId: number;
  bikeId: number;
  customerId: number;
  bookingReference?: string;
  startTime: string;
  returnTime: string;
  bikeName: string;
  bikeImage?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  registrationNumber?: string;
  ownerId?: number;
  ownerName?: string;
  actualPickupTime?: string;
  actualReturnTime?: string;
  totalDays?: number;
  totalAmount?: number;
  rentalAmount?: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  qrCode?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  bookingDate?: string;
  createdAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface RideTrackingDTO {
  status: string;
  pickupLocation: string;
  dropLocation: string;
  currentLocation: string;
  rideDuration: string;
  eta: string;
  latitude: number;
  longitude: number;
}
