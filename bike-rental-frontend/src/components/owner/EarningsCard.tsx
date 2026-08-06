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
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                            Total Earnings (All-time)
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-black mt-2 tracking-tight flex items-center gap-1">
                            {formatCurrency(total)}
                        </h1>
                        <p className="text-xs text-white/70 mt-1 font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-300" />
                            Net earnings after platform commissions
                        </p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xs shadow-inner">
                        <IndianRupee className="h-8 w-8 text-white" />
                    </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Detailed breakdowns */}
            <div className="p-6 sm:p-8 bg-card grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="pt-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Today
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                        {formatCurrency(today)}
                    </h3>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        This Week
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                        {formatCurrency(weekly)}
                    </h3>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        This Month
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                        {formatCurrency(monthly)}
                    </h3>
                </div>
                <div className="pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Pending Clearance
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-amber-500 mt-1">
                        {formatCurrency(pending)}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default EarningsCard;