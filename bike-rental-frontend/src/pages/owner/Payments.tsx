import { useState, useEffect } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { 
    CreditCard, 
    TrendingUp, 
    ArrowUpRight, 
    Calendar, 
    ArrowDownRight, 
    FileSpreadsheet, 
    FileDown, 
    AlertTriangle,
    IndianRupee,
    Briefcase,
    Bike,
    LineChart as ChartIcon
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

export default function OwnerPayments() {
    const { 
        earnings, 
        bookingRequests, 
        loading, 
        error, 
        fetchEarnings, 
        fetchBookingRequests 
    } = useOwnerStore();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("date-desc");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchEarnings(true);
        fetchBookingRequests(true);
    }, [fetchEarnings, fetchBookingRequests]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleRetry = () => {
        fetchEarnings(true);
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

    // Reset page to 1 if filters change
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, sortBy]);

    // --- Chart Data Aggregations ---
    const getChartsData = () => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // 1. Monthly Revenue
        const monthlyMap: { [key: string]: number } = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mName = monthNames[d.getMonth()];
            monthlyMap[mName] = 0;
        }
        
        bookingRequests.forEach(b => {
            if (b.bookingStatus === "COMPLETED" || b.bookingStatus === "APPROVED") {
                const dateObj = new Date(b.pickupDate);
                const mName = monthNames[dateObj.getMonth()];
                if (monthlyMap[mName] !== undefined) {
                    monthlyMap[mName] += b.rentalAmount;
                }
            }
        });

        const monthlyChartData = Object.keys(monthlyMap).map(k => ({
            month: k,
            Revenue: monthlyMap[k]
        }));

        // 2. Revenue Trend (Daily accumulated)
        const successBookings = [...bookingRequests]
            .filter(b => b.bookingStatus === "COMPLETED" || b.bookingStatus === "APPROVED")
            .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());
        
        let cumulative = 0;
        const trendChartData = successBookings.map(b => {
            cumulative += b.rentalAmount;
            return {
                date: new Date(b.pickupDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                "Total Revenue": cumulative
            };
        });

        // 3. Revenue by Listed Vehicles
        const vehicleMap: { [key: string]: number } = {};
        bookingRequests.forEach(b => {
            if (b.bookingStatus === "COMPLETED" || b.bookingStatus === "APPROVED") {
                vehicleMap[b.bikeName] = (vehicleMap[b.bikeName] || 0) + b.rentalAmount;
            }
        });

        const vehicleChartData = Object.keys(vehicleMap).map(k => ({
            vehicle: k.split(" ")[0], // short name
            Revenue: vehicleMap[k]
        }));

        return { monthlyChartData, trendChartData, vehicleChartData };
    };

    const { monthlyChartData, trendChartData, vehicleChartData } = getChartsData();

    // --- CSV Export Logic ---
    const exportCSV = () => {
        if (sorted.length === 0) {
            toast.error("No transaction records available to export.");
            return;
        }
        const headers = ["Date", "Booking ID", "Customer", "Amount (INR)", "Status"];
        const rows = sorted.map(b => 
            `"${b.pickupDate}","BR-${b.bookingId}","${b.customerName}",${b.rentalAmount},"${b.bookingStatus}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `owner_earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV report exported successfully!");
    };

    // --- PDF Export Placeholder ---
    const exportPDF = () => {
        toast.success("PDF generation initialized. Report document will be ready shortly!");
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toUpperCase()) {
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

    if (error && bookingRequests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-10 text-foreground">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-4">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold">Failed to Load Earnings</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                    {error || "An unexpected error occurred while communicating with the owner statistics API."}
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
        <div className="space-y-6 bg-background text-foreground min-h-screen pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Earnings & Payments</h2>
                    <p className="text-xs text-muted-foreground mt-1">Track payouts, daily revenues, and payment transaction logs for your rentals.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={exportCSV}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-card border border-border hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        type="button"
                        onClick={exportPDF}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/30 flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                        <FileDown className="h-4.5 w-4.5" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {loading && !earnings ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2 animate-pulse">
                            <div className="h-3 w-16 bg-muted rounded"></div>
                            <div className="h-6 w-24 bg-muted rounded"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Today</span>
                            <p className="text-lg font-black text-foreground">{formatCurrency(earnings?.today ?? 0)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Weekly</span>
                            <p className="text-lg font-black text-foreground">{formatCurrency(earnings?.weekly ?? 0)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Monthly</span>
                            <p className="text-lg font-black text-foreground">{formatCurrency(earnings?.monthly ?? 0)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Earnings</span>
                            <p className="text-lg font-black text-foreground">{formatCurrency(earnings?.total ?? 0)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs border-l-3 border-l-amber-500">
                            <span className="text-[10px] uppercase font-bold text-amber-600">Pending Payout</span>
                            <p className="text-lg font-black text-amber-500">{formatCurrency(earnings?.pendingPayments ?? 0)}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-4.5 space-y-1 shadow-xs border-l-3 border-l-emerald-500">
                            <span className="text-[10px] uppercase font-bold text-emerald-600">Completed Payout</span>
                            <p className="text-lg font-black text-emerald-500">{formatCurrency(earnings?.total ?? 0)}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Monthly Revenue Bar Chart */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[300px]">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-4.5 w-4.5 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Monthly Revenue</h3>
                    </div>
                    <div className="flex-1 w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData}>
                                <XAxis dataKey="month" stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <YAxis stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                                <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Cumulative Revenue Trend Area Chart */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[300px]">
                    <div className="flex items-center gap-1.5 mb-2">
                        <ChartIcon className="h-4.5 w-4.5 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Revenue Growth Trend</h3>
                    </div>
                    <div className="flex-1 w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendChartData.length > 0 ? trendChartData : [{ date: "No Data", "Total Revenue": 0 }]}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <YAxis stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                                <Area type="monotone" dataKey="Total Revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Revenue by Bike Bar Chart */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[300px]">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Bike className="h-4.5 w-4.5 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Revenue by Listed Fleet</h3>
                    </div>
                    <div className="flex-1 w-full h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vehicleChartData.length > 0 ? vehicleChartData : [{ vehicle: "No Data", Revenue: 0 }]}>
                                <XAxis dataKey="vehicle" stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <YAxis stroke="currentColor" style={{ opacity: 0.6, fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                                <Bar dataKey="Revenue" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by customer name, vehicle model, or Booking ID..."
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
                                <option value="amount-desc">Amount (High to Low)</option>
                                <option value="amount-asc">Amount (Low to High)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
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

            {/* Transaction Ledger Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-border">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Transaction Ledger</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                                <th className="p-4">Date</th>
                                <th className="p-4">Booking ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Vehicle Model</th>
                                <th className="p-4">Rental Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && bookingRequests.length === 0 ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4"><div className="h-3 w-16 bg-muted rounded"></div></td>
                                        <td className="p-4"><div className="h-3 w-12 bg-muted rounded"></div></td>
                                        <td className="p-4"><div className="h-3 w-28 bg-muted rounded"></div></td>
                                        <td className="p-4"><div className="h-3 w-32 bg-muted rounded"></div></td>
                                        <td className="p-4"><div className="h-3 w-16 bg-muted rounded"></div></td>
                                        <td className="p-4"><div className="h-3.5 w-20 bg-muted rounded"></div></td>
                                    </tr>
                                ))
                            ) : paginated.length > 0 ? (
                                paginated.map((booking) => (
                                    <tr key={booking.bookingId} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4 text-muted-foreground">{booking.pickupDate}</td>
                                        <td className="p-4 font-mono font-bold text-foreground">BR-{booking.bookingId}</td>
                                        <td className="p-4 text-foreground font-medium">{booking.customerName}</td>
                                        <td className="p-4 text-foreground font-medium">{booking.bikeName}</td>
                                        <td className="p-4 font-bold text-foreground">{formatCurrency(booking.rentalAmount)}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusBadgeClass(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Briefcase className="h-8 w-8 text-muted-foreground/45" />
                                            <p className="font-bold text-sm">No Payout Records found</p>
                                            <p className="text-xs">Try selecting a different filter option or clear search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex justify-center bg-card">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            showJumpToPage={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
