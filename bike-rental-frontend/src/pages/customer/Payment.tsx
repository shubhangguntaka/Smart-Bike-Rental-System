import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  ReceiptText,
  AlertCircle,
} from "lucide-react";

import paymentService from "@/services/paymentService";
import type { PaymentResponse } from "@/types/payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();

  const bookingId = Number(
    bookingIdParam || location.state?.bookingId
  );

  const [payment, setPayment] =
    useState<PaymentResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    preparePayment();
  }, [bookingId]);

  const preparePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await paymentService.preparePayment(
          bookingId
        );

      setPayment(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to prepare payment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!payment) {
      return;
    }

    if (!payment.razorpayKeyId) {
      setError(
        "Razorpay key is not available."
      );
      return;
    }

    if (!payment.razorpayOrderId) {
      setError(
        "Razorpay order was not created."
      );
      return;
    }

    const razorpayOrderId = payment.razorpayOrderId;

    if (!window.Razorpay) {
      setError("Razorpay Checkout is unavailable. Please try again.");
      return;
    }

    const options = {
      key: payment.razorpayKeyId,

      amount: Math.round(
        payment.finalAmount * 100
      ),

      currency: "INR",

      name: "Smart Bike Rental",

      description:
        `Bike rental payment - Booking #${payment.bookingId}`,

      order_id:
        razorpayOrderId,

      handler: async (response: any) => {
        try {
          setProcessing(true);
          setError("");

          const verifiedPayment =
            await paymentService.processPayment({
              paymentId:
                payment.paymentId,

              paymentMethod:
                "RAZORPAY",

              razorpayOrderId:
                razorpayOrderId,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,
            });

          navigate(
            "/customer/payment/success",
            {
              state: {
                payment:
                  verifiedPayment,
              },
            }
          );
        } catch (err: any) {
          navigate(
            "/customer/payment/failed",
            {
              state: {
                message:
                  err?.response?.data
                    ?.message ||
                  "Payment verification failed.",
              },
            }
          );
        } finally {
          setProcessing(false);
        }
      },

      modal: {
        ondismiss: () => {
          setError(
            "Payment was cancelled."
          );
        },
      },

      theme: {
        color: "#3f8f6b",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      (response: any) => {
        navigate(
          "/customer/payment/failed",
          {
            state: {
              message:
                response?.error?.description ||
                "Payment failed.",
            },
          }
        );
      }
    );

    razorpay.open();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm font-semibold text-muted-foreground">
            Preparing your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />

            <h2 className="text-lg font-bold text-foreground">
              Payment Preparation Failed
            </h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="min-h-[80vh] bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Secure Checkout
            </p>

            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
              Complete Your Payment
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Booking #{payment.bookingId}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Payment information */}

          <div className="space-y-6">

            {/* Status */}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h2 className="font-bold text-foreground">
                    Payment Ready
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your bike return has been confirmed.
                    The amount below was calculated by
                    the backend.
                  </p>
                </div>

              </div>
            </div>

            {/* Breakdown */}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-primary" />

                <h2 className="font-bold text-foreground">
                  Payment Summary
                </h2>
              </div>

              <div className="space-y-4">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Base rental amount
                  </span>

                  <span className="text-sm font-bold text-foreground">
                    ₹{payment.baseRentalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Late return charge
                  </span>

                  <span className="text-sm font-bold text-foreground">
                    ₹{payment.lateCharge.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Eligible transaction amount
                  </span>

                  <span className="text-sm font-bold text-foreground">
                    ₹{payment.eligibleTransactionAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Platform fee ({payment.platformFeePercent}%)
                  </span>

                  <span className="text-sm font-bold text-foreground">
                    ₹{payment.platformFeeAmount.toFixed(2)}
                  </span>
                </div>

                {payment.taxAmount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Tax
                    </span>

                    <span className="text-sm font-bold text-foreground">
                      ₹{payment.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">

                    <span className="text-base font-bold text-foreground">
                      Final Amount
                    </span>

                    <span className="text-2xl font-black text-primary">
                      ₹{payment.finalAmount.toFixed(2)}
                    </span>

                  </div>
                </div>

              </div>
            </div>

            {/* Security */}

            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">

              <div className="flex gap-3">

                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />

                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Secure Razorpay Test Checkout
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your payment is processed through Razorpay.
                    Payment verification is performed securely
                    by the backend.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Checkout card */}

          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>

              <div>
                <h2 className="font-bold text-foreground">
                  Payment
                </h2>

                <p className="text-xs text-muted-foreground">
                  Razorpay Test Mode
                </p>
              </div>

            </div>

            <div className="mb-6 rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">
                Amount payable
              </p>

              <p className="mt-1 text-3xl font-black text-foreground">
                ₹{payment.finalAmount.toFixed(2)}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs font-semibold text-destructive">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={processing}
              className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Payment...
                </span>
              ) : (
                `Pay ₹${payment.finalAmount.toFixed(2)}`
              )}
            </button>

            <p className="mt-4 text-center text-[11px] leading-4 text-muted-foreground">
              You will be redirected to Razorpay Checkout
              to complete the payment.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;