import React from "react";
import { CalendarCheck } from "lucide-react";

import type { BookingAdmin } from "@/types/admin";

interface BookingTableProps {
  bookings: BookingAdmin[];
  loading?: boolean;
}

export default function BookingTable({
  bookings,
  loading = false,
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
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr
                  key={booking.bookingId}
                  className="border-b border-border last:border-0 hover:bg-muted/10"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-bold">
                          #{booking.bookingId}
                        </p>
                        {booking.bookingReference && (
                          <p className="text-[10px] text-muted-foreground">
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

                  <td className="p-4 text-muted-foreground">
                    {booking.bikeName ||
                      `Bike #${booking.bikeId ?? "—"}`}
                  </td>

                  <td className="p-4">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {booking.bookingStatus || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {booking.paymentStatus || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="p-4 text-right font-bold">
                    ₹
                    {Number(
                      booking.totalAmount ??
                        booking.rentalAmount ??
                        0
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
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