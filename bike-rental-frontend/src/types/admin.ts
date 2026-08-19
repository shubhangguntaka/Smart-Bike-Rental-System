export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "DISABLED";

export type AdminBikeStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE";

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
  status?: string;
  profileImage?: string;
}

export interface CustomerAdmin {
  customerId: number;
  customerName: string;
  email: string;
  phoneNumber?: string;
  status?: string;

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

  status?: string;

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
  bikeStatus?: string;
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

  amount: number;

  status: string;

  paymentDate: string;
}