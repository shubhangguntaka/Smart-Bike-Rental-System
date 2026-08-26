import { AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface PaymentFailedState {
  message?: string;
}

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = (location.state as PaymentFailedState | null)?.message;

  return (
    <div className="min-h-[70vh] bg-background px-4 py-10">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-destructive">
          Payment not completed
        </p>
        <h1 className="mt-2 text-2xl font-black text-foreground">Payment failed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {message || "Your payment could not be completed. No amount was confirmed."}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => navigate("/customer/booking-history")}
            className="w-full rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            Booking history
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
