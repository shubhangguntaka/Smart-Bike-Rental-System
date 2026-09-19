import React from "react";
import {
  BadgeCheck,
  CalendarCheck,
  CircleX,
  Eye,
  Mail,
  Phone,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

import type { CustomerAdmin } from "@/types/admin";

interface CustomerTableProps {
  customers: CustomerAdmin[];
  loading?: boolean;
  onStatusAction?: (customer: CustomerAdmin) => void;
  onViewDetails?: (customer: CustomerAdmin) => void;
}

export default function CustomerTable({
  customers,
  loading = false,
  onStatusAction,
  onViewDetails,
}: CustomerTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading customers...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[650px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">Customer</th>
              <th className="p-4">Account</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Bookings</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => {
                const isActive =
                  customer.status?.toUpperCase() === "ACTIVE";

                return (
                  <tr
                    key={customer.customerId}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                          {customer.profileImage ? (
                            <img
                              src={customer.profileImage}
                              alt={customer.customerName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            {customer.customerName || "Unknown Customer"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            ID #{customer.customerId}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <Mail className="h-3 w-3" />
                            {customer.email || "—"}
                          </p>

                          {customer.phoneNumber && (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.phoneNumber}
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
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            customer.verificationStatus
                              ? "bg-green-500/10 text-green-500"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          <BadgeCheck className="h-3 w-3" />
                          {customer.verificationStatus ? "VERIFIED" : "PENDING / UNVERIFIED"}
                        </span>

                        <p className="text-[10px] text-muted-foreground">
                          KYC Review
                        </p>
                      </div>
                    </td>

                    {/* Bookings */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                          {customer.totalBookings ?? 0} total
                        </span>

                        <div className="flex gap-2 text-[10px]">
                          <span className="text-green-500 font-medium">
                            {customer.completedBookings ?? 0} completed
                          </span>
                          <span className="text-destructive font-medium">
                            {customer.cancelledBookings ?? 0} cancelled
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Rental Amount */}
                    <td className="p-4">
                      <p className="font-bold text-foreground">
                        ₹
                        {Number(customer.totalRentalAmount ?? 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Total spent
                      </p>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {onViewDetails && (
                          <button
                            type="button"
                            onClick={() => onViewDetails(customer)}
                            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                            title="View customer summary"
                            aria-label="View customer summary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onStatusAction?.(customer)}
                          className={`rounded-xl border border-border p-2 transition cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
                            isActive
                              ? "text-destructive hover:border-destructive hover:bg-destructive/5"
                              : "text-green-500 hover:border-green-500 hover:bg-green-500/5"
                          }`}
                          title={
                            isActive
                              ? "Deactivate customer"
                              : "Activate customer"
                          }
                          aria-label={
                            isActive
                              ? "Deactivate customer"
                              : "Activate customer"
                          }
                        >
                          {isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  <CircleX className="mx-auto mb-2 h-5 w-5" />
                  No customers matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}