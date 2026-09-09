import React from "react";
import QRCode from "react-qr-code";
import { QrCode, ShieldCheck, CheckCircle2, Clock, Sparkles, Navigation } from "lucide-react";

interface Props {
  value: string;
  bookingId: number | string;
  bookingStatus: string;
  actualPickupTime?: string;
  actualReturnTime?: string;
  onOpenDirections?: () => void;
}

const BookingQRCode = ({
  value,
  bookingId,
  bookingStatus,
  actualPickupTime,
  actualReturnTime,
  onOpenDirections,
}: Props) => {
  const isDataUri = value?.startsWith("data:");

  const formatTimeAMPM = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  const formattedPickup = formatTimeAMPM(actualPickupTime);
  const formattedReturn = formatTimeAMPM(actualReturnTime);

  const getStatusBadge = () => {
    switch (bookingStatus) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-500",
          text: "COMPLETED",
        };
      case "ACTIVE":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          dot: "bg-blue-500 animate-pulse",
          text: "ACTIVE RIDE",
        };
      case "CONFIRMED":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          dot: "bg-amber-500",
          text: "CONFIRMED",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          dot: "bg-rose-500",
          text: "CANCELLED",
        };
      default:
        return {
          bg: "bg-primary/10 text-primary border-primary/20",
          dot: "bg-primary",
          text: bookingStatus,
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl p-6 sm:p-7 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">Digital Pass</h3>
            <span className="text-[11px] font-mono font-semibold text-muted-foreground">REF: BK-{bookingId}</span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusStyle.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.text}
        </span>
      </div>

      {/* QR Code Presentation Box with Reticle Viewfinder Corners */}
      <div className="relative my-4 sm:my-5 flex-1 min-h-[220px] p-5 rounded-2xl bg-gradient-to-b from-background via-muted/10 to-muted/20 border border-border/60 flex items-center justify-center overflow-hidden">
        {/* Reticle Viewfinder Corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/70 rounded-tl-sm" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/70 rounded-tr-sm" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/70 rounded-bl-sm" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/70 rounded-br-sm" />

        <div className="p-3.5 bg-white rounded-2xl shadow-sm flex items-center justify-center">
          {isDataUri ? (
            <img src={value} alt={`Booking QR Code #${bookingId}`} className="w-44 h-44 sm:w-52 sm:h-52 object-contain" />
          ) : (
            (() => {
              const QRCodeComponent = (QRCode as any).default || QRCode;
              return <QRCodeComponent value={value || ""} size={190} />;
            })()
          )}
        </div>
      </div>

      {/* Action: Directions to Bike button under QR */}
      {onOpenDirections && (
        <button
          type="button"
          onClick={onOpenDirections}
          className="mb-3.5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md cursor-pointer ring-2 ring-emerald-500/20"
        >
          <Navigation className="w-4 h-4" />
          <span>Directions to Accepted Bike</span>
        </button>
      )}

      {/* Status Specific Guidance Note */}
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs text-muted-foreground leading-relaxed text-center flex items-center justify-center min-h-[48px]">
        {bookingStatus === "CONFIRMED" && (
          <div className="flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Show this QR to the owner at pickup to unlock the ride.</span>
          </div>
        )}
        {bookingStatus === "ACTIVE" && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Ride Active {formattedPickup ? `(Started at ${formattedPickup})` : ""}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Present this same pass to the owner when returning the bike.</p>
          </div>
        )}
        {bookingStatus === "COMPLETED" && (
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Ride Completed {formattedReturn ? `at ${formattedReturn}` : ""}</span>
          </div>
        )}
        {bookingStatus !== "CONFIRMED" && bookingStatus !== "ACTIVE" && bookingStatus !== "COMPLETED" && (
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Keep your QR pass ready for ride verification.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingQRCode;