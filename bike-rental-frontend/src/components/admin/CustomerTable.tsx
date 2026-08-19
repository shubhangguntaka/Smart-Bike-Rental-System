import React from "react";
import {
  BadgeCheck,
  CalendarCheck,
  CircleX,
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
  onStatusAction?: (
    customer: CustomerAdmin
  ) => void;
}

export default function CustomerTable({
  customers,
  loading = false,
  onStatusAction,
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 font-semibold text-muted-foreground">
              <th className="p-4">
                Customer
              </th>

              <th className="p-4">
                Account
              </th>

              <th className="p-4">
                Verification
              </th>

              <th className="p-4">
                Bookings
              </th>

              <th className="p-4">
                Rental Amount
              </th>

              <th className="p-4 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.length > 0 ? (
              customers.map(
                (customer) => {
                  const isActive =
                    customer.status?.toUpperCase() ===
                    "ACTIVE";

                  return (
                    <tr
                      key={
                        customer.customerId
                      }
                      className="border-b border-border last:border-0 hover:bg-muted/10"
                    >
                      {/* Customer */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                            {customer.profileImage ? (
                              <img
                                src={
                                  customer.profileImage
                                }
                                alt={
                                  customer.customerName
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4" />
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-foreground">
                              {customer.customerName ||
                                "Unknown Customer"}
                            </p>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              ID #
                              {
                                customer.customerId
                              }
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Mail className="h-3 w-3" />

                              {customer.email ||
                                "—"}
                            </p>

                            {customer.phoneNumber && (
                              <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Phone className="h-3 w-3" />

                                {
                                  customer.phoneNumber
                                }
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
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${
                              customer.verificationStatus
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-600"
                            }`}
                          >
                            <BadgeCheck className="h-3 w-3" />

                            {customer.verificationStatus
                              ? "VERIFIED"
                              : "NOT VERIFIED"}
                          </span>

                          <p className="text-[10px] text-muted-foreground">
                            Aadhaar + Driving
                            License
                          </p>
                        </div>
                      </td>

                      {/* Bookings */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <CalendarCheck className="h-3.5 w-3.5 text-primary" />

                            {
                              customer.totalBookings
                            }{" "}
                            total
                          </span>

                          <div className="flex gap-2 text-[10px]">
                            <span className="text-green-500">
                              {
                                customer.completedBookings
                              }{" "}
                              completed
                            </span>

                            <span className="text-destructive">
                              {
                                customer.cancelledBookings
                              }{" "}
                              cancelled
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rental Amount */}
                      <td className="p-4">
                        <p className="font-bold">
                          ₹
                          {Number(
                            customer.totalRentalAmount ??
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          Rental amount
                        </p>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onStatusAction?.(
                              customer
                            )
                          }
                          className={`rounded-xl border border-border p-2 transition ${
                            isActive
                              ? "text-destructive hover:border-destructive hover:bg-destructive/5"
                              : "text-green-500 hover:border-green-500 hover:bg-green-500/5"
                          }`}
                          title={
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
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  <CircleX className="mx-auto mb-2 h-5 w-5" />

                  No customers matching
                  criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}