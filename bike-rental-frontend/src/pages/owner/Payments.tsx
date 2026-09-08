import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useOwnerStore } from "../../store/ownerStore";
import useAuth from "../../hooks/useAuth";
import paymentService from "@/services/paymentService";
import type { BookingRequest, OwnerPaymentDTO } from "@/types/owner";
import type { PaymentResponse } from "@/types/payment";
import { 
    CreditCard, 
    TrendingUp, 
    Calendar, 
    FileSpreadsheet, 
    FileDown, 
    AlertTriangle,
    IndianRupee,
    Briefcase,
    Bike,
    LineChart as ChartIcon,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    Eye,
    Printer,
    Building2,
    Sparkles,
    ShieldCheck,
    RotateCw,
    Wallet,
    Layers,
    User as UserIcon,
    ArrowUpDown,
    Filter,
    Receipt,
    Phone,
    Mail,
    ArrowRight,
    Search,
    Download,
    Loader2,
    RefreshCw
} from "lucide-react";
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    AreaChart, 
    Area, 
    CartesianGrid 
} from "recharts";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface UnifiedTransactionItem {
    id: number;
    paymentId: number;
    bookingId: number;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bikeId?: number;
    bikeName: string;
    bikeModel?: string;
    bikeRegistrationNumber?: string;
    pickupDate: string;
    returnDate: string;
    rentalDurationDays: number;
    baseRentalAmount: number;
    lateCharge: number;
    platformFeePercent: number;
    platformFeeAmount: number;
    taxAmount: number;
    customerPaidAmount: number;
    ownerEarnings: number;
    paymentStatus: string;
    paymentMethod: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
    createdAt?: string;
}

