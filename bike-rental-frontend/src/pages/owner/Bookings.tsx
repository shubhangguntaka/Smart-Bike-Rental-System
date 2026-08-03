import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { Calendar, Clock, Eye, ShieldCheck, MapPin } from "lucide-react";

const MOCK_OWNER_BOOKINGS = [
  { id: "BR-9402", bikeName: "SummitCrusher Trail XT", customerName: "Rahul Sharma", date: "2026-08-02", time: "18:00 - 20:00", revenue: 360, status: "active" },
  { id: "BR-9081", bikeName: "VoltPulse Electric S1", customerName: "Amit Kumar", date: "2026-08-01", time: "14:00 - 17:00", revenue: 600, status: "completed" },
];

export default function OwnerBookings() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof MOCK_OWNER_BOOKINGS[0] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = MOCK_OWNER_BOOKINGS.filter((b) =>
    b.bikeName.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  const handleOpen = (booking: typeof MOCK_OWNER_BOOKINGS[0]) => {
    setSelected(booking);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">Customer Bookings</h2>
        <p className="text-xs text-muted-foreground mt-1">Track active and past rental contracts for your listed fleet.</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by customer name or bike..."
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
              <div className="space-y-1.5">
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
                <h3 className="font-bold text-sm text-foreground">{booking.bikeName}</h3>
                <p className="text-xs font-medium text-muted-foreground">Renter: {booking.customerName}</p>

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
                  <span className="text-lg font-black text-foreground">₹{booking.revenue}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold">Your Revenue</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpen(booking)}
                  className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer focus:outline-none"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card text-muted-foreground text-sm">
            No booking items matched your parameters.
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

      {/* Booking details Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
        <ModalHeader onClose={() => setIsOpen(false)}>Rental Session Details</ModalHeader>
        <ModalBody>
          {selected && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Booking ID</p>
                  <p className="font-bold text-sm text-foreground font-mono">{selected.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold">Rental Session</p>
                  <span className="text-xs font-bold text-primary uppercase">{selected.status}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle Rented</span>
                  <span className="text-foreground font-bold">{selected.bikeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renter Customer</span>
                  <span className="text-foreground font-bold">{selected.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Date</span>
                  <span className="text-foreground font-bold">{selected.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration Session</span>
                  <span className="text-foreground font-bold">{selected.time}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/40 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-foreground">Earned Revenue</p>
                  <p className="text-[10px] text-muted-foreground">Transferred to Payout Ledger</p>
                </div>
                <p className="text-lg font-black text-primary">₹{selected.revenue}</p>
              </div>

              <div className="flex gap-2 items-center text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Live GPS location tracking active on this vehicle.</span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-all cursor-pointer"
          >
            Close Details
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
