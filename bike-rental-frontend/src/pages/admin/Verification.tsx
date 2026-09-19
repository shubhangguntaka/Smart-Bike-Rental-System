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
  Filter,
  ArrowUpDown,
  Layers,
  UserCheck,
  Trash2,
  Bike as BikeIcon,
  FileCheck
} from "lucide-react";
import toast from "react-hot-toast";
import type { UserVerificationSummary } from "@/types/adminVerification";
import { getGroupedUserVerifications, deleteAllUserVerifications } from "@/services/verificationService";
import VerificationReviewModal from "@/components/admin/VerificationReviewModal";

export default function AdminVerification() {
  const [userSummaries, setUserSummaries] = useState<UserVerificationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  // Selected User Summary for Modal
  const [selectedSummary, setSelectedSummary] = useState<UserVerificationSummary | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroupedUserVerifications();
      if (Array.isArray(data)) {
        setUserSummaries(data);
      }
    } catch (err) {
      console.warn("Could not fetch user verifications:", err);
      setError("Failed to load verification records. Please try again.");
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
      total: userSummaries.length,
      verified: userSummaries.filter((v) => v.overallStatus === "VERIFIED").length,
      partial: userSummaries.filter((v) => v.overallStatus === "PARTIAL").length,
      rejected: userSummaries.filter((v) => v.overallStatus === "REJECTED").length,
    };
  }, [userSummaries]);

  // Filtered list
  const filteredSummaries = useMemo(() => {
    const result = userSummaries.filter((item) => {
      // Tab status filter
      if (activeTab !== "ALL") {
        if (activeTab === "VERIFIED" && item.overallStatus !== "VERIFIED") return false;
        if (activeTab === "PARTIAL" && item.overallStatus !== "PARTIAL") return false;
        if (activeTab === "REJECTED" && item.overallStatus !== "REJECTED") return false;
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (item.userRole?.toUpperCase() !== roleFilter.toUpperCase()) return false;
      }

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesUser = item.userName?.toLowerCase().includes(query) || item.userEmail?.toLowerCase().includes(query);
        const matchesAadhaar = item.aadhaarVerification?.documentNumber?.toLowerCase().includes(query);
        const matchesSecondary = item.secondaryVerification?.documentNumber?.toLowerCase().includes(query) || item.secondaryVerification?.registrationNumber?.toLowerCase().includes(query);
        if (!matchesUser && !matchesAadhaar && !matchesSecondary) return false;
      }

      // Date filter
      if (dateFilter !== "ALL" && item.latestUploadedAt) {
        const itemDate = new Date(item.latestUploadedAt);
        const now = new Date();
        if (dateFilter === "TODAY") {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "WEEK") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter === "MONTH") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });

    // Sort by selected option
    result.sort((a, b) => {
      const dateA = a.latestUploadedAt ? new Date(a.latestUploadedAt).getTime() : 0;
      const dateB = b.latestUploadedAt ? new Date(b.latestUploadedAt).getTime() : 0;

      if (sortBy === "NEWEST") {
        if (dateA && dateB && dateA !== dateB) {
          return dateB - dateA;
        }
        return (b.userId || 0) - (a.userId || 0);
      }
      if (sortBy === "OLDEST") {
        if (dateA && dateB && dateA !== dateB) {
          return dateA - dateB;
        }
        return (a.userId || 0) - (b.userId || 0);
      }
      if (sortBy === "NAME_AZ") {
        return (a.userName || "").localeCompare(b.userName || "");
      }
      if (sortBy === "DOCS_COUNT") {
        const countA = (a.aadhaarVerification ? 1 : 0) + (a.secondaryVerification ? 1 : 0);
        const countB = (b.aadhaarVerification ? 1 : 0) + (b.secondaryVerification ? 1 : 0);
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [userSummaries, activeTab, roleFilter, search, dateFilter, sortBy]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredSummaries.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredSummaries.slice(start, start + itemsPerPage);
  }, [filteredSummaries, page]);

  const handleDeleteUserDocs = async (summary: UserVerificationSummary) => {
    if (!window.confirm(`Are you sure you want to delete all verification records for "${summary.userName}"?`)) return;
    try {
      await deleteAllUserVerifications(summary.userId);
      toast.success(`Verification documents for ${summary.userName} deleted.`);
      fetchVerifications();
    } catch (err) {
      toast.error("Failed to delete user documents.");
    }
  };

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-12">
      {/* Title & Header */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Verification Workspace
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Inspect & manage combined Aadhaar, RC, and Driving License documents per owner/customer.
          </p>
        </div>
      </div>

      {/* Summary Count Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">Total Users</span>
            <Layers className="h-4 w-4 text-primary shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-foreground truncate">{counts.total}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider truncate">Fully Verified</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-emerald-600 truncate">{counts.verified}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider truncate">Partial Upload</span>
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-amber-600 truncate">{counts.partial}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-destructive uppercase tracking-wider truncate">Rejected</span>
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-destructive truncate">{counts.rejected}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        {/* Top Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          {[
            { id: "ALL", label: "All Users", count: counts.total },
            { id: "VERIFIED", label: "Verified", count: counts.verified },
            { id: "PARTIAL", label: "Partial", count: counts.partial },
            { id: "REJECTED", label: "Rejected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-80">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by User, Email, Doc No, Reg No..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start sm:justify-end">
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">Role: All</option>
              <option value="OWNER">Owner</option>
              <option value="CUSTOMER">Customer</option>
            </select>

            {/* Upload Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">Date: All Time</option>
              <option value="TODAY">Uploaded Today</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>

            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground w-full sm:w-auto sm:pl-2 sm:border-l sm:border-border">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ml-1"
              >
                <option value="NEWEST">Newest Uploads First</option>
                <option value="OLDEST">Oldest Uploads First</option>
                <option value="NAME_AZ">User Name (A - Z)</option>
                <option value="DOCS_COUNT">Most Documents Uploaded</option>
              </select>
            </div>
          </div>
        </div>

        {/* User-Grouped Verification Table */}
        <div className="overflow-x-auto scrollbar-thin rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-muted/40 font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Uploaded Documents</th>
                <th className="p-3">Compliance Status</th>
                <th className="p-3">Last Upload</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                    Loading user verifications...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-destructive font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span>{error}</span>
                      <button
                        onClick={fetchVerifications}
                        className="px-3 py-1 bg-destructive/10 text-destructive rounded-md text-xs font-semibold hover:bg-destructive/20 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                    No verification records match your selected filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.userId} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-foreground block">{item.userName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{item.userEmail}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.userRole === "OWNER" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}>
                        {item.userRole}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {item.aadhaarVerification ? (
                          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            <FileText className="h-3 w-3" />
                            Aadhaar: VERIFIED
                          </span>
                        ) : (
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-medium">
                            Aadhaar: Missing
                          </span>
                        )}

                        {item.secondaryVerification ? (
                          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            {item.userRole === "OWNER" ? <BikeIcon className="h-3 w-3" /> : <FileCheck className="h-3 w-3" />}
                            {item.userRole === "OWNER" ? "RC: VERIFIED" : "DL: VERIFIED"}
                          </span>
                        ) : (
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-medium">
                            {item.userRole === "OWNER" ? "RC: Missing" : "DL: Missing"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 ${
                        item.overallStatus === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : item.overallStatus === "PARTIAL"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {item.overallStatus}
                      </span>
                    </td>

                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {item.latestUploadedAt ? new Date(item.latestUploadedAt).toLocaleDateString() : "N/A"}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSummary(item);
                            setModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View All
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUserDocs(item)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-xs transition-all"
                          title="Delete All User Documents"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{paginatedData.length}</span> of <span className="font-bold text-foreground">{filteredSummaries.length}</span> user profiles
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Unified Inspection Modal */}
      <VerificationReviewModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSummary(null);
        }}
        summary={selectedSummary}
        onRefreshed={fetchVerifications}
      />
    </div>
  );
}
