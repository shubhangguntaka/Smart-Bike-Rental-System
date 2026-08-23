export interface ReportDateRange {
  from?: string;
  to?: string;
}

export interface BookingReportRow {
  bookingId: number;
  customerId: number;
  bikeId: number;

  bookingStatus: string;
  paymentStatus: string;

  rentalAmount: number;

  startTime?: string;
  returnTime?: string;

  actualPickupTime?: string;
  actualReturnTime?: string;

  createdAt?: string;
}

export interface RevenueReportRow {
  paymentId: number;
  bookingId: number;

  amount: number;
  status: string;

  paymentDate?: string;
}

export interface BikeReportRow {
  bikeId: number;
  ownerId: number;
  bikeName: string;
  brand: string;
  model: string;
  registrationNumber: string;
  rentalPrice: number;
  location: string;
  bikeStatus: string;
  rentalType?: string;
  hourlyRate?: number;
  availableDate?: string;
  createdAt?: string;
}

export interface PaymentReportRow {
  paymentId: number;
  bookingId: number;

  amount: number;
  status: string;

  paymentDate?: string;
  createdAt?: string;
}