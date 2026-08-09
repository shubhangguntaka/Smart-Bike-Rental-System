import { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useOwnerStore } from "../../store/ownerStore";
import OwnerStatistics from "../../components/owner/OwnerStatistics";
import EarningsCard from "../../components/owner/EarningsCard";
import BookingRequestCard from "../../components/owner/BookingRequestCard";
import { 
    ShieldCheck, 
    ShieldAlert, 
    PlusCircle, 
    FileText, 
    CreditCard, 
    User, 
    ListTodo, 
    Clock, 
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    Inbox
} from "lucide-react";

export default function OwnerDashboard() {
    const { user } = useAuth();
    const dashboard = useOwnerStore((s) => s.dashboard);
    const loading = useOwnerStore((s) => s.loading);
    const error = useOwnerStore((s) => s.error);
    const fetchDashboard = useOwnerStore((s) => s.fetchDashboard);

    useEffect(() => {
        fetchDashboard();
        const timer = setInterval(() => {
            fetchDashboard(true);
        }, 30000);
        return () => clearInterval(timer);
    }, [fetchDashboard]);

    if (loading && !dashboard) {
        return (
            <div className="space-y-8 pb-10 text-foreground animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs">
                    <div className="flex items-center gap-4 sm:gap-6 w-full">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted shrink-0"></div>
                        <div className="space-y-2 w-1/2">
                            <div className="h-6 w-48 bg-muted rounded"></div>
                            <div className="h-4 w-64 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                                    <div className="h-3 w-16 bg-muted rounded"></div>
                                    <div className="h-8 w-24 bg-muted rounded"></div>
                                </div>
                            ))}
                        </div>
                        {/* Earnings Skeleton */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs h-48 bg-muted/40"></div>
                        {/* Bookings Skeleton */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs h-64 bg-muted/40"></div>
                    </div>
                    <div className="space-y-8">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs h-32 bg-muted/40"></div>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs h-48 bg-muted/40"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-10">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-4">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Failed to Load Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                    {typeof error === "string" ? error : "An unexpected error occurred while communicating with the owner dashboard API."}
                </p>
                <button
                    type="button"
                    onClick={() => fetchDashboard(true)}
                    className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/30"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-10">
                <div className="p-4 bg-muted text-muted-foreground rounded-full mb-4">
                    <Inbox className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground">No Dashboard Data Available</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                    We couldn't retrieve any fleet statistics or profile records for this account. Make sure you are registered as an owner.
                </p>
                <button
                    type="button"
                    onClick={() => fetchDashboard(true)}
                    className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                    Refresh
                </button>
            </div>
        );
    }

    // Extract first name for a warmer welcome message
    const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Owner";
    
    // Get initials for avatar fallback
    const getInitials = () => {
        if (user?.fullName) {
            const parts = user.fullName.split(" ");
            return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
        }
        return "OW";
    };

    const isAadhaarVerified = dashboard?.aadhaarVerified ?? false;
    const isRcVerified = dashboard?.rcVerified ?? false;

    // Derived recent activities
    const activities = [
        {
            id: 1,
            title: "Aadhaar Verification Status",
            desc: isAadhaarVerified 
                ? "Identity verified successfully under Aadhaar record."
                : "Aadhaar verification is pending. Please upload card.",
            time: isAadhaarVerified ? "Activated" : "Action Needed",
            icon: isAadhaarVerified ? ShieldCheck : ShieldAlert,
            color: isAadhaarVerified ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10"
        },
        {
            id: 2,
            title: "RC Verification Status",
            desc: isRcVerified 
                ? "Vehicle Registration Certificate (RC) approved."
                : "RC document upload needed to list new vehicles.",
            time: isRcVerified ? "Approved" : "Pending RC",
            icon: isRcVerified ? ShieldCheck : ShieldAlert,
            color: isRcVerified ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10"
        },
        {
            id: 3,
            title: "Payout Account Configured",
            desc: "Razorpay escrow payouts mapped to primary bank account.",
            time: "2 days ago",
            icon: CreditCard,
            color: "text-indigo-500 bg-indigo-500/10"
        }
    ];

    return (
        <div className="space-y-8 pb-10 text-foreground">
            {/* 1. Welcome Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    {/* Owner Avatar */}
                    {user?.profileImage ? (
                        <img 
                            src={user.profileImage} 
                            alt={user.fullName || "Owner Avatar"} 
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-border shadow-sm shrink-0"
                        />
                    ) : (
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl sm:text-2xl font-black border border-primary/20 shadow-inner shrink-0 uppercase">
                            {getInitials()}
                        </div>
                    )}
                    
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                Welcome back, {firstName}! 👋
                            </h1>
                            {isAadhaarVerified && isRcVerified && (
                                <span className="p-0.5 rounded-full bg-green-500/10 text-green-500" title="Fully Verified Account">
                                    <ShieldCheck className="h-5 w-5" />
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                            Here's what is happening with your bike rental fleet today.
                        </p>
                    </div>
                </div>

                {/* Quick Summary Badge */}
                <div className="flex items-center gap-3 bg-muted/40 border border-border/80 px-4 py-3 rounded-2xl md:self-center self-start relative z-10 shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Fleet Status</p>
                        <p className="text-xs font-bold text-foreground">Active & Earning</p>
                    </div>
                </div>

                {/* Subtle Decorative Gradient Glow */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Main Grid: Statistics & Booking Details vs Quick Actions & Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Stats, Earnings & Booking requests (Takes 2 columns on large screen) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 2. Statistics Cards */}
                    <OwnerStatistics />

                    {/* 3. Earnings Card */}
                    <EarningsCard />

                    {/* 5. Pending Booking Requests */}
                    <BookingRequestCard />
                </div>

                {/* Right Side: Verification status, Quick actions & Recent Activities (Takes 1 column) */}
                <div className="space-y-8">
                    
                    {/* 4. Verification Status Panel */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-1.5">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Verification Status
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Aadhaar Verification Row */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">Aadhaar Identity</p>
                                    <p className="text-[10px] text-muted-foreground">National ID check</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isAadhaarVerified 
                                            ? "bg-green-500/10 text-green-500" 
                                            : "bg-amber-500/10 text-amber-500 animate-pulse"
                                    }`}>
                                        {isAadhaarVerified ? "VERIFIED" : "PENDING"}
                                    </span>
                                </div>
                            </div>

                            {/* RC Verification Row */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">Registration Certificate (RC)</p>
                                    <p className="text-[10px] text-muted-foreground">Vehicle registry checks</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isRcVerified 
                                            ? "bg-green-500/10 text-green-500" 
                                            : "bg-amber-500/10 text-amber-500"
                                    }`}>
                                        {isRcVerified ? "VERIFIED" : "ACTION NEEDED"}
                                    </span>
                                </div>
                            </div>

                            {/* Verification CTA */}
                            {(!isAadhaarVerified || !isRcVerified) && (
                                <Link 
                                    to="/bike-verification"
                                    className="w-full py-2.5 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none"
                                >
                                    <span>Complete Verification</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 6. Quick Actions Grid */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                        <h2 className="text-base font-bold text-foreground mb-4">
                            Quick Actions
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <Link 
                                to="/owner/bikes" 
                                className="flex flex-col items-center justify-center p-4 bg-muted/20 hover:bg-primary/10 border border-border rounded-xl text-center transition-all duration-200 group focus:outline-none"
                            >
                                <PlusCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold mt-2 text-foreground">Add Bike</span>
                            </Link>

                            <Link 
                                to="/owner/bookings" 
                                className="flex flex-col items-center justify-center p-4 bg-muted/20 hover:bg-primary/10 border border-border rounded-xl text-center transition-all duration-200 group focus:outline-none"
                            >
                                <ListTodo className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold mt-2 text-foreground">Bookings</span>
                            </Link>

                            <Link 
                                to="/bike-verification" 
                                className="flex flex-col items-center justify-center p-4 bg-muted/20 hover:bg-primary/10 border border-border rounded-xl text-center transition-all duration-200 group focus:outline-none"
                            >
                                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold mt-2 text-foreground">Upload Docs</span>
                            </Link>

                            <Link 
                                to="/owner/payments" 
                                className="flex flex-col items-center justify-center p-4 bg-muted/20 hover:bg-primary/10 border border-border rounded-xl text-center transition-all duration-200 group focus:outline-none"
                            >
                                <CreditCard className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold mt-2 text-foreground">Earnings Logs</span>
                            </Link>

                            <Link 
                                to="/owner/profile" 
                                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-muted/20 hover:bg-primary/10 border border-border rounded-xl text-center transition-all duration-200 group focus:outline-none"
                            >
                                <User className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-foreground">Manage Owner Profile</span>
                            </Link>
                        </div>
                    </div>

                    {/* 7. Recent Activity Section */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <Clock className="h-5 w-5 text-primary" />
                                Recent Activity
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            {activities.map((act) => {
                                const Icon = act.icon;
                                return (
                                    <div key={act.id} className="flex gap-3 items-start text-xs border-l border-border pl-4 relative ml-2">
                                        {/* Dynamic bullet indicator */}
                                        <div className={`absolute -left-3 top-0.5 p-1 rounded-full border border-border ${act.color}`}>
                                            {Icon ? <Icon className="h-3 w-3" /> : null}
                                        </div>
                                        
                                        <div className="space-y-0.5">
                                            <h4 className="font-bold text-foreground">
                                                {act.title}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {act.desc}
                                            </p>
                                            <span className="text-[9px] font-semibold text-muted-foreground/70 block pt-0.5">
                                                {act.time}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
