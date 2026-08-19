import React, { useState, useEffect, useMemo } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Filter,
  Layers,
  UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import type { AdminVerification as IAdminVerification, AdminStatus } from "@/types/adminVerification";
import { getAdminVerifications } from "@/services/verificationService";
import VerificationReviewModal from "@/components/admin/VerificationReviewModal";

export default function AdminVerification() {
  const [verifications, setVerifications] = useState<IAdminVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [docFilter, setDocFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Active Review Item
  const [selectedVerification, setSelectedVerification] = useState<IAdminVerification | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await getAdminVerifications();
      if (Array.isArray(data)) {
        setVerifications(data);
      }
    } catch (err) {
      console.warn("Could not fetch verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    const handleUpdate = () => fetchVerifications();
    window.addEventListener("custom_bikes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(fetchVerifications, 5000);
    return () => {
      window.removeEventListener("custom_bikes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Summary counts
  const counts = useMemo(() => {
    return {
      total: verifications.length,
      pending: verifications.filter((v) => v.adminStatus === "PENDING").length,
      approved: verifications.filter((v) => v.adminStatus === "APPROVED").length,
      rejected: verifications.filter((v) => v.adminStatus === "REJECTED").length,
      reupload: verifications.filter((v) => v.adminStatus === "REUPLOAD_REQUIRED").length,
    };
  }, [verifications]);

  // Filtered list
  const filteredVerifications = useMemo(() => {
    return verifications.filter((item) => {
      // Tab status filter
      if (activeTab !== "ALL") {
        if (activeTab === "PENDING" && item.adminStatus !== "PENDING") return false;
        if (activeTab === "APPROVED" && item.adminStatus !== "APPROVED") return false;
        if (activeTab === "REJECTED" && item.adminStatus !== "REJECTED") return false;
        if (activeTab === "REUPLOAD_REQUIRED" && item.adminStatus !== "REUPLOAD_REQUIRED") return false;
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (item.userRole?.toUpperCase() !== roleFilter.toUpperCase()) return false;
      }

      // Document type filter
      if (docFilter !== "ALL") {
        if (docFilter === "AADHAAR" && item.documentType !== "AADHAAR") return false;
        if (docFilter === "RC" && item.documentType !== "RC") return false;
        if (docFilter === "DRIVING_LICENSE" && item.documentType !== "DRIVING_LICENSE") return false;
      }

      // Search text filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (item.userName || "").toLowerCase().includes(q);
        const matchEmail = (item.userEmail || "").toLowerCase().includes(q);
        const matchDocNo = (item.documentNumber || "").toLowerCase().includes(q);
        const matchRegNo = (item.registrationNumber || "").toLowerCase().includes(q);
        const matchId = String(item.id).includes(q);
        if (!matchName && !matchEmail && !matchDocNo && !matchRegNo && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [verifications, activeTab, roleFilter, docFilter, search]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage) || 1;
  const paginatedVerifications = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredVerifications.slice(start, start + itemsPerPage);
  }, [filteredVerifications, page]);

  const handleOpenReview = (item: IAdminVerification) => {
    setSelectedVerification(item);
    setModalOpen(true);
  };

  const handleItemUpdated = (updated: IAdminVerification) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v))
    );
    // Refresh backend state to ensure synched counts
    fetchVerifications();
  };

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Member 5 — Compliance Administration
          </span>
          <h2 className="text-2xl font-serif font-bold text-foreground mt-0.5">
            Centralized Document Verification
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage administrative review status for Aadhaar, Driving License, and Bike Registration Certificates (RC).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchVerifications}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Total Documents"
          count={counts.total}
          active={activeTab === "ALL"}
          onClick={() => { setActiveTab("ALL"); setPage(1); }}
          icon={<Layers className="h-4 w-4 text-primary" />}
        />
        <SummaryCard
          title="Pending Review"
          count={counts.pending}
          active={activeTab === "PENDING"}
          onClick={() => { setActiveTab("PENDING"); setPage(1); }}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          badgeClass="bg-amber-500/10 text-amber-500"
        />
        <SummaryCard
          title="Approved"
          count={counts.approved}
          active={activeTab === "APPROVED"}
          onClick={() => { setActiveTab("APPROVED"); setPage(1); }}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
        <SummaryCard
          title="Rejected"
          count={counts.rejected}
          active={activeTab === "REJECTED"}
          onClick={() => { setActiveTab("REJECTED"); setPage(1); }}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive"
        />
        <SummaryCard
          title="Re-upload Required"
          count={counts.reupload}
          active={activeTab === "REUPLOAD_REQUIRED"}
          onClick={() => { setActiveTab("REUPLOAD_REQUIRED"); setPage(1); }}
          icon={<RotateCcw className="h-4 w-4 text-orange-500" />}
          badgeClass="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: "All Documents" },
            { id: "PENDING", label: `Pending (${counts.pending})` },
            { id: "APPROVED", label: `Approved (${counts.approved})` },
            { id: "REJECTED", label: `Rejected (${counts.rejected})` },
            { id: "REUPLOAD_REQUIRED", label: `Re-upload Required (${counts.reupload})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search by User, Email, Doc No, Reg No..."
            width="max-w-md w-full"
          />

          <div className="flex items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="bg-background border border-border text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                <option value="ALL">Role: All</option>
                <option value="OWNER">Role: Owner</option>
                <option value="CUSTOMER">Role: Customer</option>
              </select>
            </div>

            {/* Document Filter */}
            <select
              value={docFilter}
              onChange={(e) => { setDocFilter(e.target.value); setPage(1); }}
              className="bg-background border border-border text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              <option value="ALL">Document: All</option>
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="RC">RC (Bike Document)</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Verification Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Document</th>
                <th className="px-4 py-3.5">Automatic Verification</th>
                <th className="px-4 py-3.5">Admin Review Status</th>
                <th className="px-4 py-3.5">Uploaded Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                    <p className="font-semibold">Loading verification records...</p>
                  </td>
                </tr>
              ) : paginatedVerifications.length > 0 ? (
                paginatedVerifications.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground text-sm">{item.userName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.userEmail}</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.userRole === "OWNER"
                          ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}>
                        {item.userRole}
                      </span>
                    </td>

                    {/* Document */}
                    <td className="px-4 py-4 space-y-0.5">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>{item.documentType === "RC" ? "RC Document" : item.documentType}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {item.documentNumber || item.registrationNumber || "—"}
                      </div>
                    </td>

                    {/* Automatic Verification */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        item.automaticStatus === "VERIFIED"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : "bg-amber-500/15 text-amber-600"
                      }`}>
                        {item.automaticStatus === "VERIFIED" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        {item.automaticStatus}
                      </span>
                    </td>

                    {/* Admin Review Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                        item.adminStatus === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : item.adminStatus === "REJECTED"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : item.adminStatus === "REUPLOAD_REQUIRED"
                          ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          item.adminStatus === "APPROVED" ? "bg-emerald-500" :
                          item.adminStatus === "REJECTED" ? "bg-destructive" :
                          item.adminStatus === "REUPLOAD_REQUIRED" ? "bg-orange-500" :
                          "bg-amber-500"
                        }`} />
                        {item.adminStatus === "REUPLOAD_REQUIRED" ? "RE-UPLOAD" : item.adminStatus}
                      </span>
                    </td>

                    {/* Uploaded Date */}
                    <td className="px-4 py-4 text-muted-foreground font-mono text-[11px]">
                      {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center justify-end gap-1.5 ml-auto transition cursor-pointer shadow-xs ${
                          item.adminStatus === "PENDING"
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border bg-muted/60 text-foreground hover:bg-muted"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{item.adminStatus === "PENDING" ? "Review" : "View"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold text-sm">No verification records found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredVerifications.length > itemsPerPage && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* Interactive Verification Review Modal */}
      <VerificationReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        verification={selectedVerification}
        onUpdated={handleItemUpdated}
      />
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badgeClass?: string;
}

const SummaryCard = ({ title, count, active, onClick, icon, badgeClass }: SummaryCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-2 ${
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:bg-muted/40"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
      {icon}
    </div>
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-extrabold text-foreground">{count}</span>
      {badgeClass && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeClass}`}>
          {title}
        </span>
      )}
    </div>
  </button>
);
