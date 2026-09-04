import api from "@/api/axios";
import type { InvoiceDTO, PaymentRequest, PaymentResponse } from "@/types/payment";

const paymentService = {

    preparePayment: async (
        bookingId: number
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            `/payments/prepare/${bookingId}`
        );

        return response.data;
    },

    processPayment: async (
        request: PaymentRequest
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            "/payments/process",
            request
        );

        return response.data;
    },

    getPaymentById: async (
        paymentId: number
    ): Promise<PaymentResponse> => {

        const response = await api.get(
            `/payments/${paymentId}`
        );

        return response.data;
    },

    getPaymentByBookingId: async (
        bookingId: number
    ): Promise<PaymentResponse> => {

        const response = await api.get(
            `/payments/booking/${bookingId}`
        );

        return response.data;
    },

    getPaymentHistory: async (): Promise<PaymentResponse[]> => {

        const response = await api.get(
            "/payments/history"
        );

        return response.data;
    },

    retryPayment: async (
        paymentId: number
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            `/payments/${paymentId}/retry`
        );

        return response.data;
    },

    getInvoice: async (
        paymentId: number
    ): Promise<InvoiceDTO> => {

        const response = await api.get(
            `/payments/${paymentId}/invoice`
        );

        return response.data;
    }
};

export default paymentService;