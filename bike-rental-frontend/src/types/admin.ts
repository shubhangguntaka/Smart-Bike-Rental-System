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

export interface OwnerAdmin {
  ownerId: number;
  ownerName: string;
  email: string;
  totalBikes?: number;
  totalBookings?: number;
  totalEarnings?: number;
  verificationStatus?: boolean;
  status?: string;
}

export interface BikeAdmin {
  bikeId: number;
  bikeName?: string;
  registrationNumber?: string;

  ownerId?: number;
  ownerName?: string;

  category?: string;
  bikeStatus?: string;

  pricePerHour?: number;
  location?: string;
}

export interface BookingAdmin {
  bookingId: number;

  customerId?: number;
  customerName?: string;

  ownerId?: number;
  ownerName?: string;

  bikeId?: number;
  bikeName?: string;

  bookingStatus?: string;

  startDateTime?: string;
  endDateTime?: string;

  actualPickupTime?: string;
  actualReturnTime?: string;

  totalAmount?: number;
}