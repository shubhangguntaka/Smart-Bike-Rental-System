import React from "react";
import { BadgePercent } from "lucide-react";

import type { PaymentResponse } from "@/types/payment";

interface PlatformFeeBreakdownProps {
  payment: PaymentResponse;
}

const PlatformFeeBreakdown: React.FC<
  PlatformFeeBreakdownProps
> = ({ payment }) => {
  const percentage = Number(
    payment.platformFeePercent ?? 0
  );

  const amount = Number(
    payment.platformFeeAmount ?? 0
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BadgePercent className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">
            Platform Charge
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Platform fee calculated by the backend according to
            the configured transaction tier.
          </p>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Platform fee ({percentage}%)
            </span>

            <span className="text-sm font-bold text-foreground">
              ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlatformFeeBreakdown;