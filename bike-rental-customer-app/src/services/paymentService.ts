import paymentApi from "../api/paymentApi";
import { InvoiceDTO, PaymentRequest, PaymentResponse } from "../types/payment";

export const paymentService = {
  preparePayment: async (bookingId: number): Promise<PaymentResponse> => {
    return paymentApi.preparePayment(bookingId);
  },

  processPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    return paymentApi.processPayment(request);
  },

  getPaymentById: async (paymentId: number): Promise<PaymentResponse> => {
    return paymentApi.getPaymentById(paymentId);
  },

  getPaymentByBookingId: async (bookingId: number): Promise<PaymentResponse> => {
    return paymentApi.getPaymentByBookingId(bookingId);
  },

  getPaymentHistory: async (): Promise<PaymentResponse[]> => {
    return paymentApi.getPaymentHistory();
  },

  retryPayment: async (paymentId: number): Promise<PaymentResponse> => {
    return paymentApi.retryPayment(paymentId);
  },

  getInvoice: async (paymentId: number): Promise<InvoiceDTO> => {
    return paymentApi.getInvoice(paymentId);
  },
};

export default paymentService;
