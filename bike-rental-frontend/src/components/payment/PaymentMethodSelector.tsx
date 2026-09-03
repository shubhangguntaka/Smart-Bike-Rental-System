import React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PaymentMethodSelector: React.FC<
  PaymentMethodSelectorProps
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-bold text-foreground">
          Payment Method
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Razorpay Test Mode is enabled for development.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange("RAZORPAY")}
        className={[
          "w-full rounded-xl border p-4 text-left transition",
          value === "RAZORPAY"
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted",
        ].join(" ")}
      >
        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              Razorpay
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              UPI, cards, net banking and supported test methods
            </p>
          </div>

          <div
            className={[
              "h-5 w-5 rounded-full border-2",
              value === "RAZORPAY"
                ? "border-primary bg-primary"
                : "border-border",
            ].join(" ")}
          >
            {value === "RAZORPAY" && (
              <div className="m-1 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            )}
          </div>

        </div>
      </button>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Server-side payment verification is enabled.
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
