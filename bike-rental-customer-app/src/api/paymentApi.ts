import api from "./axios";
import { InvoiceDTO, PaymentRequest, PaymentResponse } from "../types/payment";

export const paymentApi = {
  preparePayment: async (bookingId: number): Promise<PaymentResponse> => {
    const res = await api.post<PaymentResponse>(`/payments/prepare/${bookingId}`);
    return res.data;
  },

  processPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const res = await api.post<PaymentResponse>("/payments/process", request);
    return res.data;
  },

  getPaymentById: async (paymentId: number): Promise<PaymentResponse> => {
    const res = await api.get<PaymentResponse>(`/payments/${paymentId}`);
    return res.data;
  },

  getPaymentByBookingId: async (bookingId: number): Promise<PaymentResponse> => {
    const res = await api.get<PaymentResponse>(`/payments/booking/${bookingId}`);
    return res.data;
  },

  getPaymentHistory: async (): Promise<PaymentResponse[]> => {
    const res = await api.get<PaymentResponse[]>("/payments/history");
    return Array.isArray(res.data) ? res.data : [];
  },

  retryPayment: async (paymentId: number): Promise<PaymentResponse> => {
    const res = await api.post<PaymentResponse>(`/payments/${paymentId}/retry`);
    return res.data;
  },

  getInvoice: async (paymentId: number): Promise<InvoiceDTO> => {
    const res = await api.get<InvoiceDTO>(`/payments/${paymentId}/invoice`);
    return res.data;
  },
};

export default paymentApi;
