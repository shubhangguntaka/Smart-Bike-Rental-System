import React, {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import paymentService from "@/services/paymentService";

import type {
  PaymentResponse,
} from "@/types/payment";

import PaymentSummary from "@/components/payment/PaymentSummary";

import LateChargeBreakdown from "@/components/payment/LateChargeBreakdown";

import PlatformFeeBreakdown from "@/components/payment/PlatformFeeBreakdown";

import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";

import PaymentForm from "@/components/payment/PaymentForm";


declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}


interface RazorpayOptions {
  key: string;

  amount: number;

  currency: string;

  name: string;

  description: string;

  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: {
    bookingId?: string;
    paymentId?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };

  handler: (
    response: RazorpaySuccessResponse
  ) => void;
}


interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}


interface RazorpayInstance {
  open: () => void;

  on: (
    event: string,
    callback: (response: any) => void
  ) => void;
}


interface PaymentFailedResponse {
  error?: {
    description?: string;
    reason?: string;
    code?: string;
  };
}


const Payment: React.FC = () => {

  const location = useLocation();

  const navigate = useNavigate();

  const { bookingId: bookingIdParam } =
    useParams();


  const bookingId = Number(
    bookingIdParam ||
      location.state?.bookingId
  );


  const [payment, setPayment] =
    useState<PaymentResponse | null>(
      null
    );


  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");


  const [loading, setLoading] =
    useState(true);


  const [processing, setProcessing] =
    useState(false);


  const [error, setError] =
    useState("");


  /*
   * Prepare payment when page loads.
   *
   * Backend:
   *
   * confirmed return
   *       ↓
   * calculate final amount
   *       ↓
   * create Razorpay Test Order
   *       ↓
   * return payment details
   */
  useEffect(() => {

    if (!bookingId) {

      setError(
        "Booking ID is missing."
      );

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

      if (result.paymentStatus === "SUCCESS") {
        navigate(
          "/customer/payment/success",
          {
            state: {
              payment: result,
            },
          }
        );
        return;
      }

    } catch (err: any) {

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unable to prepare payment.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to prepare payment."
      );

    } finally {

      setLoading(false);

    }
  };


  const handlePayment = () => {

    if (!payment) {
      return;
    }


    if (
      paymentMethod !==
      "RAZORPAY"
    ) {

      setError(
        "Please select Razorpay."
      );

      return;
    }


    if (!payment.paymentId) {

      setError(
        "Payment ID is missing."
      );

      return;
    }


    if (!payment.razorpayKeyId) {

      setError(
        "Razorpay public key is not available."
      );

      return;
    }


    if (!payment.razorpayOrderId) {

      setError(
        "Razorpay order was not created by the backend."
      );

      return;
    }


    if (
      !payment.finalAmount ||
      payment.finalAmount <= 0
    ) {

      setError(
        "Invalid final payable amount."
      );

      return;
    }


    if (!window.Razorpay) {

      setError(
        "Razorpay Checkout is unavailable. Please refresh the page and try again."
      );

      return;
    }


    setError("");

    setProcessing(true);


    /*
     * IMPORTANT:
     *
     * The amount is taken from backend
     * calculated finalAmount.
     *
     * The frontend does NOT calculate
     * the rental amount.
     */
    const amountInPaise =
      Math.round(
        Number(
          payment.finalAmount
        ) * 100
      );


    const options: RazorpayOptions = {

      key:
        payment.razorpayKeyId,

      amount:
        amountInPaise,

      currency:
        "INR",

      name:
        "Smart Bike Rental",

      description:
        `Bike rental payment - Booking #${payment.bookingId}`,

      order_id:
        payment.razorpayOrderId,


      notes: {
        bookingId:
          String(payment.bookingId),

        paymentId:
          String(payment.paymentId),
      },


      theme: {
        color:
          "#3f8f6b",
      },


      modal: {

        ondismiss: () => {

          setProcessing(false);

          setError(
            "Payment was cancelled."
          );

        },

      },


      handler:
        async (
          response
        ) => {

          try {

            setError("");

            /*
             * Send Razorpay identifiers
             * to backend.
             *
             * Backend verifies signature.
             */
            const verifiedPayment =
              await paymentService.processPayment({

                paymentId:
                  payment.paymentId,

                paymentMethod:
                  "RAZORPAY",

                razorpayOrderId:
                  response.razorpay_order_id,

                razorpayPaymentId:
                  response.razorpay_payment_id,

                razorpaySignature:
                  response.razorpay_signature,

              });


            /*
             * Backend must return SUCCESS.
             */
            if (
              verifiedPayment.paymentStatus !==
              "SUCCESS"
            ) {

              throw new Error(
                "Payment verification did not return SUCCESS."
              );

            }


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
                  bookingId:
                    payment.bookingId,
                  paymentId:
                    payment.paymentId,
                  message:
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    err?.message ||
                    "Payment verification failed.",
                },
              }
            );

          } finally {

            setProcessing(false);

          }

        },

    };


    try {

      const razorpay =
        new window.Razorpay(
          options
        );


      /*
       * Razorpay reports payment failure
       * through this event.
       */
      razorpay.on(
        "payment.failed",
        (
          response: PaymentFailedResponse
        ) => {

          setProcessing(false);

          navigate(
            "/customer/payment/failed",
            {
              state: {
                bookingId:
                  payment.bookingId,
                paymentId:
                  payment.paymentId,
                message:
                  response?.error
                    ?.description ||
                  response?.error
                    ?.reason ||
                  "Payment failed.",
              },
            }
          );

        }
      );


      razorpay.open();

    } catch (err: any) {

      setProcessing(false);

      setError(
        err?.message ||
        "Unable to open Razorpay Checkout."
      );

    }

  };


  /*
   * Loading
   */
  if (loading) {

    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm font-semibold text-muted-foreground">
            Preparing your final bill...
          </p>

        </div>

      </div>
    );

  }


  /*
   * Preparation error
   */
  if (
    error &&
    !payment
  ) {

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">

        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">

          <div className="mb-4 flex items-center gap-3">

            <AlertCircle className="h-6 w-6 text-destructive" />

            <h2 className="text-lg font-bold text-foreground">
              Payment Preparation Failed
            </h2>

          </div>


          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            {!bookingId
              ? "Please select a completed booking to proceed with checkout."
              : error || "Unable to prepare payment. Please check that bike return has been confirmed."}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted cursor-pointer"
            >
              Go Back
            </button>
            {bookingId && (
              <button
                type="button"
                onClick={preparePayment}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
              >
                Try Again
              </button>
            )}
          </div>

        </div>

      </div>
    );

  }


  if (!payment) {
    return null;
  }


  return (
    <div className="min-h-[80vh] px-4 py-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >

            <ArrowLeft className="h-4 w-4" />

            Back

          </button>


          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Secure Checkout
          </p>


          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            Complete Your Payment
          </h1>


          <p className="mt-2 text-sm text-muted-foreground">
            Booking #{payment.bookingId}
          </p>

        </div>


        {/* General Error */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

            <p className="text-sm text-foreground">
              {error}
            </p>

          </div>
        )}


        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* Return confirmed */}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                  <CheckCircle2 className="h-5 w-5 text-primary" />

                </div>


                <div>

                  <h2 className="font-bold text-foreground">
                    Bike Return Confirmed
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your bike return has been confirmed.
                    The final payable amount has been
                    calculated by the backend.
                  </p>

                </div>

              </div>

            </div>


            {/* Final billing */}

            <PaymentSummary
              payment={payment}
            />


            {/* Late charge */}

            <LateChargeBreakdown
              payment={payment}
            />


            {/* Platform fee */}

            <PlatformFeeBreakdown
              payment={payment}
            />


            {/* Security */}

            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">

              <div className="flex gap-3">

                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />

                <div>

                  <h3 className="text-sm font-bold text-foreground">
                    Secure Razorpay Test Checkout
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your final amount is calculated by
                    the backend. Razorpay payment
                    verification is also performed on
                    the backend before the payment is
                    marked successful.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* RIGHT */}

          <div className="space-y-6">

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={
                setPaymentMethod
              }
            />


            <PaymentForm
              amount={
                payment.finalAmount
              }

              paymentMethod={
                paymentMethod
              }

              processing={
                processing
              }

              disabled={
                !payment.razorpayOrderId ||
                !payment.razorpayKeyId
              }

              onPay={
                handlePayment
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default Payment;