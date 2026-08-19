import React from "react";

import {
  BadgeCheck,
  Bike,
  CalendarCheck,
  Eye,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import type { OwnerAdmin } from "@/types/admin";

interface OwnerTableProps {
  owners: OwnerAdmin[];
  loading?: boolean;
  onViewDetails?: (owner: OwnerAdmin) => void;
}

export default function OwnerTable({
  owners,
  loading = false,
  onViewDetails,
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
              <th className="p-4">Account</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Fleet</th>
              <th className="p-4">Bookings</th>
              <th className="p-4">Earnings</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {owners.length > 0 ? (
              owners.map((owner) => {
                const isActive =
                  owner.status?.toUpperCase() ===
                  "ACTIVE";

                return (
                  <tr
                    key={owner.ownerId}
                    className="border-b border-border last:border-0 hover:bg-muted/10"
                  >
                    {/* Owner */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                          {owner.profileImage ? (
                            <img
                              src={owner.profileImage}
                              alt={
                                owner.ownerName ||
                                "Owner"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            {owner.ownerName ||
                              "Unknown Owner"}
                          </p>

                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Owner ID #
                            {owner.ownerId}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Mail className="h-3 w-3" />

                            {owner.email || "—"}
                          </p>

                          {owner.phoneNumber && (
                            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Phone className="h-3 w-3" />

                              {owner.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                          isActive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${
                          owner.verificationStatus
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        <BadgeCheck className="h-3 w-3" />

                        {owner.verificationStatus
                          ? "VERIFIED"
                          : "PENDING"}
                      </span>
                    </td>

                    {/* Fleet */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Bike className="h-3.5 w-3.5 text-primary" />

                        {owner.totalBikes ?? 0}
                      </span>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Bikes
                      </p>
                    </td>

                    {/* Bookings */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <CalendarCheck className="h-3.5 w-3.5 text-primary" />

                        {owner.totalBookings ?? 0}
                      </span>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Total bookings
                      </p>
                    </td>

                    {/* Earnings */}
                    <td className="p-4">
                      <p className="font-bold text-foreground">
                        ₹
                        {Number(
                          owner.totalEarnings ?? 0
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Total earnings
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={() => onViewDetails(owner)}
                          className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer"
                          title="View owner details"
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