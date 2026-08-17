export interface DashboardStatistics {
  ownerId?: number;
  ownerName?: string;
  totalBikes: number;
  availableBikes: number;
  bookedBikes: number;
  totalBookings: number;
  totalEarnings: number;
  todayEarnings?: number;
  weeklyEarnings?: number;
  monthlyEarnings?: number;
  pendingPayments?: number;
  pendingBookings: number;
  completedBookings: number;
  aadhaarVerified: boolean;
  rcVerified: boolean;
}

export interface OwnerProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface BookingRequest {
  bookingId: number;
  bikeId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bikeName: string;
  pickupDate: string;
  returnDate: string;
  rentalAmount: number;
  bookingStatus: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Earnings {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  pendingPayments: number;
}