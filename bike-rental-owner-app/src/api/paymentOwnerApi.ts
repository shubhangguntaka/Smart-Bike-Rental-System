import api from "./axios";
import { PaymentResponse, InvoiceDTO } from "../types/payment";
import { OwnerPaymentDTO, OwnerEarningsSummaryDTO } from "../types/owner";
import { ApiResponse } from "../types/auth";

export const paymentOwnerApi = {
  getPaymentById: (paymentId: number) =>
    api.get<PaymentResponse>(`/payments/${paymentId}`),

  getPaymentByBooking: (bookingId: number) =>
    api.get<PaymentResponse>(`/payments/booking/${bookingId}`),

  getInvoice: (paymentId: number) =>
    api.get<InvoiceDTO>(`/payments/${paymentId}/invoice`),

  getOwnerPayments: (status?: string) =>
    api.get<ApiResponse<OwnerPaymentDTO[]>>("/owner/payments", {
      params: status && status !== "ALL" ? { status } : undefined,
    }),

  getOwnerEarningsSummary: () =>
    api.get<ApiResponse<OwnerEarningsSummaryDTO>>("/owner/payments/summary"),
};

export default paymentOwnerApi;
