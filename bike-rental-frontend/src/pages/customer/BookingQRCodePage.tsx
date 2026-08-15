import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bike, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  AlertCircle,
  RotateCw
} from "lucide-react";
import BookingQRCode from "../../components/booking/BookingQRCode";
import { BookingService } from "../../services/bookingService";
import type { Booking } from "../../types/booking";

const BookingQRCodeComponent = (BookingQRCode as any).default || BookingQRCode;

const BookingQRCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (dateStr?: string) => {
    try {
      if (!dateStr) return { date: "—", time: "—" };
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { date: dateStr, time: "—" };
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const dateFormatted = `${day} ${month} ${year}`;
      
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeFormatted = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
      
      return { date: dateFormatted, time: timeFormatted };
    } catch {
      return { date: dateStr || "—", time: "—" };
    }
  };

  const loadBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await BookingService.getBookingById(Number(id));
      setBooking(data);
    } catch (err: any) {
      setError(err.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/customer/bookings")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/80 text-foreground text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span>Back to Bookings</span>
          </button>

          <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            Verification Pass
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-card/80 border border-border/70 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-semibold text-muted-foreground">Loading your digital booking pass...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-3xl p-6 flex flex-col items-center text-center space-y-3 shadow-lg">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={loadBooking}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : !booking ? (
          <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-2">
            <p className="text-sm font-bold text-foreground">Booking not found.</p>
            <p className="text-xs text-muted-foreground">The requested reservation does not exist or you lack permission to view it.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title Section */}
            <div className="text-center space-y-1 pb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Your Digital Booking Pass</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Present this single pass for both vehicle collection and return.</p>
            </div>

            {/* Equal Side-by-Side Grid Layout (50% / 50% width and matching height) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: QR Code Presentation (50%) */}
              <div className="w-full flex">
                <BookingQRCodeComponent
                  value={booking.qrCode || `BOOKING-REF: BK-${booking.bookingId}`}
                  bookingId={booking.bookingId}
                  bookingStatus={booking.bookingStatus}
                  actualPickupTime={booking.actualPickupTime}
                  actualReturnTime={booking.actualReturnTime}
                />
              </div>

              {/* Right Column: Summary of Booking Card (50%) */}
              <div className="w-full flex flex-col justify-between bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl p-6 sm:p-7 space-y-5 transition-all">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-foreground tracking-tight">Summary of Booking</h2>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
                      REF: BK-{booking.bookingId}
                    </span>
                  </div>

                  {/* Vehicle & Specs Quick Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Assigned Vehicle</span>
                        <h3 className="text-sm font-extrabold text-foreground">{booking.bikeName || `Bike #${booking.bikeId}`}</h3>
                      </div>
                    </div>

                    {booking.registrationNumber && (
                      <div className="self-stretch sm:self-auto flex items-center sm:justify-end">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-primary/30 rounded-xl text-xs font-mono font-black text-primary shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          {booking.registrationNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Grid of Key Timestamps and Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {/* Scheduled Pickup */}
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        Scheduled Pickup
                      </span>
                      <div className="font-bold text-foreground">
                        {formatDateTime(booking.startTime).date}, <span className="text-primary">{formatDateTime(booking.startTime).time}</span>
                      </div>
                    </div>

                    {/* Scheduled Return */}
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        Scheduled Return
                      </span>
                      <div className="font-bold text-foreground">
                        {formatDateTime(booking.returnTime).date}, <span className="text-primary">{formatDateTime(booking.returnTime).time}</span>
                      </div>
                    </div>

                    {/* Actual Pickup (if recorded) */}
                    {booking.actualPickupTime && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Actual Pickup Time
                        </span>
                        <div className="font-bold text-emerald-700 dark:text-emerald-300">
                          {formatDateTime(booking.actualPickupTime).date}, {formatDateTime(booking.actualPickupTime).time}
                        </div>
                      </div>
                    )}

                    {/* Actual Return (if recorded) */}
                    {booking.actualReturnTime && (
                      <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Actual Return Time
                        </span>
                        <div className="font-bold text-blue-700 dark:text-blue-300">
                          {formatDateTime(booking.actualReturnTime).date}, {formatDateTime(booking.actualReturnTime).time}
                        </div>
                      </div>
                    )}

                    {/* Payment & Charges */}
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-muted-foreground" />
                        Rental Total
                      </span>
                      <div className="font-extrabold text-foreground text-sm">
                        ₹{booking.rentalAmount || booking.totalAmount || 0}
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Booking Lifecycle State */}
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-muted-foreground" />
                        Booking Status
                      </span>
                      <div className="font-bold text-foreground">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-black">
                          {booking.bookingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Lifecycle Banner Note */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    {booking.bookingStatus === "COMPLETED" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : booking.bookingStatus === "ACTIVE" ? (
                      <Bike className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground/90 leading-relaxed">
                    {booking.bookingStatus === "CONFIRMED" && "Show this QR code to the bike owner when collecting the vehicle to begin your journey."}
                    {booking.bookingStatus === "ACTIVE" && `Bike handed over at ${formatDateTime(booking.actualPickupTime || "").time}. Present this same pass to return the bike.`}
                    {booking.bookingStatus === "COMPLETED" && `Bike returned at ${formatDateTime(booking.actualReturnTime || "").time}. Rental completed successfully.`}
                    {booking.bookingStatus !== "CONFIRMED" && booking.bookingStatus !== "ACTIVE" && booking.bookingStatus !== "COMPLETED" && "Keep this booking pass ready for validation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingQRCodePage;
