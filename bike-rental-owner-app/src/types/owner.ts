export interface OwnerDashboardDTO {
  ownerId?: number;
  ownerName?: string;
  totalBikes: number;
  availableBikes: number;
  bookedBikes: number;
  pendingBookings: number;
  completedBookings: number;
  totalBookings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayments: number;
  aadhaarVerified: boolean;
  rcVerified: boolean;
  aadhaarStatus?: string;
  rcStatus?: string;
}

export interface OwnerProfileDTO {
  ownerId?: number;
  id?: number;
  ownerName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  totalBikes?: number;
  totalBookings?: number;
  totalEarnings?: number;
  verificationStatus?: boolean;
  profileImage?: string;
}

export interface BookingRequestDTO {
  bookingId: number;
  bikeId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bikeName: string;
  pickupDate: string;
  returnDate: string;
  rentalAmount: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RENTED" | string;
  updatedAt?: string;
  createdAt?: string;
}

export interface EarningsDTO {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
  pendingPayments: number;
}

export interface OwnerPaymentDTO {
  paymentId: number;
  bookingId: number;
  customerId?: number;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bikeId?: number;
  bikeName?: string;
  bikeModel?: string;
  bikeRegistrationNumber?: string;
  rentalStart?: string;
  scheduledReturn?: string;
  actualPickup?: string;
  actualReturn?: string;
  rentalDurationDays?: number;
  baseRentalAmount?: number;
  lateCharge?: number;
  eligibleTransactionAmount?: number;
  platformFeePercent?: number;
  platformFeeAmount?: number;
  taxAmount?: number;
  finalAmount?: number;
  ownerEarnings?: number;
  adminShareAmount?: number;
  ownerBankName?: string;
  ownerAccountNumber?: string;
  ownerIfscCode?: string;
  ownerUpiId?: string;
  payoutUtr?: string;
  payoutStatus?: string;
  payoutSettledAt?: string;
  paymentStatus: "PENDING" | "PROCESSING" | "READY_FOR_PAYMENT" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED" | string;
  paymentMethod?: string;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface OwnerEarningsSummaryDTO {
  totalEarnings?: number;
  totalCustomerPaid?: number;
  totalPlatformFees?: number;
  totalRentalAmount?: number;
  totalLateCharges?: number;
  totalSuccessfulPayments?: number;
  totalPendingPayments?: number;
}

export interface BankAccountDTO {
  id?: number;
  userId?: number;
  userRole?: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  maskedAccountNumber?: string;
  ifscCode: string;
  accountType?: "SAVINGS" | "CURRENT" | string;
  upiId?: string;
  branchName?: string;
  payoutFrequency?: "instant" | "daily" | "weekly" | string;
  autoSettlementEnabled?: boolean;
  minPayoutThreshold?: number;
  isPrimary?: boolean;
  isVerified?: boolean;
  isKycVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
