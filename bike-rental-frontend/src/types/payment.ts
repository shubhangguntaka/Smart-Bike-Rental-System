export interface PaymentRequest {
    paymentId: number;
    paymentMethod: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentResponse {
    paymentId: number;
    bookingId: number;
    customerId: number;

    baseRentalAmount: number;
    lateCharge: number;
    eligibleTransactionAmount: number;

    platformFeePercent: number;
    platformFeeAmount: number;

    taxAmount: number;
    finalAmount: number;

    paymentStatus: "NOT_STARTED" | "READY_FOR_PAYMENT" | "PROCESSING" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

    transactionId?: string;
    paymentMethod?: string;

    razorpayOrderId?: string;
    razorpayPaymentId?: string;

    paidAt?: string;
    invoiceNumber?: string;
    createdAt?: string;

    razorpayKeyId?: string;
}

export interface InvoiceDTO {
    invoiceNumber: string;
    paymentId: number;
    bookingId: number;
    customerId: number;

    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;

    baseRentalAmount: number;
    lateCharge: number;
    eligibleTransactionAmount: number;

    platformFeePercent: number;
    platformFeeAmount: number;

    taxAmount: number;
    finalAmount: number;

    paymentStatus: string;
    transactionId?: string;
    paymentMethod?: string;
    paidAt?: string;
    createdAt?: string;
}