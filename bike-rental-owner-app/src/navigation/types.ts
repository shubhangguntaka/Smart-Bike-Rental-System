import { BikeDTO } from "../types/bike";
import { BookingRequestDTO, OwnerPaymentDTO } from "../types/owner";
import { BookingResponse } from "../types/booking";

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string; otp?: string };
};

export type OwnerTabParamList = {
  DashboardTab: undefined;
  MyBikesTab: undefined;
  BookingsTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

export type OwnerStackParamList = {
  OwnerTabs: undefined;
  AddBikeScreen: undefined;
  EditBikeScreen: { bikeId: number; bike?: BikeDTO };
  BikeDetailsScreen: { bikeId: number; bike?: BikeDTO };
  BookingRequestsScreen: undefined;
  BookingDetailsScreen: {
    bookingId: number;
    booking?: BookingRequestDTO | BookingResponse;
  };
  CurrentRentalsScreen: undefined;
  TrackBikeScreen: {
    bookingId: number;
    rideId?: number;
    rental?: BookingResponse;
  };
  QRScannerScreen: undefined;
  EarningsScreen: undefined;
  TransactionHistoryScreen: undefined;
  PaymentDetailsScreen: { paymentId: number; payment?: OwnerPaymentDTO };
  ReviewsScreen: { bikeId?: number };
  NotificationsScreen: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  BankAccountScreen: undefined;
  VerificationScreen: undefined;
  DocumentsScreen: { bikeId?: number };
  SettingsScreen: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
