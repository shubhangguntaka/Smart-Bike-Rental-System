import React, { useEffect, useMemo, useState } from "react";
import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import toast from "react-hot-toast";

import BikeTable from "@/components/admin/BikeTable";
import StatusActionModal from "@/components/admin/StatusActionModal";

import adminService from "@/services/adminService";
import type {
  AdminBikeStatus,
  BikeAdmin,
} from "@/types/admin";

const PAGE_SIZE = 5;

const FILTER_CONFIGS: FilterField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Available", value: "AVAILABLE" },
      { label: "Booked", value: "BOOKED" },
      {
        label: "Under Maintenance",
        value: "UNDER_MAINTENANCE",
      },
      {
        label: "Not Available",
        value: "NOT_AVAILABLE",
      },
    ],
  },
];

export default function AdminBikes() {
  const [bikes, setBikes] = useState<BikeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [actionBike, setActionBike] =
    useState<BikeAdmin | null>(null);

  const loadBikes = async () => {
    try {
      setLoading(true);

      const data = await adminService.getBikes();

      setBikes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load admin bikes:",
        error
      );

      setBikes([]);
      toast.error("Unable to load bikes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBikes();
  }, []);

  const filteredBikes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bikes.filter((bike) => {
      if (query) {
        const searchable = [
          bike.bikeName,
          bike.brand,
          bike.model,
          bike.registrationNumber,
          bike.ownerName,
          bike.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      if (
        filters.status &&
        bike.bikeStatus?.toUpperCase() !==
        String(filters.status).toUpperCase()
      ) {
        return false;
      }

      return true;
    });
  }, [bikes, search, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBikes.length / PAGE_SIZE)
  );

  const paginatedBikes = filteredBikes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusAction = async () => {
    if (!actionBike) {
      return;
    }

    const bikeId = actionBike.bikeId;

    const currentStatus =
      actionBike.bikeStatus?.toUpperCase();

    let nextStatus: AdminBikeStatus;

    if (currentStatus === "AVAILABLE") {
      nextStatus = "NOT_AVAILABLE";
    } else if (currentStatus === "NOT_AVAILABLE") {
      nextStatus = "AVAILABLE";
    } else {
      throw new Error(
        `Bike with status ${currentStatus} cannot be activated or deactivated.`
      );
    }

    try {
      setActionLoading(true);

      console.log("[Admin Bikes] Sending status update:", {
        bikeId,
        currentStatus,
        nextStatus,
      });

      await adminService.updateBikeStatus(
        bikeId,
        nextStatus
      );

      console.log(
        "[Admin Bikes] Status update API succeeded."
      );

      /*
       * IMPORTANT:
       * Don't manually change the row.
       * Reload from the backend so the UI represents
       * the value actually persisted in MySQL.
       */
      await loadBikes();

      toast.success(
        nextStatus === "AVAILABLE"
          ? "Bike activated successfully."
          : "Bike deactivated successfully."
      );

      setActionBike(null);
    } catch (error: any) {
      console.error(
        "[Admin Bikes] Status update failed:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update bike status.";

      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const bikeIsAvailable =
    actionBike?.bikeStatus?.toUpperCase() === "AVAILABLE";

  return (
    <div className="min-h-screen space-y-6 text-foreground">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          Global Fleet Control
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Monitor and manage bike status across the rental
          platform.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search bikes, owners, registration..."
          width="max-w-md w-full"
        />

        <FilterBar
          filters={FILTER_CONFIGS}
          value={filters}
          onChange={(value) => {
            setFilters(value);
            setPage(1);
          }}
          onClearAll={() => {
            setFilters({});
            setPage(1);
          }}
        />
      </div>

      <BikeTable
        bikes={paginatedBikes}
        loading={loading}
        onStatusAction={setActionBike}
      />

      {filteredBikes.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      <StatusActionModal
        isOpen={!!actionBike}
        title={
          bikeIsAvailable
            ? "Deactivate Bike"
            : "Activate Bike"
        }
        description={
          actionBike
            ? bikeIsAvailable
              ? `This will change ${actionBike.bikeName ||
              `Bike #${actionBike.bikeId}`
              } to inactive.`
              : `This will activate ${actionBike.bikeName ||
              `Bike #${actionBike.bikeId}`
              }.`
            : ""
        }
        actionLabel={
          bikeIsAvailable
            ? "Yes, Make Unavailable"
            : "Yes, Make Available"
        }
        actionType={
          bikeIsAvailable
            ? "danger"
            : "success"
        }
        loading={actionLoading}
        onClose={() => setActionBike(null)}
        onConfirm={() => {
          void handleStatusAction();
        }}
      />
    </div>
  );
}