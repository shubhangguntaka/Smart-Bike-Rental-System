import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { FilterBar } from "@/components/common/FilterBar";
import type { FilterField } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import toast from "react-hot-toast";

import BookingTable from "@/components/admin/BookingTable";

import adminService from "@/services/adminService";
import type { BookingAdmin } from "@/types/admin";

const PAGE_SIZE = 5;

const FILTER_CONFIGS: FilterField[] = [
  {
    id: "status",
    label: "Booking Status",
    type: "select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Confirmed", value: "CONFIRMED" },
      { label: "Active", value: "ACTIVE" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment Status",
    type: "select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Success", value: "SUCCESS" },
      { label: "Failed", value: "FAILED" },
    ],
  },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<
    BookingAdmin[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>(
    {}
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);

        const data = await adminService.getBookings();

        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Failed to load admin bookings:",
          error
        );

        setBookings([]);
        toast.error("Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (query) {
        const searchable = [
          String(booking.bookingId),
          booking.bookingReference,
          booking.customerName,
          booking.ownerName,
          booking.bikeName,
          booking.registrationNumber,
          booking.bookingStatus,
          booking.paymentStatus,
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
        booking.bookingStatus?.toUpperCase() !==
          String(filters.status).toUpperCase()
      ) {
        return false;
      }

      if (
        filters.paymentStatus &&
        booking.paymentStatus?.toUpperCase() !==
          String(filters.paymentStatus).toUpperCase()
      ) {
        return false;
      }

      return true;
    });
  }, [bookings, search, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBookings.length / PAGE_SIZE
    )
  );

  const paginatedBookings = filteredBookings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen space-y-6 text-foreground">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          Booking Management
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Monitor customer bookings, rental status and
          payment status.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search booking, customer, owner, bike..."
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

      <BookingTable
        bookings={paginatedBookings}
        loading={loading}
      />

      {filteredBookings.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}
    </div>
  );
}