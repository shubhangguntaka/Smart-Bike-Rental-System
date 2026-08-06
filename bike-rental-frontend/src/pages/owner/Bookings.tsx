import { useState, useEffect } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import BookingQRScanner from "../../components/owner/BookingQRScanner";
import { 
    Calendar, 
    Clock, 
    Eye, 
    ShieldCheck, 
    QrCode, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle,
    User,
    Bike,
    TrendingUp,
    CreditCard
} from "lucide-react";
import toast from "react-hot-toast";

const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
        case "PENDING":
            return "bg-amber-500/10 text-amber-500";
        case "APPROVED":
            return "bg-green-500/10 text-green-500";
        case "REJECTED":
            return "bg-destructive/10 text-destructive";
        case "COMPLETED":
            return "bg-blue-500/10 text-blue-500";
        case "CANCELLED":
            return "bg-zinc-500/10 text-zinc-500";
        default:
            return "bg-muted text-muted-foreground";
    }
};

export default function OwnerBookings() {
    const { 
        bookingRequests, 
        loading, 
        error, 
        fetchBookingRequests, 
        approveBooking, 
        rejectBooking,
        fetchDashboard
    } = useOwnerStore();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("date-desc");
    const [page, setPage] = useState(1);
    
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [actioningId, setActioningId] = useState<number | null>(null);

    useEffect(() => {
        fetchBookingRequests();
    }, [fetchBookingRequests]);

    const handleApprove = async (id: number) => {
        setActioningId(id);
        const success = await approveBooking(id);
        setActioningId(null);
        if (success) {
            toast.success("Booking approved successfully!");
            if (selectedBooking && selectedBooking.bookingId === id) {
                setSelectedBooking((prev: any) => prev ? { ...prev, bookingStatus: "APPROVED" } : null);
            }
        } else {
            toast.error("Failed to approve booking.");
        }
    };

    const handleReject = async (id: number) => {
        setActioningId(id);
        const success = await rejectBooking(id);
        setActioningId(null);
        if (success) {
            toast.success("Booking request rejected.");
            if (selectedBooking && selectedBooking.bookingId === id) {
                setSelectedBooking((prev: any) => prev ? { ...prev, bookingStatus: "REJECTED" } : null);
            }
        } else {
            toast.error("Failed to reject booking.");
        }
    };

    const handleOpenDetails = (booking: any) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleRetry = () => {
        fetchBookingRequests(true);
    };

    // --- Search, Filter & Sort Logic ---
    const filtered = bookingRequests.filter((b) => {
        const matchesSearch = 
            b.bikeName.toLowerCase().includes(search.toLowerCase()) ||
            b.customerName.toLowerCase().includes(search.toLowerCase()) ||
            `br-${b.bookingId}`.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = 
            statusFilter === "ALL" || 
            b.bookingStatus.toUpperCase() === statusFilter.toUpperCase();

        return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "date-desc") {
            return new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime();
        }
        if (sortBy === "date-asc") {
            return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
        }
        if (sortBy === "amount-desc") {
            return b.rentalAmount - a.rentalAmount;
        }
        if (sortBy === "amount-asc") {
            return a.rentalAmount - b.rentalAmount;
        }
        return 0;
    });

    const itemsPerPage = 5;
    const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    // Reset page to 1 if sorting/filters reduce page count
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, sortBy]);

    if (error && bookingRequests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-10">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-4">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Failed to Load Bookings</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                    {error || "An unexpected error occurred while communicating with the owner bookings API."}
                </p>
                <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/30"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-foreground min-h-screen pb-10">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Customer Bookings</h2>
                    <p className="text-xs text-muted-foreground mt-1">Track active, pending, and past rental contracts for your listed fleet.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/30 flex items-center justify-center gap-1.5 focus:outline-none"
                >
                    <QrCode className="h-4.5 w-4.5" />
                    <span>Scan QR Code</span>
                </button>
            </div>

            {/* Controls Filters Grid */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by customer, vehicle, or Booking ID (e.g. BR-12)..."
                        width="w-full md:max-w-md"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Sort By:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-border bg-background text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Price (High to Low)</option>
                                <option value="amount-asc">Price (Low to High)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/80">
                    {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === tab
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List Container */}
            <div className="space-y-3">
                {loading && bookingRequests.length === 0 ? (
                    // Re-use Skeleton loader layouts
                    [1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs animate-pulse">
                            <div className="space-y-2 w-2/3">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                                <div className="h-5 w-48 bg-muted rounded"></div>
                                <div className="h-3.5 w-32 bg-muted rounded"></div>
                            </div>
                            <div className="h-10 w-24 bg-muted rounded-xl self-end sm:self-center"></div>
                        </div>
                    ))
                ) : paginated.length > 0 ? (
                    paginated.map((booking) => (
                        <div
                            key={booking.bookingId}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-bold text-muted-foreground font-mono">BR-{booking.bookingId}</span>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusBadgeClass(booking.bookingStatus)}`}
                                    >
                                        {booking.bookingStatus}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-foreground">{booking.bikeName}</h3>
                                
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <User className="h-3.5 w-3.5 text-muted-foreground/80" />
                                    <span>Renter: {booking.customerName}</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                                        <span>{booking.pickupDate} to {booking.returnDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                                <div>
                                    <span className="text-lg font-black text-foreground">{formatCurrency(booking.rentalAmount)}</span>
                                    <p className="text-[10px] text-muted-foreground font-semibold">Rental Amount</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenDetails(booking)}
                                        className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer focus:outline-none"
                                        title="View Details"
                                    >
                                        <Eye className="h-4.5 w-4.5" />
                                    </button>

                                    {booking.bookingStatus === "PENDING" && (
                                        <>
                                            <button
                                                type="button"
                                                disabled={actioningId !== null}
                                                onClick={() => handleApprove(booking.bookingId)}
                                                className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                {actioningId === booking.bookingId ? (
                                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                ) : null}
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actioningId !== null}
                                                onClick={() => handleReject(booking.bookingId)}
                                                className="px-4 py-2 text-xs font-bold text-white bg-destructive rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Professional empty state
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-card text-center gap-3">
                        <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
                        <h3 className="font-bold text-sm text-foreground">No Booking Records</h3>
                        <p className="text-xs text-muted-foreground max-w-sm">No rental booking requests matched your filters, search term, or role status.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        showJumpToPage={false}
                    />
                </div>
            )}

            {/* Booking Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} size="md">
                <ModalHeader onClose={() => setIsDetailsOpen(false)}>Rental Session Details</ModalHeader>
                <ModalBody>
                    {selectedBooking && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center border-b border-border pb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Booking ID</p>
                                    <p className="font-bold text-sm text-foreground font-mono">BR-{selectedBooking.bookingId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground font-semibold">Rental Session</p>
                                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                                        selectedBooking.bookingStatus === "PENDING"
                                            ? `${getStatusBadgeClass(selectedBooking.bookingStatus)} animate-pulse`
                                            : getStatusBadgeClass(selectedBooking.bookingStatus)
                                    }`}>{selectedBooking.bookingStatus}</span>
                                </div>
                            </div>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1"><Bike className="h-3.5 w-3.5" /> Vehicle Model</span>
                                    <span className="text-foreground font-bold">{selectedBooking.bikeName}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-border/40 pt-2">
                                    <span className="text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Renter Customer</span>
                                    <span className="text-foreground font-bold">{selectedBooking.customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">✉ Customer Email</span>
                                    <span className="text-foreground font-bold font-mono">{selectedBooking.customerEmail || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">📞 Customer Phone</span>
                                    <span className="text-foreground font-bold">{selectedBooking.customerPhone || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-border/40 pt-2">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Pickup Date</span>
                                    <span className="text-foreground font-bold">{selectedBooking.pickupDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Return Date</span>
                                    <span className="text-foreground font-bold">{selectedBooking.returnDate}</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border p-4 bg-muted/40 flex justify-between items-center text-xs">
                                <div className="flex gap-2 items-center">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-bold text-foreground">Earned Revenue</p>
                                        <p className="text-[10px] text-muted-foreground">Transferred to Payout Ledger</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-primary">{formatCurrency(selectedBooking.rentalAmount)}</p>
                            </div>

                            <div className="flex gap-2 items-center text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                                <span>Live GPS location tracking active on this vehicle.</span>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {selectedBooking && selectedBooking.bookingStatus === "PENDING" && (
                        <div className="flex gap-2 w-full justify-end">
                            <button
                                type="button"
                                disabled={actioningId !== null}
                                onClick={() => {
                                    handleReject(selectedBooking.bookingId);
                                    setIsDetailsOpen(false);
                                }}
                                className="px-4 py-2.5 text-xs font-bold bg-destructive text-white rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                                Reject Request
                            </button>
                            <button
                                type="button"
                                disabled={actioningId !== null}
                                onClick={() => {
                                    handleApprove(selectedBooking.bookingId);
                                    setIsDetailsOpen(false);
                                }}
                                className="px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all cursor-pointer"
                            >
                                Approve Request
                            </button>
                        </div>
                    )}
                    {(!selectedBooking || selectedBooking.bookingStatus !== "PENDING") && (
                        <button
                            type="button"
                            onClick={() => setIsDetailsOpen(false)}
                            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-all cursor-pointer"
                        >
                            Close Details
                        </button>
                    )}
                </ModalFooter>
            </Modal>

            {/* Booking QR Scanner Modal */}
            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} size="lg">
                <ModalHeader onClose={() => setIsScannerOpen(false)}>Booking QR Code Scanner</ModalHeader>
                <ModalBody>
                    <BookingQRScanner onClose={() => setIsScannerOpen(false)} />
                </ModalBody>
            </Modal>
        </div>
    );
}
