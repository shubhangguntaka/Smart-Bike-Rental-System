export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "DISABLED";

export type AdminBikeStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "UNDER_MAINTENANCE"
  | "NOT_AVAILABLE";

export interface AdminDashboard {
  totalUsers: number;
  totalOwners: number;
  totalBikes: number;
  totalBookings: number;
  totalPayments: number;

  activeUsers: number;
  activeBikes: number;
  activeBookings: number;

  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface UserAdmin {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
  status?: AdminUserStatus;
  profileImage?: string;
}

export interface CustomerAdmin {
  customerId: number;
  customerName: string;
  email: string;
  phoneNumber?: string;

  status?: AdminUserStatus;

  aadhaarVerified?: boolean;
  drivingLicenseVerified?: boolean;
  verificationStatus?: boolean;

  totalBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  totalRentalAmount?: number;

  profileImage?: string;
}

export interface OwnerAdmin {
  ownerId: number;
  ownerName: string;
  email: string;
  phoneNumber?: string;

  status?: AdminUserStatus;
  verificationStatus?: boolean;

  totalBikes?: number;
  totalBookings?: number;
  totalEarnings?: number;

  profileImage?: string;
}

export interface BikeAdmin {
  bikeId: number;

  bikeName?: string;
  brand?: string;
  model?: string;

  registrationNumber?: string;

  ownerId?: number;
  ownerName?: string;

  category?: string;

  bikeStatus?: AdminBikeStatus;

  rentalPrice?: number;
  hourlyRate?: number;

  location?: string;

  rcVerified?: boolean;
  imageUrl?: string;
}

export interface BookingAdmin {
  bookingId: number;

  customerId?: number;
  customerName?: string;

  ownerId?: number;
  ownerName?: string;

  bikeId?: number;
  bikeName?: string;
  registrationNumber?: string;

  bookingStatus?: string;
  paymentStatus?: string;

  startTime?: string;
  returnTime?: string;

  actualPickupTime?: string;
  actualReturnTime?: string;

  rentalAmount?: number;
  totalAmount?: number;

  bookingReference?: string;
  createdAt?: string;
}

export interface PaymentAdmin {
  paymentId: number;
  bookingId: number;
  customerId?: number;
  amount: number;
  finalAmount?: number;
  baseRentalAmount?: number;
  lateCharge?: number;
  taxAmount?: number;
  platformFeePercent?: number;
  platformFeeAmount?: number;
  status: string;
  paymentStatus?: string;
  paymentDate: string;
  paidAt?: string;
  createdAt?: string;
  transactionId?: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
}

export interface AdminActivity {
  id?: number | string;
  action?: string;
  performedBy?: string;
  timestamp?: string;
  details?: string;
  status?: string;
  targetType?: string;
  targetId?: number | string;
}