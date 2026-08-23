import React, { useState, useEffect, useCallback } from "react";
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
  RotateCw,
  Play,
  Pause,
  Square,
  MapPin,
  Compass,
  Radio,
  ExternalLink
} from "lucide-react";
import BookingQRCode from "../../components/booking/BookingQRCode";
import { BookingService } from "../../services/bookingService";
import { gpsService } from "../../services/gpsService";
import { useRideTracking } from "../../hooks/useRideTracking";
import useAuth from "../../hooks/useAuth";
import type { Booking } from "../../types/booking";

const BookingQRCodeComponent = (BookingQRCode as any).default || BookingQRCode;

const BookingQRCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const customerId = user?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const {
    ride,
    locations,
    currentLocation,
    isStarting,
    isEnding,
    isTracking,
    error: gpsError,
    permissionDenied,
    startRide,
    endRide,
    pauseRide,
    resumeRide,
    startTracking,
    stopTracking,
    restoreActiveRide,
  } = useRideTracking();

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

  const loadBookingAndRide = useCallback(async (isQuiet = false) => {
    if (!id) return;
    try {
      if (!isQuiet) {
        setLoading(true);
        setError(null);
      }
      const data = await BookingService.getBookingById(Number(id));
      setBooking(data);

      // Check if ride already exists for this booking
      if (data?.bookingId) {
        try {
          const rideRes = await gpsService.getRideByBookingId(data.bookingId);
          if (rideRes.data) {
            await restoreActiveRide(rideRes.data);
          }
        } catch {
          // No ride created yet for this booking
        }
      }
    } catch (err: any) {
      if (!isQuiet) {
        setError(err.message || "Failed to load booking details.");
      }
    } finally {
      if (!isQuiet) {
        setLoading(false);
      }
    }
  }, [id, restoreActiveRide]);

  useEffect(() => {
    loadBookingAndRide();
  }, [loadBookingAndRide]);

  // Polling for owner return scan when booking is active
  useEffect(() => {
    if (!booking || booking.bookingStatus !== "ACTIVE") return;

    const interval = setInterval(() => {
      loadBookingAndRide(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [booking?.bookingStatus, loadBookingAndRide]);

  // Handle Start / Resume Tracking
  const handleStartOrResume = async () => {
    if (!booking) return;

    if (ride?.rideId && (ride.status === "PAUSED" || ride.status === "ACTIVE")) {
      // Resume ride on backend (intimating owner) and resume browser GPS tracking
      await resumeRide();
      return;
    }

    if (customerId) {
      // Start a new ride session with backend
      await startRide(booking.bookingId, booking.bikeId, customerId);
    }
  };

  // Handle Pause Tracking
  const handlePauseTracking = async () => {
    if (ride?.rideId) {
      // Pause ride on backend (intimating owner) and halt browser GPS tracking
      await pauseRide();
    } else {
      stopTracking();
    }
  };

  // Handle Stop / Return Click
  const handleStopClick = async () => {
    // Automatically pause tracking and display owner return scan modal
    await handlePauseTracking();
    setShowEndConfirm(true);
  };

  const isRideActive = ride?.status === "ACTIVE" || ride?.status === "PAUSED" || booking?.bookingStatus === "ACTIVE";

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
              onClick={() => loadBookingAndRide()}
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

            {/* GPS Telemetry & Ride Action Controls Bar (Active Booking) */}
            {isRideActive && (
              <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isTracking 
                        ? "bg-emerald-500/15 text-emerald-500 ring-2 ring-emerald-500/20 animate-pulse"
                        : "bg-amber-500/15 text-amber-500"
                    }`}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">Live GPS Ride Telemetry</h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isTracking
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : ride?.status === "ACTIVE"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {isTracking ? "● Tracking Active" : ride?.status === "ACTIVE" ? "⏸ Tracking Paused" : "Ready"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isTracking 
                          ? "Broadcasting real-time vehicle GPS coordinates to server."
                          : "Location broadcasting is paused. Click Start to resume."}
                      </p>
                    </div>
                  </div>

                  {/* Navigation shortcut to full Live GPS Page */}
                  <button
                    type="button"
                    onClick={() => navigate("/customer/live-gps")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Open Live Map</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                </div>

                {/* GPS Errors or Permission Warnings */}
                {permissionDenied && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Location access denied. Please grant location permissions in your browser to broadcast GPS.</span>
                  </div>
                )}
                {gpsError && !permissionDenied && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{gpsError}</span>
                  </div>
                )}

                {/* Quick Telemetry Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Latitude</span>
                    <span className="font-mono font-bold text-foreground">
                      {currentLocation?.latitude ? currentLocation.latitude.toFixed(5) : "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Longitude</span>
                    <span className="font-mono font-bold text-foreground">
                      {currentLocation?.longitude ? currentLocation.longitude.toFixed(5) : "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">GPS Accuracy</span>
                    <span className="font-bold text-foreground">
                      {currentLocation?.accuracy != null ? `±${Math.round(currentLocation.accuracy)} m` : "—"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Checkpoints</span>
                    <span className="font-bold text-primary">
                      {locations.length} points
                    </span>
                  </div>
                </div>

                {/* Location Action Buttons: Start, Pause, Stop */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* Start / Resume Button */}
                  <button
                    type="button"
                    disabled={isTracking || isStarting}
                    onClick={handleStartOrResume}
                    className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                      !isTracking
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isStarting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>{ride?.status === "ACTIVE" ? "Resume Tracking" : "Start Tracking"}</span>
                  </button>

                  {/* Pause Button */}
                  <button
                    type="button"
                    disabled={!isTracking}
                    onClick={handlePauseTracking}
                    className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                      isTracking
                        ? "bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-500/20"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Tracking</span>
                  </button>

                  {/* Stop / Return Vehicle Button */}
                  <button
                    type="button"
                    disabled={!booking || booking.bookingStatus !== "ACTIVE"}
                    onClick={handleStopClick}
                    className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                      booking?.bookingStatus === "ACTIVE"
                        ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-500/20"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop / Return Bike</span>
                  </button>
                </div>
              </div>
            )}

            {/* Return Verification Modal */}
            {showEndConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Return Verification Required</h3>
                      <p className="text-xs text-muted-foreground">Owner scan required to stop and complete rental</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-2">
                    <p className="font-semibold">
                      To complete the return and stop your ride session:
                    </p>
                    <p className="leading-relaxed">
                      Please return the bike to the owner and present the <strong>Booking QR Code</strong> on this page. Once the owner scans and verifies the vehicle condition, your ride will officially end.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Awaiting owner return scan...</span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowEndConfirm(false)}
                      className="w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Show QR Code to Owner
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    {booking.bookingStatus === "ACTIVE" && `Bike handed over at ${formatDateTime(booking.actualPickupTime || "").time}. Use the controls above to manage live GPS tracking.`}
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

