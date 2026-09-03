import React from "react";
import { Clock3 } from "lucide-react";

import type { PaymentResponse } from "@/types/payment";

interface LateChargeBreakdownProps {
  payment: PaymentResponse;
}

const LateChargeBreakdown: React.FC<LateChargeBreakdownProps> = ({
  payment,
}) => {
  const lateCharge = Number(payment.lateCharge ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Clock3 className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">
            Late Return
          </h3>

          {lateCharge > 0 ? (
            <>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A late-return charge has been included in your final
                payable amount.
              </p>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Late charge
                </span>

                <span className="text-sm font-bold text-foreground">
                  ₹{lateCharge.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              No late-return charge has been applied.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LateChargeBreakdown;