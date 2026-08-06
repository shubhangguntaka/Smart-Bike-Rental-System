import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Calendar, Clock, CreditCard, ChevronRight, Eye, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_BOOKINGS = [
  { id: "BR-9081", bikeName: "VoltPulse Electric S1", date: "2026-08-01", time: "14:00 - 17:00", cost: 600, status: "completed", type: "electric", location: "Indiranagar Hub" },
  { id: "BR-8711", bikeName: "AeroRoad Elite Carbon", date: "2026-07-28", time: "09:00 - 12:00", cost: 450, status: "completed", type: "road", location: "Koramangala Hub" },
  { id: "BR-9402", bikeName: "SummitCrusher Trail XT", date: "2026-08-02", time: "18:00 - 20:00", cost: 360, status: "active", type: "mountain", location: "Whitefield Hub" },
];

export default function CustomerBookings() {
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_BOOKINGS[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = MOCK_BOOKINGS.filter((b) =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.bikeName.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  const handleOpenDetails = (booking: typeof MOCK_BOOKINGS[0]) => {
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
        {paginated.length > 0 ? (
          paginated.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground font-mono">{booking.id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      booking.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight">{booking.bikeName}</h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{booking.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                <div>
                  <span className="text-lg font-black text-foreground">₹{booking.cost}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold">Total Paid</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDetails(booking)}
                  className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/25"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
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
                  <p className="font-bold text-sm text-foreground font-mono">{selectedBooking.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold">Status</p>
                  <span className="text-xs font-bold text-green-500 capitalize">{selectedBooking.status}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Model</span>
                  <span className="text-foreground font-bold">{selectedBooking.bikeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Category</span>
                  <span className="text-foreground font-bold capitalize">{selectedBooking.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Hub Location</span>
                  <span className="text-foreground font-bold">{selectedBooking.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Date</span>
                  <span className="text-foreground font-bold">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration Session</span>
                  <span className="text-foreground font-bold">{selectedBooking.time}</span>
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
                  <p className="text-base font-black text-foreground">₹{selectedBooking.cost}</p>
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
