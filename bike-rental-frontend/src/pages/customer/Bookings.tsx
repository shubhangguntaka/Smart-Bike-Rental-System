import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Calendar, Clock, CreditCard, ChevronRight, Eye, ShieldCheck, Loader2, CheckCircle2, XCircle, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { BookingService } from "@/services/bookingService";

export default function CustomerBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const renderBookingStatusBadge = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "PENDING" || s === "VERIFICATION_REQUIRED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
          <Clock className="h-3.5 w-3.5" />
          Waiting for Owner Approval
        </span>
      );
    }
    if (s === "APPROVED" || s === "CONFIRMED" || s === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Bike Booked & Confirmed
        </span>
      );
    }
    if (s === "REJECTED" || s === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
          <XCircle className="h-3.5 w-3.5" />
          Request Rejected by Owner
        </span>
      );
    }
    if (s === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ride Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border">
        {status}
      </span>
    );
  };

  const fetchCustomerBookings = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await BookingService.getCustomerBookings(Number(user.id));
      const localCustom = JSON.parse(localStorage.getItem("custom_user_bookings") || localStorage.getItem("user_bookings") || "[]");
      const mergedMap = new Map();
      (data || []).forEach((b: any) => mergedMap.set(String(b.bookingId || b.id), b));
      (localCustom || []).forEach((b: any) => {
        const key = String(b.bookingId || b.id);
        const existing = mergedMap.get(key);
        mergedMap.set(key, existing ? { ...existing, ...b } : b);
      });
      setBookings(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerBookings();
    const handleUpdate = () => fetchCustomerBookings();
    window.addEventListener("custom_bikes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener("custom_bikes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [user]);

  const filtered = bookings.filter((b) => {
    const term = search.toLowerCase();
    const bId = String(b.bookingId || b.id || "").toLowerCase();
    const name = String(b.bikeName || "").toLowerCase();
    return bId.includes(term) || name.includes(term);
  });

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  const formatDateTime = (dtStr: string) => {
    try {
      if (!dtStr) return "N/A";
      return new Date(dtStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dtStr;
    }
  };

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Your Bookings</h2>
        <p className="text-xs text-muted-foreground mt-1">Track active rentals, receipts, and history logs.</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by Booking ID or Bike..."
          width="max-w-md w-full"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading bookings...</p>
          </div>
        ) : paginated.length > 0 ? (
          paginated.map((booking) => {
            const bId = booking.bookingId || booking.id;
            const bStatus = booking.bookingStatus || booking.status || "PENDING";
            return (
              <div
                key={bId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-sm transition-all duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground font-mono">BR-{bId}</span>
                    {renderBookingStatusBadge(bStatus)}
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-tight">{booking.bikeName}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Start Time: {formatDateTime(booking.startTime || booking.pickupDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Return Time: {formatDateTime(booking.returnTime || booking.returnDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="mr-3">
                    <span className="text-lg font-black text-foreground">₹{booking.totalAmount}</span>
                    <p className="text-[10px] text-muted-foreground font-semibold">Total Paid</p>
                  </div>

                  {(bStatus === "CONFIRMED" || bStatus === "ACTIVE") && (
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/booking-qr/${bId}`)}
                      className="px-3 py-2 rounded-xl border border-primary hover:bg-primary/5 text-primary text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-1.5"
                      title="View QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>View QR</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenDetails(booking)}
                    className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/25"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card text-muted-foreground text-sm">
            No bookings found matching your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 5 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5)}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Booking Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} size="md">
        <ModalHeader onClose={() => setIsDetailsOpen(false)}>Booking Receipt</ModalHeader>
        <ModalBody>
          {selectedBooking && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Transaction ID</p>
                  <p className="font-bold text-sm text-foreground font-mono">BR-{selectedBooking.bookingId || selectedBooking.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Approval Status</p>
                  {renderBookingStatusBadge(selectedBooking.bookingStatus || selectedBooking.status)}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Model</span>
                  <span className="text-foreground font-bold">{selectedBooking.bikeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Category</span>
                  <span className="text-foreground font-bold capitalize">{selectedBooking.fuelType || "Petrol"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Hub Location</span>
                  <span className="text-foreground font-bold">{selectedBooking.location || "Main Station"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Start Time</span>
                  <span className="text-foreground font-bold">{formatDateTime(selectedBooking.startTime || selectedBooking.pickupDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Return Time</span>
                  <span className="text-foreground font-bold">{formatDateTime(selectedBooking.returnTime || selectedBooking.returnDate)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/40 flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Razorpay Secure</p>
                    <p className="text-[10px] text-muted-foreground">UPI Payment Mode</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                  <p className="text-base font-black text-foreground">₹{selectedBooking.totalAmount}</p>
                </div>
              </div>

              <div className="flex gap-2 items-center text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Live GPS location reports and IoT logs are securely archived.</span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedBooking && (selectedBooking.bookingStatus === "CONFIRMED" || selectedBooking.bookingStatus === "ACTIVE" || selectedBooking.status === "CONFIRMED" || selectedBooking.status === "ACTIVE") && (
            <button
              type="button"
              onClick={() => {
                setIsDetailsOpen(false);
                navigate(`/customer/booking-qr/${selectedBooking.bookingId || selectedBooking.id}`);
              }}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold border border-primary text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <QrCode className="h-4 w-4" />
              <span>View QR Code</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsDetailsOpen(false)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-all cursor-pointer"
          >
            Close Receipt
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
