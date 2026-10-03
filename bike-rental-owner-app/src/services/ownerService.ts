import ownerApi from "../api/ownerApi";
import {
  OwnerDashboardDTO,
  OwnerProfileDTO,
  BookingRequestDTO,
  EarningsDTO,
  OwnerPaymentDTO,
  OwnerEarningsSummaryDTO,
  BankAccountDTO,
} from "../types/owner";

export const ownerService = {
  async getDashboard(): Promise<OwnerDashboardDTO> {
    const res = await ownerApi.getDashboard();
    return res.data?.data || (res.data as any);
  },

  async getProfile(): Promise<OwnerProfileDTO> {
    const res = await ownerApi.getProfile();
    return res.data?.data || (res.data as any);
  },

  async updateProfile(data: Partial<OwnerProfileDTO>): Promise<OwnerProfileDTO> {
    const res = await ownerApi.updateProfile(data);
    return res.data?.data || (res.data as any);
  },

  async getEarnings(): Promise<EarningsDTO> {
    const res = await ownerApi.getEarnings();
    return res.data?.data || (res.data as any);
  },

  async getVerificationStatus(): Promise<boolean> {
    const res = await ownerApi.getVerificationStatus();
    return !!(res.data?.data ?? res.data);
  },

  async getBookingRequests(): Promise<BookingRequestDTO[]> {
    const res = await ownerApi.getBookingRequests();
    return res.data?.data || (res.data as any) || [];
  },

  async approveBooking(bookingId: number): Promise<void> {
    await ownerApi.approveBooking(bookingId);
  },

  async rejectBooking(bookingId: number): Promise<void> {
    await ownerApi.rejectBooking(bookingId);
  },

  async cancelBooking(bookingId: number, reason?: string): Promise<any> {
    const res = await ownerApi.cancelBooking(bookingId, reason);
    return res.data?.data || res.data;
  },

  async getPayments(status?: string): Promise<OwnerPaymentDTO[]> {
    const res = await ownerApi.getPayments(status);
    return res.data?.data || (res.data as any) || [];
  },

  async getPaymentById(paymentId: number): Promise<OwnerPaymentDTO> {
    const res = await ownerApi.getPaymentById(paymentId);
    return res.data?.data || (res.data as any);
  },

  async getEarningsSummary(): Promise<OwnerEarningsSummaryDTO> {
    const res = await ownerApi.getEarningsSummary();
    return res.data?.data || (res.data as any);
  },

  async getBankAccount(): Promise<BankAccountDTO> {
    const res = await ownerApi.getBankAccount();
    return res.data?.data || (res.data as any);
  },

  async updateBankAccount(data: Partial<BankAccountDTO>): Promise<BankAccountDTO> {
    const res = await ownerApi.updateBankAccount(data);
    return res.data?.data || (res.data as any);
  },
};

export default ownerService;
