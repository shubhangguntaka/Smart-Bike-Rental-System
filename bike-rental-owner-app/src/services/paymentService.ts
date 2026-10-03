import paymentOwnerApi from "../api/paymentOwnerApi";
import { PaymentResponse, InvoiceDTO } from "../types/payment";
import { OwnerPaymentDTO, OwnerEarningsSummaryDTO } from "../types/owner";

export const paymentService = {
  async getPaymentById(paymentId: number): Promise<PaymentResponse> {
    const res = await paymentOwnerApi.getPaymentById(paymentId);
    return res.data;
  },

  async getPaymentByBooking(bookingId: number): Promise<PaymentResponse> {
    const res = await paymentOwnerApi.getPaymentByBooking(bookingId);
    return res.data;
  },

  async getInvoice(paymentId: number): Promise<InvoiceDTO> {
    const res = await paymentOwnerApi.getInvoice(paymentId);
    return res.data;
  },

  async getOwnerPayments(status?: string): Promise<OwnerPaymentDTO[]> {
    const res = await paymentOwnerApi.getOwnerPayments(status);
    return res.data?.data || (res.data as any) || [];
  },

  async getOwnerEarningsSummary(): Promise<OwnerEarningsSummaryDTO> {
    const res = await paymentOwnerApi.getOwnerEarningsSummary();
    return res.data?.data || (res.data as any);
  },
};

export default paymentService;
