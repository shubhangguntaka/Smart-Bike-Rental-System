import { useEffect } from "react";
import { useOwnerStore } from "../../store/ownerStore";
import { Bike, CheckCircle, Clock, Calendar } from "lucide-react";

const OwnerStatistics = () => {
    const { dashboard, loading, fetchDashboard } = useOwnerStore();

    useEffect(() => {
        if (!dashboard) {
            fetchDashboard();
        }
    }, [dashboard, fetchDashboard]);

    const statsConfig = [
        {
            title: "Total Bikes",
            value: dashboard?.totalBikes ?? 0,
            icon: Bike,
            color: "text-emerald-500 bg-emerald-500/10",
            description: "Total fleet size listed"
        },
        {
            title: "Available Bikes",
            value: dashboard?.availableBikes ?? 0,
            icon: CheckCircle,
            color: "text-blue-500 bg-blue-500/10",
            description: "Ready to be booked"
        },
        {
            title: "Booked Bikes",
            value: dashboard?.bookedBikes ?? 0,
            icon: Clock,
            color: "text-amber-500 bg-amber-500/10",
            description: "Currently on active trips"
        },
        {
            title: "Total Bookings",
            value: dashboard?.totalBookings ?? 0,
            icon: Calendar,
            color: "text-indigo-500 bg-indigo-500/10",
            description: "All-time bookings received"
        }
    ];

    if (loading && !dashboard) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-24 bg-muted rounded"></div>
                            <div className="h-10 w-10 bg-muted rounded-xl"></div>
                        </div>
                        <div className="h-8 w-16 bg-muted rounded mt-4"></div>
                        <div className="h-3 w-32 bg-muted rounded mt-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.title}
                        className="rounded-2xl border border-border bg-card shadow-xs p-6 hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {item.title}
                                </p>
                                <h2 className="text-3xl font-black mt-2 text-foreground tracking-tight group-hover:scale-102 transition-transform duration-200">
                                    {item.value}
                                </h2>
                            </div>
                            <div className={`p-3 rounded-xl transition duration-300 ${item.color} group-hover:scale-110`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-3 font-medium">
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default OwnerStatistics;