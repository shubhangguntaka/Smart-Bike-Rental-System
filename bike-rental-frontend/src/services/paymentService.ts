import api from "@/api/axios";
import type { PaymentRequest, PaymentResponse } from "@/types/payment";

const paymentService = {

    preparePayment: async (
        bookingId: number
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            `/api/payments/prepare/${bookingId}`
        );

        return response.data;
    },

    processPayment: async (
        request: PaymentRequest
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            "/api/payments/process",
            request
        );

        return response.data;
    },

    getPaymentById: async (
        paymentId: number
    ): Promise<PaymentResponse> => {

        const response = await api.get(
            `/api/payments/${paymentId}`
        );

        return response.data;
    },

    getPaymentByBookingId: async (
        bookingId: number
    ): Promise<PaymentResponse> => {

        const response = await api.get(
            `/api/payments/booking/${bookingId}`
        );

        return response.data;
    },

    getPaymentHistory: async (): Promise<PaymentResponse[]> => {

        const response = await api.get(
            "/api/payments/history"
        );

        return response.data;
    },

    retryPayment: async (
        paymentId: number
    ): Promise<PaymentResponse> => {

        const response = await api.post(
            `/api/payments/${paymentId}/retry`
        );

        return response.data;
    }
};

export default paymentService;