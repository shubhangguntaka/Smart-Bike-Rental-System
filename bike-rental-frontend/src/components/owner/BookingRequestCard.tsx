import { useEffect, useState } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../common/Modal";
import { Calendar, User, Bike, CreditCard, Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { BookingRequest } from "../../types/owner";

const BookingRequestCard = () => {
    const bookingRequests = useOwnerStore((s) => s.bookingRequests);
    const loading = useOwnerStore((s) => s.loading);
    const fetchBookingRequests = useOwnerStore((s) => s.fetchBookingRequests);
    const approveBooking = useOwnerStore((s) => s.approveBooking);
    const rejectBooking = useOwnerStore((s) => s.rejectBooking);
    const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [actioningId, setActioningId] = useState<number | null>(null);

    useEffect(() => {
        fetchBookingRequests(true);
    }, [fetchBookingRequests]);

    const handleApprove = async (id: number) => {
        setActioningId(id);
        const success = await approveBooking(id);
        setActioningId(null);
        if (success) {
            toast.success("Booking request approved successfully!");
        } else {
            toast.error("Failed to approve booking request.");
        }
    };

    const handleReject = async (id: number) => {
        setActioningId(id);
        const success = await rejectBooking(id);
        setActioningId(null);
        if (success) {
            toast.success("Booking request rejected.");
        } else {
            toast.error("Failed to reject booking request.");
        }
    };

    const handleViewDetails = (booking: BookingRequest) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const formatCurrency = (val?: number) => {
        if (val === undefined || val === null || isNaN(val)) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    // Filter to only show pending requests (safely handling null/undefined)
    const safeRequests = Array.isArray(bookingRequests) ? bookingRequests : [];
    const pendingRequests = safeRequests.filter(r => r && r.bookingStatus === "PENDING");

    if (loading && safeRequests.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-pulse space-y-4">
                <div className="h-6 w-48 bg-muted rounded"></div>
                {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded"></div>
                            <div className="h-3 w-24 bg-muted rounded"></div>
                        </div>
                        <div className="h-8 w-24 bg-muted rounded-xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-card shadow-xs p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">
                        Pending Booking Requests
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Approve or reject customer reservation requests for your fleet.
                    </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                    {pendingRequests.length} Pending
                </span>
            </div>

            {pendingRequests.length > 0 ? (
                <div className="divide-y divide-border">
                    {pendingRequests.map((item) => (
                        <div
                            key={item.bookingId}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                            {/* Customer & Bike Info */}
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-muted rounded-xl text-primary mt-0.5">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground leading-snug">
                                        {item.customerName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                                        {item.bikeName}
                                    </p>
                                </div>
                            </div>

                            {/* Date Details */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground sm:my-0 my-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                                    <span>
                                        {item.pickupDate} to {item.returnDate}
                                    </span>
                                </div>
                            </div>

                            {/* Price / Status */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                                <div className="sm:text-right">
                                    <span className="text-base font-black text-foreground">
                                        {formatCurrency(item.rentalAmount)}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                        Amount
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleViewDetails(item)}
                                        className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-none"
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actioningId !== null}
                                        onClick={() => handleApprove(item.bookingId)}
                                        className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center gap-1"
                                    >
                                        {actioningId === item.bookingId ? (
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : null}
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actioningId !== null}
                                        onClick={() => handleReject(item.bookingId)}
                                        className="px-4 py-2 text-xs font-bold text-white bg-destructive rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center gap-1"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-card/50 text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/60" />
                    <span>No pending booking requests found. You're all caught up!</span>
                </div>
            )}

            {/* Receipt Modal */}
            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} size="md">
                <ModalHeader onClose={() => setIsDetailsOpen(false)}>Booking Reservation Request</ModalHeader>
                <ModalBody>
                    {selectedBooking && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center border-b border-border pb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Booking ID</p>
                                    <p className="font-bold text-sm text-foreground font-mono">BR-{selectedBooking.bookingId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground font-semibold">Status</p>
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
                                        {selectedBooking.bookingStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer Name</span>
                                    <span className="text-foreground font-bold">{selectedBooking.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vehicle Model</span>
                                    <span className="text-foreground font-bold">{selectedBooking.bikeName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pickup Date</span>
                                    <span className="text-foreground font-bold">{selectedBooking.pickupDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Return Date</span>
                                    <span className="text-foreground font-bold">{selectedBooking.returnDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Verification Requirement</span>
                                    <span className="text-green-500 font-bold">Aadhaar Verified</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border p-4 bg-muted/40 flex justify-between items-center">
                                <div className="flex gap-2.5 items-center">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Razorpay Escrow</p>
                                        <p className="text-[10px] text-muted-foreground">Security Deposit Included</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground font-semibold">Rental Amount</p>
                                    <p className="text-base font-black text-foreground">{formatCurrency(selectedBooking.rentalAmount)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                <Clock className="h-4 w-4 text-primary shrink-0" />
                                <span>You have 24 hours to approve or reject this booking request before it expires automatically.</span>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedBooking) {
                                handleReject(selectedBooking.bookingId);
                                setIsDetailsOpen(false);
                            }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-destructive text-white rounded-xl hover:opacity-90 transition-all cursor-pointer"
                    >
                        Reject Request
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedBooking) {
                                handleApprove(selectedBooking.bookingId);
                                setIsDetailsOpen(false);
                            }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all cursor-pointer"
                    >
                        Approve Request
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default BookingRequestCard;