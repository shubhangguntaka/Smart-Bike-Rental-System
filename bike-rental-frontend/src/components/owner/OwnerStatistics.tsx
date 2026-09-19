import { useEffect } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { Bike, CheckCircle, Clock, Calendar } from "lucide-react";

const OwnerStatistics = () => {
    const dashboard = useOwnerStore((s) => s.dashboard);
    const loading = useOwnerStore((s) => s.loading);
    const fetchDashboard = useOwnerStore((s) => s.fetchDashboard);

    useEffect(() => {
        fetchDashboard(true);
    }, [fetchDashboard]);

    const totalBikes = dashboard?.totalBikes ?? 0;
    const availableBikes = dashboard?.availableBikes ?? 0;
    const bookedBikes = dashboard?.bookedBikes ?? 0;
    const totalBookings = dashboard?.totalBookings ?? 0;

    const statsConfig = [
        {
            title: "Total Bikes",
            value: totalBikes,
            icon: Bike,
            color: "text-emerald-500 bg-emerald-500/10",
            description: "Total fleet size listed"
        },
        {
            title: "Available Bikes",
            value: availableBikes,
            icon: CheckCircle,
            color: "text-blue-500 bg-blue-500/10",
            description: "Ready to be booked"
        },
        {
            title: "Booked Bikes",
            value: bookedBikes,
            icon: Clock,
            color: "text-amber-500 bg-amber-500/10",
            description: "Currently on active trips"
        },
        {
            title: "Total Bookings",
            value: totalBookings,
            icon: Calendar,
            color: "text-indigo-500 bg-indigo-500/10",
            description: "All-time bookings received"
        }
    ];

    if (loading && !dashboard) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-20 sm:w-24 bg-muted rounded"></div>
                            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-muted rounded-xl"></div>
                        </div>
                        <div className="h-7 sm:h-8 w-14 sm:w-16 bg-muted rounded mt-3 sm:mt-4"></div>
                        <div className="h-3 w-28 sm:w-32 bg-muted rounded mt-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {statsConfig.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.title}
                        className="rounded-2xl border border-border bg-card shadow-xs p-4 sm:p-6 hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                                    {item.title}
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-black mt-1.5 sm:mt-2 text-foreground tracking-tight group-hover:scale-102 transition-transform duration-200">
                                    {item.value}
                                </h2>
                            </div>
                            <div className={`p-2.5 sm:p-3 rounded-xl transition duration-300 ${item.color} group-hover:scale-110 shrink-0`}>
                                {Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5" /> : null}
                            </div>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-2.5 sm:mt-3 font-medium truncate">
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default OwnerStatistics;