export default function OwnerPayments() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        earnings, 
        bookingRequests, 
        ownerPayments,
        earningsSummary,
        dashboard,
        loading, 
        error, 
        fetchAllOwnerFinancials
    } = useOwnerStore();

    // Bank & Settlement config from persistent storage
    const bankConfig = useMemo(() => {
        try {
            const saved = localStorage.getItem("smartbike_owner_settings_config");
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // ignore
        }
        return {
            bankName: "HDFC Bank Ltd",
            accountHolderName: user?.fullName || "Rajesh Sharma",
            accountNumber: "50100492817291",
            ifscCode: "HDFC0001234",
            upiId: "rajesh.sharma@okhdfcbank",
            payoutFrequency: "instant",
            minPayoutThreshold: 500,
        };
    }, [user]);

    const maskedAccount = useMemo(() => {
        const num = bankConfig.accountNumber || "50100492817291";
        if (num.length <= 4) return num;
        return `•••• •••• ${num.slice(-4)}`;
    }, [bankConfig.accountNumber]);

    const handleNavigateToBankEdit = () => {
        navigate("/owner/settings?tab=PAYOUTS&editBank=true", { 
            state: { tab: "PAYOUTS", openBankModal: true } 
        });
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("date-desc");
    const [page, setPage] = useState(1);
    const [activeChartTab, setActiveChartTab] = useState<"monthly" | "trend" | "vehicle">("monthly");
    const [selectedItem, setSelectedItem] = useState<UnifiedTransactionItem | null>(null);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<PaymentResponse | null>(null);
    const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllOwnerFinancials(true);
    }, [fetchAllOwnerFinancials]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAllOwnerFinancials(true);
            toast.success("Payment records & earnings refreshed!");
        } catch {
            toast.error("Failed to refresh records from server.");
        } finally {
            setRefreshing(false);
        }
    };

    const formatCurrency = (val?: number) => {
        if (val === undefined || val === null) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const formatDate = (dateStr?: string) => {
        try {
            if (!dateStr) return "—";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString("en-IN", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
            });
        } catch {
            return dateStr || "—";
        }
    };

    const formatDateTime = (dateStr?: string) => {
        try {
            if (!dateStr) return "—";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString("en-IN", { 
                month: "short", 
                day: "numeric", 
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateStr || "—";
        }
    };

    const calculateDays = (start?: string, end?: string) => {
        if (!start || !end) return 1;
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 1;
    };

    // Unified list of transaction items (Prioritizes authoritative ownerPayments from backend, falls back cleanly to bookingRequests)
    const transactionList = useMemo<UnifiedTransactionItem[]>(() => {
        if (ownerPayments && ownerPayments.length > 0) {
            return ownerPayments.map((op: OwnerPaymentDTO) => {
                const base = Number(op.baseRentalAmount || 0);
                const late = Number(op.lateCharge || 0);
                const platformFee = Number(op.platformFeeAmount || 0);
                const finalAmt = Number(op.finalAmount || (base + late + platformFee));
                const ownerEarn = Number(op.ownerEarnings || (base + late));

                return {
                    id: op.paymentId || op.bookingId,
                    paymentId: op.paymentId || op.bookingId,
                    bookingId: op.bookingId,
                    invoiceNumber: op.invoiceNumber || `INV-${op.bookingId}`,
                    customerName: op.customerName || "Customer",
                    customerEmail: op.customerEmail || "",
                    customerPhone: op.customerPhone || "",
                    bikeId: op.bikeId,
                    bikeName: op.bikeName || "Rental Bike",
                    bikeModel: op.bikeModel || "",
                    bikeRegistrationNumber: op.bikeRegistrationNumber || "",
                    pickupDate: op.rentalStart || op.createdAt || "",
                    returnDate: op.scheduledReturn || op.actualReturn || "",
                    rentalDurationDays: op.rentalDurationDays || 1,
                    baseRentalAmount: base,
                    lateCharge: late,
                    platformFeePercent: Number(op.platformFeePercent || 0),
                    platformFeeAmount: platformFee,
                    taxAmount: Number(op.taxAmount || 0),
                    customerPaidAmount: finalAmt,
                    ownerEarnings: ownerEarn,
                    paymentStatus: op.paymentStatus || "SUCCESS",
                    paymentMethod: op.paymentMethod || "ONLINE",
                    transactionId: op.transactionId,
                    razorpayOrderId: op.razorpayOrderId,
                    razorpayPaymentId: op.razorpayPaymentId,
                    paidAt: op.paidAt || op.createdAt,
                    createdAt: op.createdAt
                };
            });
        }

        // Fallback from booking requests if owner payments not yet loaded
        return (bookingRequests || []).map((b: BookingRequest) => {
            const amount = Number(b.rentalAmount || 0);
            return {
                id: b.bookingId,
                paymentId: b.bookingId,
                bookingId: b.bookingId,
                invoiceNumber: `INV-${b.bookingId}`,
                customerName: b.customerName || "Customer",
                customerEmail: b.customerEmail || "",
                customerPhone: b.customerPhone || "",
                bikeId: b.bikeId,
                bikeName: b.bikeName || "Rental Bike",
                bikeModel: "",
                bikeRegistrationNumber: "",
                pickupDate: b.pickupDate || b.createdAt || "",
                returnDate: b.returnDate || "",
                rentalDurationDays: calculateDays(b.pickupDate, b.returnDate),
                baseRentalAmount: amount,
                lateCharge: 0,
                platformFeePercent: 0,
                platformFeeAmount: 0,
                taxAmount: 0,
                customerPaidAmount: amount,
                ownerEarnings: amount,
                paymentStatus: b.bookingStatus || "PENDING",
                paymentMethod: "ONLINE",
                paidAt: b.updatedAt || b.createdAt,
                createdAt: b.createdAt
            };
        });
    }, [ownerPayments, bookingRequests]);

    // Financial stats calculation
    const financialStats = useMemo(() => {
        const total = transactionList.length;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);

        const completedItems = transactionList.filter(item => {
            const st = item.paymentStatus.toUpperCase();
            return st === "SUCCESS" || st === "PAID" || st === "COMPLETED" || st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE";
        });
        const pendingItems = transactionList.filter(item => {
            const st = item.paymentStatus.toUpperCase();
            return st === "PENDING" || st === "READY_FOR_PAYMENT" || st === "PROCESSING";
        });
        const activeItems = transactionList.filter(item => {
            const st = item.paymentStatus.toUpperCase();
            return st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE";
        });
        const cancelledItems = transactionList.filter(item => {
            const st = item.paymentStatus.toUpperCase();
            return st === "CANCELLED" || st === "REJECTED" || st === "FAILED" || st === "REFUNDED";
        });

        let todayCalculated = 0;
        let weeklyCalculated = 0;
        let monthlyCalculated = 0;

        completedItems.forEach(item => {
            const dateMs = new Date(item.paidAt || item.pickupDate || item.createdAt || 0).getTime();
            const earn = item.ownerEarnings;
            if (dateMs >= startOfToday) todayCalculated += earn;
            if (dateMs >= oneWeekAgo) weeklyCalculated += earn;
            if (dateMs >= oneMonthAgo) monthlyCalculated += earn;
        });

        const totalOwnerEarningsSum = completedItems.reduce((sum, i) => sum + i.ownerEarnings, 0);
        const totalCustomerPaidSum = completedItems.reduce((sum, i) => sum + i.customerPaidAmount, 0);
        const pendingVolume = pendingItems.reduce((sum, i) => sum + i.ownerEarnings, 0);

        // Prioritize authoritative values from earningsSummary if available
        const totalGross = (earningsSummary?.totalEarnings !== undefined && earningsSummary.totalEarnings > 0)
            ? earningsSummary.totalEarnings
            : (earnings?.total && earnings.total > 0 ? earnings.total : totalOwnerEarningsSum);

        const totalCustomerPaid = (earningsSummary?.totalCustomerPaid !== undefined && earningsSummary.totalCustomerPaid > 0)
            ? earningsSummary.totalCustomerPaid
            : totalCustomerPaidSum;

        return {
            total,
            completedCount: completedItems.length,
            pendingCount: pendingItems.length,
            activeCount: activeItems.length,
            cancelledCount: cancelledItems.length,
            totalGross,
            totalCustomerPaid,
            pendingVolume: (earnings?.pendingPayments && earnings.pendingPayments > 0) ? earnings.pendingPayments : pendingVolume,
            todayRevenue: (earnings?.today && earnings.today > 0) ? earnings.today : (dashboard?.todayEarnings ?? todayCalculated),
            weeklyRevenue: (earnings?.weekly && earnings.weekly > 0) ? earnings.weekly : (dashboard?.weeklyEarnings ?? weeklyCalculated),
            monthlyRevenue: (earnings?.monthly && earnings.monthly > 0) ? earnings.monthly : (dashboard?.monthlyEarnings ?? monthlyCalculated),
        };
    }, [transactionList, earningsSummary, earnings, dashboard]);

    // Handle Opening Receipt Modal
    const handleOpenReceipt = async (item: UnifiedTransactionItem) => {
        setSelectedItem(item);
        setSelectedPaymentDetails(null);
        setLoadingPaymentDetails(true);

        try {
            const payment = await paymentService.getPaymentByBookingId(item.bookingId);
            if (payment) {
                setSelectedPaymentDetails(payment);
            }
        } catch {
            setSelectedPaymentDetails(null);
        } finally {
            setLoadingPaymentDetails(false);
        }
    };

    // Filter & Search Logic
    const filteredTransactions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return transactionList.filter((item) => {
            const matchesSearch = 
                !query ||
                (item.bikeName && item.bikeName.toLowerCase().includes(query)) ||
                (item.customerName && item.customerName.toLowerCase().includes(query)) ||
                (item.customerEmail && item.customerEmail.toLowerCase().includes(query)) ||
                (item.customerPhone && item.customerPhone.toLowerCase().includes(query)) ||
                `pay-${item.paymentId}`.toLowerCase().includes(query) ||
                `br-${item.bookingId}`.toLowerCase().includes(query) ||
                `inv-${item.bookingId}`.toLowerCase().includes(query) ||
                (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(query)) ||
                (item.transactionId && item.transactionId.toLowerCase().includes(query)) ||
                String(item.bookingId).includes(query) ||
                String(item.customerPaidAmount).includes(query) ||
                String(item.ownerEarnings).includes(query);

            const st = item.paymentStatus.toUpperCase();
            let matchesStatus = true;
            if (statusFilter === "COMPLETED" || statusFilter === "SUCCESS") {
                matchesStatus = st === "COMPLETED" || st === "PAID" || st === "SUCCESS";
            } else if (statusFilter === "CONFIRMED") {
                matchesStatus = st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE";
            } else if (statusFilter === "PENDING") {
                matchesStatus = st === "PENDING" || st === "READY_FOR_PAYMENT" || st === "PROCESSING";
            } else if (statusFilter === "CANCELLED" || statusFilter === "FAILED") {
                matchesStatus = st === "CANCELLED" || st === "REJECTED" || st === "FAILED" || st === "REFUNDED";
            } else if (statusFilter !== "ALL") {
                matchesStatus = st === statusFilter.toUpperCase();
            }

            return matchesSearch && matchesStatus;
        });
    }, [transactionList, searchQuery, statusFilter]);

    // Sorting
    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            const dateA = new Date(a.paidAt || a.pickupDate || a.createdAt || 0).getTime();
            const dateB = new Date(b.paidAt || b.pickupDate || b.createdAt || 0).getTime();

            if (sortBy === "date-desc") return dateB - dateA;
            if (sortBy === "date-asc") return dateA - dateB;
            if (sortBy === "amount-desc") return b.ownerEarnings - a.ownerEarnings;
            if (sortBy === "amount-asc") return a.ownerEarnings - b.ownerEarnings;
            return 0;
        });
    }, [filteredTransactions, sortBy]);

    const itemsPerPage = 8;
    const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / itemsPerPage));
    const paginatedTransactions = sortedTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter, sortBy]);

    // Chart Data Aggregations
    const { monthlyChartData, trendChartData, vehicleChartData, topVehicle } = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // 1. Monthly Revenue (Past 6 months)
        const monthlyMap: { [key: string]: number } = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mName = monthNames[d.getMonth()];
            monthlyMap[mName] = 0;
        }
        
        transactionList.forEach(item => {
            const st = item.paymentStatus.toUpperCase();
            if (st === "SUCCESS" || st === "COMPLETED" || st === "PAID" || st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE") {
                const dateObj = new Date(item.paidAt || item.pickupDate || item.createdAt || new Date());
                const mName = monthNames[dateObj.getMonth()];
                if (monthlyMap[mName] !== undefined) {
                    monthlyMap[mName] += item.ownerEarnings;
                }
            }
        });

        const mData = Object.keys(monthlyMap).map(k => ({
            month: k,
            Revenue: monthlyMap[k]
        }));

        // 2. Revenue Trend (Cumulative)
        const successItems = [...transactionList]
            .filter(item => {
                const st = item.paymentStatus.toUpperCase();
                return st === "SUCCESS" || st === "COMPLETED" || st === "PAID" || st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE";
            })
            .sort((a, b) => new Date(a.paidAt || a.pickupDate || a.createdAt || 0).getTime() - new Date(b.paidAt || b.pickupDate || b.createdAt || 0).getTime());
        
        let cumulative = 0;
        const tData = successItems.map(item => {
            cumulative += item.ownerEarnings;
            return {
                date: new Date(item.paidAt || item.pickupDate || item.createdAt || new Date()).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                "Total Revenue": cumulative
            };
        });

        // 3. Revenue by Listed Vehicles
        const vehicleMap: { [key: string]: number } = {};
        transactionList.forEach(item => {
            const st = item.paymentStatus.toUpperCase();
            if (st === "SUCCESS" || st === "COMPLETED" || st === "PAID" || st === "CONFIRMED" || st === "APPROVED" || st === "ACTIVE") {
                const name = item.bikeName || "Other Bike";
                vehicleMap[name] = (vehicleMap[name] || 0) + item.ownerEarnings;
            }
        });

        const vData = Object.keys(vehicleMap).map(k => ({
            vehicle: k.length > 15 ? `${k.substring(0, 13)}...` : k,
            fullName: k,
            Revenue: vehicleMap[k]
        })).sort((a, b) => b.Revenue - a.Revenue);

        const bestVehicle = vData.length > 0 ? vData[0] : null;

        return { 
            monthlyChartData: mData, 
            trendChartData: tData, 
            vehicleChartData: vData,
            topVehicle: bestVehicle
        };
    }, [transactionList]);

    // CSV Export
    const exportCSV = () => {
        if (sortedTransactions.length === 0) {
            toast.error("No payment transaction records available to export.");
            return;
        }
        const headers = [
            "Payment Reference",
            "Booking ID", 
            "Invoice #",
            "Customer Name", 
            "Customer Email", 
            "Customer Phone", 
            "Vehicle Model", 
            "Rental Start", 
            "Scheduled Return", 
            "Customer Paid (INR)", 
            "Owner Earning (INR)",
            "Payment Status",
            "Payment Method"
        ];
        const rows = sortedTransactions.map(item => [
            `"PAY-${item.paymentId}"`,
            `"BR-${item.bookingId}"`,
            `"${item.invoiceNumber}"`,
            `"${item.customerName.replace(/"/g, '""')}"`,
            `"${item.customerEmail.replace(/"/g, '""')}"`,
            `"${item.customerPhone.replace(/"/g, '""')}"`,
            `"${item.bikeName.replace(/"/g, '""')}"`,
            `"${formatDate(item.pickupDate)}"`,
            `"${formatDate(item.returnDate)}"`,
            item.customerPaidAmount.toFixed(2),
            item.ownerEarnings.toFixed(2),
            `"${item.paymentStatus}"`,
            `"${item.paymentMethod}"`
        ].join(","));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `owner_payment_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Statement exported successfully!");
    };

    // PDF Export
    const exportPDF = () => {
        if (sortedTransactions.length === 0) {
            toast.error("No transaction records available to export.");
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4",
            });

            const ownerDisplayName = user?.fullName || dashboard?.ownerName || "Owner Account";
            const todayStr = new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            // Header Banner
            doc.setFillColor(34, 197, 94);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text("BIKE RENTAL PLATFORM — OWNER PAYMENTS & EARNINGS STATEMENT", 40, 26);

            doc.setTextColor(40, 40, 40);
            doc.setFontSize(9);
            doc.text(`Partner / Owner: ${ownerDisplayName}`, 40, 65);
            doc.text(`Generated On: ${todayStr}`, 40, 80);
            doc.text(`KYC & Settlement Status: Verified`, 40, 95);

            doc.setFont("helvetica", "bold");
            doc.text(`Total Lifetime Earnings: INR ${Number(financialStats.totalGross).toLocaleString("en-IN")}`, 310, 65);
            doc.text(`Pending Settlement: INR ${Number(financialStats.pendingVolume).toLocaleString("en-IN")}`, 310, 80);
            doc.text(`Total Transactions: ${sortedTransactions.length}`, 310, 95);

            const tableRows = sortedTransactions.map((item) => [
                `PAY-${item.paymentId}`,
                `BR-${item.bookingId}`,
                formatDate(item.pickupDate),
                item.customerName || "Customer",
                item.bikeName || "Vehicle",
                `₹${item.customerPaidAmount.toLocaleString("en-IN")}`,
                `₹${item.ownerEarnings.toLocaleString("en-IN")}`,
                item.paymentStatus.toUpperCase()
            ]);

            autoTable(doc, {
                startY: 115,
                head: [["Payment ID", "Booking Ref", "Date", "Customer", "Vehicle", "Customer Paid", "Owner Earning", "Status"]],
                body: tableRows,
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: "bold"
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [50, 50, 50]
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                margin: { left: 35, right: 35 }
            });

            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(130, 130, 130);
                doc.text(
                    `Page ${i} of ${pageCount} — Confidential Owner Financial Statement`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 20,
                    { align: "center" }
                );
            }

            doc.save(`owner_payment_statement_${new Date().toISOString().split("T")[0]}.pdf`);
            toast.success("PDF Statement downloaded successfully!");
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF document.");
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS":
            case "COMPLETED":
            case "PAID":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Paid & Settled
                    </span>
                );
            case "CONFIRMED":
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                    </span>
                );
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Clock className="h-3.5 w-3.5" />
                        Active Ride
                    </span>
                );
            case "PENDING":
            case "READY_FOR_PAYMENT":
            case "PROCESSING":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" />
                        Pending Settlement
                    </span>
                );
            case "CANCELLED":
            case "REJECTED":
            case "FAILED":
            case "REFUNDED":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive border border-destructive/20">
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground border border-border">
                        {status || "UNKNOWN"}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans text-foreground">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-card border border-border p-6 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Owner Earnings & Payments
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                                <ShieldCheck className="h-3 w-3" />
                                Verified Partner
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Complete record of customer payments, rental transactions, live revenues, and payout settlements.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleNavigateToBankEdit}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer shadow-xs"
                    >
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>Edit Bank Details</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                        <RotateCw className={`h-3.5 w-3.5 ${refreshing || loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
                        <span>{refreshing || loading ? "Refreshing..." : "Refresh"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={exportCSV}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-95 cursor-pointer shadow-xs"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        type="button"
                        onClick={exportPDF}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        <span>PDF Statement</span>
                    </button>
                </div>
            </div>

            {/* Offline or Network Connection Alert Banner */}
            {error && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-xs font-bold">Network / Backend Communication Notice</p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                {error}. Displaying cached records. Please ensure your backend server is running on port 8888.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing || loading ? "animate-spin" : ""}`} />
                        <span>Retry</span>
                    </button>
                </div>
            )}

            {/* Top Stat KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Gross Revenue */}
                <div 
                    onClick={() => setStatusFilter("ALL")}
                    className={`bg-card border rounded-3xl p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:border-primary/50 ${
                        statusFilter === "ALL" ? "border-primary ring-2 ring-primary/20" : "border-border/80"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gross Revenue</span>
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            {formatCurrency(financialStats.totalGross)}
                        </h2>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>From {financialStats.completedCount} successful rides</span>
                            <span className="text-[10px] font-bold text-primary">All Time</span>
                        </div>
                    </div>
                </div>

                {/* Net Settled Payouts */}
                <div 
                    onClick={() => setStatusFilter("COMPLETED")}
                    className={`bg-card border rounded-3xl p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:border-emerald-500/50 ${
                        statusFilter === "COMPLETED" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border/80"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Settled Payouts</span>
                        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                            {formatCurrency(financialStats.totalGross)}
                        </h2>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>100% credited to bank</span>
                            <span className="text-[10px] font-bold text-emerald-600">Settled</span>
                        </div>
                    </div>
                </div>

                {/* Pending Clearance */}
                <div 
                    onClick={() => setStatusFilter("PENDING")}
                    className={`bg-card border rounded-3xl p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:border-amber-500/50 ${
                        statusFilter === "PENDING" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border/80"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Clearance</span>
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400 sm:text-3xl">
                            {formatCurrency(financialStats.pendingVolume)}
                        </h2>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{financialStats.pendingCount} pending payment(s)</span>
                            <span className="text-[10px] font-bold text-amber-600">In Pipeline</span>
                        </div>
                    </div>
                </div>

                {/* Completed Trips */}
                <div 
                    onClick={() => setStatusFilter("CONFIRMED")}
                    className={`bg-card border rounded-3xl p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:border-primary/50 ${
                        statusFilter === "CONFIRMED" ? "border-primary ring-2 ring-primary/20" : "border-border/80"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Trips</span>
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Bike className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            {financialStats.completedCount} <span className="text-xs font-medium text-muted-foreground">Trips</span>
                        </h2>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{financialStats.activeCount} currently active</span>
                            <span className="text-[10px] font-bold text-primary">Fleet Activity</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeframe Quick Breakdown Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                        <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold text-foreground">
                            {formatCurrency(financialStats.todayRevenue)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Calculated from midnight today</p>
                    </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider">This Week (7 Days)</span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold text-foreground">
                            {formatCurrency(financialStats.weeklyRevenue)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Rolling last 7 calendar days</p>
                    </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider">This Month (30 Days)</span>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3">
                        <div className="text-xl font-bold text-foreground">
                            {formatCurrency(financialStats.monthlyRevenue)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Rolling last 30 calendar days</p>
                    </div>
                </div>
            </div>

            {/* Analytics Visual Chart Section */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <ChartIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Revenue & Payout Visual Analytics
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Visual breakdown of rental volume, cumulative growth, and bike performance.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/80">
                        <button
                            type="button"
                            onClick={() => setActiveChartTab("monthly")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                activeChartTab === "monthly"
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Monthly Volume
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveChartTab("trend")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                activeChartTab === "trend"
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Cumulative Growth
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveChartTab("vehicle")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                activeChartTab === "vehicle"
                                    ? "bg-background text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Revenue by Fleet
                        </button>
                    </div>
                </div>

                <div className="mt-6 h-[260px] w-full">
                    {activeChartTab === "monthly" && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Gross Earnings"]}
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        borderColor: "var(--border)",
                                        borderRadius: "1rem",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="Revenue" fill="#7c9082" radius={[8, 8, 0, 0]} maxBarSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {activeChartTab === "trend" && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendChartData.length > 0 ? trendChartData : [{ date: "Start", "Total Revenue": 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c9082" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#7c9082" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Cumulative Revenue"]}
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        borderColor: "var(--border)",
                                        borderRadius: "1rem",
                                        fontSize: "12px",
                                    }}
                                />
                                <Area type="monotone" dataKey="Total Revenue" stroke="#7c9082" strokeWidth={2.5} fillOpacity={1} fill="#7c908250" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}

                    {activeChartTab === "vehicle" && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vehicleChartData.length > 0 ? vehicleChartData : [{ vehicle: "No data", fullName: "No data", Revenue: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(val) => `₹${val}`} />
                                <YAxis type="category" dataKey="vehicle" tickLine={false} axisLine={false} fontSize={11} width={100} />
                                <Tooltip
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Earnings Generated"]}
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        borderColor: "var(--border)",
                                        borderRadius: "1rem",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="Revenue" fill="#7c9082" radius={[0, 8, 8, 0]} maxBarSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {topVehicle && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/30 border border-border/80 px-4 py-2.5 text-xs">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-muted-foreground">Top-Earning Vehicle:</span>
                            <span className="font-bold text-foreground">{topVehicle.fullName}</span>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(topVehicle.Revenue)} Generated
                        </span>
                    </div>
                )}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-card p-5 shadow-xs md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Payment ID, Booking ID, Customer Name, Phone, Vehicle, Invoice #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-border/80 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden bg-background"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2 text-xs font-bold text-foreground bg-background">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-foreground focus:outline-hidden cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Paid / Settled</option>
                            <option value="CONFIRMED">Confirmed / Active</option>
                            <option value="PENDING">Pending Settlement</option>
                            <option value="CANCELLED">Cancelled / Failed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2 text-xs font-bold text-foreground bg-background">
                        <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-foreground focus:outline-hidden cursor-pointer"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="amount-desc">Amount (High to Low)</option>
                            <option value="amount-asc">Amount (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payments Content */}
            {sortedTransactions.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Receipt className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                        {transactionList.length === 0 ? "No payment records found" : "No matching payment transactions"}
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                        {transactionList.length === 0
                            ? "When customers book and pay for your rental bikes, your payment ledger and settlements will appear here."
                            : "Try adjusting your search query or status filter to find the transactions you're looking for."}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                        }}
                        className="mt-4 rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
                    {/* Desktop Table View */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-4">Transaction / ID</th>
                                    <th className="px-5 py-4">Booking</th>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Vehicle Model</th>
                                    <th className="px-5 py-4">Rental Dates</th>
                                    <th className="px-5 py-4">Customer Paid</th>
                                    <th className="px-5 py-4">Owner Earning</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {paginatedTransactions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-muted/20 group"
                                    >
                                        {/* Payment ID */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-foreground font-mono">
                                                #PAY-{item.paymentId}
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                                                Inv: {item.invoiceNumber}
                                            </div>
                                        </td>

                                        {/* Booking Ref */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono font-bold text-primary">
                                                #BR-{item.bookingId}
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                <UserIcon className="h-3 w-3 text-muted-foreground" />
                                                {item.customerName}
                                            </div>
                                            {item.customerPhone && (
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Phone className="h-2.5 w-2.5" />
                                                    {item.customerPhone}
                                                </div>
                                            )}
                                            {item.customerEmail && (
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[150px] truncate">
                                                    <Mail className="h-2.5 w-2.5" />
                                                    {item.customerEmail}
                                                </div>
                                            )}
                                        </td>

                                        {/* Vehicle */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                <Bike className="h-3.5 w-3.5 text-primary" />
                                                {item.bikeName}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {item.rentalDurationDays} Day(s) rental
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-1 text-foreground font-medium">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {formatDate(item.pickupDate)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                to {formatDate(item.returnDate)}
                                            </div>
                                        </td>

                                        {/* Customer Paid Amount */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-foreground">
                                                {formatCurrency(item.customerPaidAmount)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {item.paymentMethod || "Online"}
                                            </div>
                                        </td>

                                        {/* Owner Earning */}
                                        <td className="px-5 py-4">
                                            <div className="font-black text-primary dark:text-primary text-sm">
                                                {formatCurrency(item.ownerEarnings)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-semibold">
                                                Net Credited
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            {getStatusBadge(item.paymentStatus)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenReceipt(item)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-background border border-border/80 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted hover:border-primary/50 cursor-pointer shadow-2xs"
                                            >
                                                <Receipt className="h-3.5 w-3.5 text-primary" />
                                                <span>Breakdown</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="divide-y divide-border/60 md:hidden">
                        {paginatedTransactions.map((item) => (
                            <div key={item.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="font-mono text-xs font-bold text-foreground">
                                            #PAY-{item.paymentId}
                                        </span>
                                        <span className="ml-2 font-mono text-[10px] text-primary font-bold">
                                            #BR-{item.bookingId}
                                        </span>
                                        <p className="font-semibold text-foreground text-sm mt-0.5">
                                            {item.bikeName}
                                        </p>
                                    </div>
                                    {getStatusBadge(item.paymentStatus)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-xl border border-border/40">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Customer</span>
                                        <p className="font-semibold text-foreground">{item.customerName}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.customerPhone}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Rental Dates</span>
                                        <p className="font-medium text-foreground">{formatDate(item.pickupDate)}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.rentalDurationDays} Day(s)</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground">Customer Paid: </span>
                                        <span className="font-bold text-foreground">{formatCurrency(item.customerPaidAmount)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground">Owner Earning: </span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.ownerEarnings)}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleOpenReceipt(item)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                                >
                                    <Receipt className="h-3.5 w-3.5 text-primary" />
                                    <span>View Receipt & Fare Breakdown</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/80 p-4 bg-card">
                            <span className="text-xs text-muted-foreground">
                                Showing {(page - 1) * itemsPerPage + 1} to{" "}
                                {Math.min(page * itemsPerPage, sortedTransactions.length)} of{" "}
                                {sortedTransactions.length} records
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-xl border border-border/80 px-3 py-1.5 text-xs font-bold transition hover:bg-muted disabled:opacity-40 cursor-pointer"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-bold text-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-xl border border-border/80 px-3 py-1.5 text-xs font-bold transition hover:bg-muted disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Receipt & Detailed Breakdown Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-border/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                                        Official Rental Receipt & Settlement Details
                                    </span>
                                    <h3 className="text-lg font-bold text-foreground mt-0.5">
                                        Receipt #PAY-{selectedPaymentDetails?.paymentId || selectedItem.paymentId}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        Booking: #BR-{selectedItem.bookingId} | Inv: {selectedPaymentDetails?.invoiceNumber || selectedItem.invoiceNumber}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 text-xs">
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/80">
                                <span className="font-semibold text-muted-foreground">Transaction Status</span>
                                {getStatusBadge(selectedPaymentDetails?.paymentStatus || selectedItem.paymentStatus)}
                            </div>

                            {/* Customer & Ride info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 bg-muted/20 border border-border/60 rounded-2xl space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Customer Info</span>
                                    <p className="font-bold text-foreground text-sm">{selectedItem.customerName}</p>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-2.5 w-2.5" />
                                        {selectedItem.customerEmail || "No email"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-2.5 w-2.5" />
                                        {selectedItem.customerPhone || "No phone"}
                                    </p>
                                </div>
                                <div className="p-3.5 bg-muted/20 border border-border/60 rounded-2xl space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Vehicle Rented</span>
                                    <p className="font-bold text-foreground text-sm flex items-center gap-1">
                                        <Bike className="h-3.5 w-3.5 text-primary" />
                                        {selectedItem.bikeName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Rental Duration: <strong>{selectedItem.rentalDurationDays} Day(s)</strong>
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                        Insurance & Protection: Active
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-3.5 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pickup Timestamp:</span>
                                    <span className="font-bold text-foreground">{formatDateTime(selectedItem.pickupDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Return Timestamp:</span>
                                    <span className="font-bold text-foreground">{formatDateTime(selectedItem.returnDate)}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/40 pt-1.5">
                                    <span className="text-muted-foreground">Payment Mode / Reference:</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        {selectedPaymentDetails?.paymentMethod || selectedItem.paymentMethod || "Online Gateway"}
                                        {selectedItem.transactionId ? ` (${selectedItem.transactionId})` : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Financial breakdown */}
                            <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2.5">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Base Bike Rental Rate</span>
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(Number(selectedPaymentDetails?.baseRentalAmount ?? selectedItem.baseRentalAmount))}
                                    </span>
                                </div>
                                {Number(selectedPaymentDetails?.lateCharge ?? selectedItem.lateCharge) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Late Return Surcharge</span>
                                        <span className="font-semibold text-amber-500">
                                            + {formatCurrency(Number(selectedPaymentDetails?.lateCharge ?? selectedItem.lateCharge))}
                                        </span>
                                    </div>
                                )}
                                {Number(selectedPaymentDetails?.platformFeeAmount ?? selectedItem.platformFeeAmount) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Platform Facilitation Fee</span>
                                        <span className="font-semibold text-muted-foreground">
                                            {formatCurrency(Number(selectedPaymentDetails?.platformFeeAmount ?? selectedItem.platformFeeAmount))}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Customer Total Paid</span>
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(Number(selectedPaymentDetails?.finalAmount ?? selectedItem.customerPaidAmount))}
                                    </span>
                                </div>
                                <div className="border-t border-border/80 pt-2 flex justify-between items-baseline">
                                    <span className="font-bold text-foreground text-sm">Owner Net Earnings</span>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                                        {formatCurrency(Number(selectedItem.ownerEarnings))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-2 pt-2 border-t border-border/80 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    window.print();
                                }}
                                className="px-4 py-2 bg-background border border-border/80 hover:bg-muted text-foreground text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Print Receipt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
