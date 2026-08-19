import React from "react";
import { Bike, Eye, MapPin } from "lucide-react";

import type { BikeAdmin } from "@/types/admin";

interface BikeTableProps {
  bikes: BikeAdmin[];
  loading?: boolean;
  onStatusAction: (bike: BikeAdmin) => void;
  onViewDetails?: (bike: BikeAdmin) => void;
}

export default function BikeTable({
  bikes,
  loading = false,
  onStatusAction,
  onViewDetails,
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
              <th className="p-4">Rental Rate</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
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
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary border border-border">
                          {bike.imageUrl ? (
                            <img
                              src={bike.imageUrl}
                              alt={bike.bikeName || "Bike"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Bike className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            {bike.bikeName ||
                              `${bike.brand || ""} ${bike.model || ""}`.trim() ||
                              `Bike #${bike.bikeId}`}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {bike.category || "Standard"} • ID #{bike.bikeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {bike.ownerName || `Owner #${bike.ownerId ?? "—"}`}
                    </td>

                    <td className="p-4 font-mono text-muted-foreground">
                      {bike.registrationNumber || "—"}
                    </td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {bike.location || "—"}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-foreground">
                      {bike.hourlyRate != null ? (
                        <>₹{bike.hourlyRate}/hr</>
                      ) : bike.rentalPrice != null ? (
                        <>₹{bike.rentalPrice}/day</>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          status === "AVAILABLE"
                            ? "bg-green-500/10 text-green-500"
                            : status === "BOOKED"
                            ? "bg-primary/10 text-primary"
                            : status === "UNDER_MAINTENANCE"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {onViewDetails && (
                          <button
                            type="button"
                            onClick={() => onViewDetails(bike)}
                            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer"
                            title="View bike details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {canChangeStatus ? (
                          <button
                            type="button"
                            onClick={() => onStatusAction(bike)}
                            className={`rounded-xl border border-border px-3 py-1.5 text-[10px] font-semibold transition cursor-pointer ${
                              canDeactivate
                                ? "text-destructive hover:border-destructive hover:bg-destructive/5"
                                : "text-green-500 hover:border-green-500 hover:bg-green-500/5"
                            }`}
                          >
                            {canDeactivate ? "Deactivate" : "Activate"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground px-2 py-1 bg-muted/40 rounded-lg">
                            {status === "BOOKED"
                              ? "In Rental"
                              : status === "UNDER_MAINTENANCE"
                              ? "Maintenance"
                              : "Locked"}
                          </span>
                        )}
                      </div>
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