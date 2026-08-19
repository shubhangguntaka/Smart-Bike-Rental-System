import React from "react";
import { Bike, MapPin } from "lucide-react";

import type { BikeAdmin } from "@/types/admin";

interface BikeTableProps {
  bikes: BikeAdmin[];
  loading?: boolean;
  onStatusAction: (bike: BikeAdmin) => void;
}

export default function BikeTable({
  bikes,
  loading = false,
  onStatusAction,
}: BikeTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs text-muted-foreground">
          Loading bikes...
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
              <th className="p-4">Bike</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Registration</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {bikes.length > 0 ? (
              bikes.map((bike) => {
                const status =
                  bike.bikeStatus?.toUpperCase() ?? "UNKNOWN";

                const canDeactivate = status === "AVAILABLE";
                const canActivate = status === "NOT_AVAILABLE";
                const canChangeStatus =
                  canDeactivate || canActivate;

                return (
                  <tr
                    key={bike.bikeId}
                    className="border-b border-border last:border-0 hover:bg-muted/10"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Bike className="h-4 w-4 text-primary" />

                        <div>
                          <p className="font-bold">
                            {bike.bikeName ||
                              `${bike.brand || ""} ${bike.model || ""
                                }`.trim() ||
                              `Bike #${bike.bikeId}`}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {bike.category || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {bike.ownerName ||
                        `Owner #${bike.ownerId ?? "—"}`}
                    </td>

                    <td className="p-4 font-mono text-muted-foreground">
                      {bike.registrationNumber || "—"}
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {bike.location || "—"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${status === "AVAILABLE"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-destructive/10 text-destructive"
                          }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {canChangeStatus ? (
                        <button
                          type="button"
                          onClick={() => {
                            console.log(
                              "[Admin Bikes] Status action clicked:",
                              {
                                bikeId: bike.bikeId,
                                status,
                              }
                            );

                            onStatusAction(bike);
                          }}
                          className={`rounded-xl border border-border px-3 py-2 text-[10px] font-semibold transition ${canDeactivate
                              ? "text-destructive hover:border-destructive"
                              : "text-green-500 hover:border-green-500"
                            }`}
                        >
                          {canDeactivate ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {status === "BOOKED"
                            ? "Currently Booked"
                            : status === "UNDER_MAINTENANCE"
                              ? "Maintenance"
                              : "No Action"}
                        </span>
                      )}
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
                  No bikes matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}