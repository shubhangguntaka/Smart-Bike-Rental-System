import React from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  paymentMethod: string;
  processing: boolean;
  disabled: boolean;
  onPay: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  paymentMethod,
  processing,
  disabled,
  onPay,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-foreground">
          Complete Payment
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          You will be redirected to Razorpay Test Checkout.
        </p>
      </div>

      <div className="mb-5 rounded-xl bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Amount payable
          </span>

          <span className="text-xl font-black text-foreground">
            ₹{Number(amount).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={
          disabled ||
          processing ||
          paymentMethod !== "RAZORPAY"
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ₹{Number(amount).toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentForm;