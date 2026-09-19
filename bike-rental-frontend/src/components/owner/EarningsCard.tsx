import { useEffect } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { TrendingUp, DollarSign, Calendar, Eye, IndianRupee } from "lucide-react";

const EarningsCard = () => {
    const earnings = useOwnerStore((s) => s.earnings);
    const loading = useOwnerStore((s) => s.loading);
    const fetchEarnings = useOwnerStore((s) => s.fetchEarnings);

    useEffect(() => {
        if (!earnings) {
            fetchEarnings();
        }
    }, [earnings, fetchEarnings]);

    const formatCurrency = (val?: number) => {
        if (val === undefined || val === null) return "₹0";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    if (loading && !earnings) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-4 w-28 bg-muted rounded"></div>
                        <div className="h-10 w-44 bg-muted rounded"></div>
                    </div>
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-16 bg-muted rounded"></div>
                            <div className="h-5 w-24 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const total = earnings?.total ?? 0;
    const today = earnings?.today ?? 0;
    const weekly = earnings?.weekly ?? 0;
    const monthly = earnings?.monthly ?? 0;
    const pending = earnings?.pendingPayments ?? 0;

    return (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Header Block with primary color accent */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 sm:p-7 lg:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80">
                            Total Earnings (All-time)
                        </p>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mt-1 sm:mt-2 tracking-tight flex items-center gap-1 break-words">
                            {formatCurrency(total)}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-white/70 mt-1 font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-300 shrink-0" />
                            <span className="truncate">Net earnings after platform commissions</span>
                        </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-white/10 rounded-2xl backdrop-blur-xs shadow-inner shrink-0">
                        <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* Detailed breakdowns */}
            <div className="p-4 sm:p-6 lg:p-8 bg-card grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
                <div className="rounded-xl bg-muted/20 sm:bg-transparent p-3 sm:p-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                        Today
                    </p>
                    <h3 className="text-base sm:text-xl font-bold text-foreground mt-0.5 sm:mt-1 truncate">
                        {formatCurrency(today)}
                    </h3>
                </div>
                <div className="rounded-xl bg-muted/20 sm:bg-transparent p-3 sm:p-0 sm:border-l sm:border-border sm:pl-6">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                        This Week
                    </p>
                    <h3 className="text-base sm:text-xl font-bold text-foreground mt-0.5 sm:mt-1 truncate">
                        {formatCurrency(weekly)}
                    </h3>
                </div>
                <div className="rounded-xl bg-muted/20 sm:bg-transparent p-3 sm:p-0 sm:border-l sm:border-border sm:pl-6">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                        This Month
                    </p>
                    <h3 className="text-base sm:text-xl font-bold text-foreground mt-0.5 sm:mt-1 truncate">
                        {formatCurrency(monthly)}
                    </h3>
                </div>
                <div className="rounded-xl bg-muted/20 sm:bg-transparent p-3 sm:p-0 sm:border-l sm:border-border sm:pl-6">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                        Pending Clearance
                    </p>
                    <h3 className="text-base sm:text-xl font-bold text-amber-500 mt-0.5 sm:mt-1 truncate">
                        {formatCurrency(pending)}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default EarningsCard;