import React from "react";
import { UserRound } from "lucide-react";

import type { OwnerAdmin } from "@/types/admin";

interface OwnerTableProps {
  owners: OwnerAdmin[];
  loading?: boolean;
}

export default function OwnerTable({
  owners,
  loading = false,
}: OwnerTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading owners...
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
              <th className="p-4">Owner</th>
              <th className="p-4">Email</th>
              <th className="p-4">Bikes</th>
              <th className="p-4">Bookings</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {owners.length > 0 ? (
              owners.map((owner) => (
                <tr
                  key={owner.ownerId}
                  className="border-b border-border last:border-0 hover:bg-muted/10"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="font-bold">
                          {owner.ownerName || "Unknown Owner"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ID #{owner.ownerId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-muted-foreground">
                    {owner.email || "—"}
                  </td>

                  <td className="p-4 font-semibold">
                    {owner.totalBikes ?? 0}
                  </td>

                  <td className="p-4 font-semibold">
                    {owner.totalBookings ?? 0}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        owner.verificationStatus
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {owner.verificationStatus
                        ? "VERIFIED"
                        : "PENDING"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {owner.status || "ACTIVE"}
                    </span>
                  </td>

                  <td className="p-4 text-right font-bold">
                    ₹
                    {Number(
                      owner.totalEarnings ?? 0
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
                  No owners matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}