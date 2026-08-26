import { CheckCircle2, ReceiptText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import type { PaymentResponse } from "@/types/payment";

interface PaymentSuccessState {
  payment?: PaymentResponse;
}

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = (location.state as PaymentSuccessState | null)?.payment;

  return (
    <div className="min-h-[70vh] bg-background px-4 py-10">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary">
          Payment complete
        </p>
        <h1 className="mt-2 text-2xl font-black text-foreground">
          Your payment was successful
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {payment?.invoiceNumber
            ? `Invoice ${payment.invoiceNumber} is ready.`
            : "Your payment has been verified by the backend."}
        </p>
        {payment && (
          <div className="mt-6 rounded-xl bg-muted p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ReceiptText className="h-4 w-4 text-primary" />
              Payment receipt
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Booking</span>
              <span className="font-bold text-foreground">#{payment.bookingId}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">₹{payment.finalAmount.toFixed(2)}</span>
            </div>
            {payment.transactionId && (
              <div className="mt-2 flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Transaction</span>
                <span className="truncate font-bold text-foreground">{payment.transactionId}</span>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate("/customer/booking-history")}
          className="mt-7 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          View booking history
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
