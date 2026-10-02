import bookingApi from "../api/bookingApi";
import { verificationApi } from "../api/verificationApi";
import { Booking, BookingRequest } from "../types/booking";

export const bookingService = {
  createBooking: async (customerId: number, booking: BookingRequest): Promise<Booking> => {
    const res = await bookingApi.createBooking(customerId, booking);
    return (res.data as any)?.data ?? res.data;
  },

  getBookingById: async (bookingId: number): Promise<Booking> => {
    const res = await bookingApi.getBookingById(bookingId);
    return (res.data as any)?.data ?? res.data;
  },

  getCustomerBookings: async (customerId: number): Promise<Booking[]> => {
    try {
      const res = await bookingApi.getCustomerBookings(customerId);
      const data = (res.data as any)?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching customer bookings:", err);
      return [];
    }
  },

  cancelBooking: async (bookingId: number, reason?: string): Promise<Booking> => {
    const res = await bookingApi.cancelBooking(bookingId, reason);
    return (res.data as any)?.data ?? res.data;
  },

  confirmBooking: async (bookingId: number): Promise<Booking> => {
    const res = await bookingApi.confirmBooking(bookingId);
    return (res.data as any)?.data ?? res.data;
  },

  checkVerificationStatus: async (customerId: number): Promise<boolean> => {
    try {
      const res = await bookingApi.checkVerificationStatus(customerId);
      const data = (res.data as any)?.data ?? res.data;
      return Boolean(data);
    } catch {
      return false;
    }
  },

  getVerificationDetails: async (customerId: number) => {
    try {
      const [aadhaarRes, dlRes] = await Promise.all([
        verificationApi.getAadhaarStatus(customerId).catch(() => null),
        verificationApi.getDrivingLicenseStatus(customerId).catch(() => null),
      ]);
      const isAadhaarApproved = Boolean(
        aadhaarRes &&
          (aadhaarRes.status === "APPROVED" ||
            aadhaarRes.status === "VERIFIED" ||
            aadhaarRes.verified)
      );
      const isDlApproved = Boolean(
        dlRes &&
          (dlRes.status === "APPROVED" ||
            dlRes.status === "VERIFIED" ||
            dlRes.verified)
      );
      return {
        aadhaarVerified: isAadhaarApproved,
        dlVerified: isDlApproved,
        aadhaarData: aadhaarRes || null,
        dlData: dlRes || null,
      };
    } catch {
      return {
        aadhaarVerified: false,
        dlVerified: false,
        aadhaarData: null,
        dlData: null,
      };
    }
  },

  checkAvailability: async (
    bikeId: number,
    startTime: string,
    returnTime: string
  ): Promise<boolean> => {
    try {
      const res = await bookingApi.checkAvailability(bikeId, startTime, returnTime);
      const data = (res.data as any)?.data ?? res.data;
      return Boolean(data);
    } catch {
      return true;
    }
  },

  getRideTracking: async (bookingId: number) => {
    const res = await bookingApi.getRideTracking(bookingId);
    return (res.data as any)?.data ?? res.data;
  },
};

export default bookingService;
