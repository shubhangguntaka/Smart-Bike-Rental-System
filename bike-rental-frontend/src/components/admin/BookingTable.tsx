import React from "react";
import { CalendarCheck, Eye } from "lucide-react";

import type { BookingAdmin } from "@/types/admin";

interface BookingTableProps {
  bookings: BookingAdmin[];
  loading?: boolean;
  onViewDetails?: (booking: BookingAdmin) => void;
}

export default function BookingTable({
  bookings,
  loading = false,
  onViewDetails,
}: BookingTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">Booking</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Bike</th>
              <th className="p-4">Booking Status</th>
              <th className="p-4">Payment Status</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const bStatus = booking.bookingStatus?.toUpperCase();
                const pStatus = booking.paymentStatus?.toUpperCase();

                return (
                  <tr
                    key={booking.bookingId}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-bold text-foreground">
                            #{booking.bookingId}
                          </p>
                          {booking.bookingReference && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {booking.bookingReference}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {booking.customerName ||
                        `Customer #${booking.customerId ?? "—"}`}
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {booking.ownerName ||
                        `Owner #${booking.ownerId ?? "—"}`}
                    </td>

                    <td className="p-4 text-muted-foreground font-medium">
                      {booking.bikeName ||
                        `Bike #${booking.bikeId ?? "—"}`}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          bStatus === "COMPLETED"
                            ? "bg-green-500/10 text-green-500"
                            : bStatus === "CONFIRMED" || bStatus === "ACTIVE"
                            ? "bg-primary/10 text-primary"
                            : bStatus === "PENDING"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {booking.bookingStatus || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          pStatus === "SUCCESS" || pStatus === "PAID"
                            ? "bg-green-500/10 text-green-500"
                            : pStatus === "PENDING"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {booking.paymentStatus || "PENDING"}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-foreground">
                      ₹
                      {Number(
                        booking.totalAmount ??
                          booking.rentalAmount ??
                          0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-4 text-right">
                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={() => onViewDetails(booking)}
                          className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer"
                          title="View booking summary"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-muted-foreground"
                >
                  No bookings matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}