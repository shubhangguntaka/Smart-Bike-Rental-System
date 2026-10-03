import bookingOwnerApi from "../api/bookingOwnerApi";
import { BookingResponse, RideTrackingDTO } from "../types/booking";

export const bookingService = {
  async getBookingById(bookingId: number): Promise<BookingResponse> {
    const res = await bookingOwnerApi.getBookingById(bookingId);
    return res.data?.data || (res.data as any);
  },

  async confirmBooking(bookingId: number): Promise<BookingResponse> {
    const res = await bookingOwnerApi.confirmBooking(bookingId);
    return res.data?.data || (res.data as any);
  },

  async updateStatus(bookingId: number, status: string): Promise<BookingResponse> {
    const res = await bookingOwnerApi.updateStatus(bookingId, status);
    return res.data?.data || (res.data as any);
  },

  async cancelBooking(bookingId: number, reason: string): Promise<BookingResponse> {
    const res = await bookingOwnerApi.cancelBooking(bookingId, reason);
    return res.data?.data || (res.data as any);
  },

  async scanQRCode(qrCode: string): Promise<BookingResponse> {
    const res = await bookingOwnerApi.scanQRCode(qrCode);
    return res.data?.data || (res.data as any);
  },

  async handoverBooking(bookingId: number): Promise<BookingResponse> {
    const res = await bookingOwnerApi.handoverBooking(bookingId);
    return res.data?.data || (res.data as any);
  },

  async returnBooking(bookingId: number): Promise<BookingResponse> {
    const res = await bookingOwnerApi.returnBooking(bookingId);
    return res.data?.data || (res.data as any);
  },

  async getRideTracking(bookingId: number): Promise<RideTrackingDTO> {
    const res = await bookingOwnerApi.getRideTracking(bookingId);
    return res.data?.data || (res.data as any);
  },
};

export default bookingService;
