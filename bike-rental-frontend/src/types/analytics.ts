export interface DashboardAnalytics {
  totalUsers: number;
  totalCustomers: number;
  totalOwners: number;

  totalBikes: number;
  availableBikes: number;
  bookedBikes: number;
  maintenanceBikes: number;
  notAvailableBikes: number;

  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;

  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;

  totalRides: number;
  activeRides: number;
  completedRides: number;

  bikeUtilizationPercentage: number;

  generatedAt: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  successfulPaymentCount: number;
  failedPaymentCount: number;
  averagePaymentAmount: number;
  revenueByDate: Record<string, number>;
}

export interface RideAnalytics {
  totalRides: number;
  activeRides: number;
  completedRides: number;

  totalDistance: number;
  averageDistance: number;

  totalDuration: number;
  averageDuration: number;

  ridesByDate: Record<string, number>;
}

export interface AnalyticsDateRange {
  from?: string;
  to?: string;
}

export type BookingAnalytics = Record<string, number>;

export type UserAnalytics = Record<string, number>;

export type BikeAnalytics = Record<string, number>;