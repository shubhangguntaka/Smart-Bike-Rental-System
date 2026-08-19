import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import toast from "react-hot-toast";

import PaymentTable from "@/components/admin/PaymentTable";

import adminService from "@/services/adminService";
import type { PaymentAdmin } from "@/types/admin";

const PAGE_SIZE = 5;

export default function AdminPayments() {
  const [payments, setPayments] =
    useState<PaymentAdmin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const loadPayments = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await adminService.getPayments();

        setPayments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error: any) {
        console.error(
          "Failed to load admin payments:",
          error
        );

        setPayments([]);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load payments."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) =>
      [
        String(payment.paymentId),
        String(payment.bookingId),
        payment.status,
        payment.paymentDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [payments, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPayments.length /
        PAGE_SIZE
    )
  );

  const paginatedPayments =
    filteredPayments.slice(
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
          Payment Management
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Review payment records and transaction
          status.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search payment ID, booking ID, status..."
        width="max-w-md w-full"
      />

      <PaymentTable
        payments={paginatedPayments}
        loading={loading}
      />

      {filteredPayments.length >
        PAGE_SIZE && (
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