import { Link } from "react-router-dom";
import type { AdminDashboard } from "@/types/admin";
import {
  Bike,
  CalendarCheck,
  CreditCard,
  Users,
  UserRoundCog,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

interface DashboardCardsProps {
  stats: AdminDashboard;
}

interface DashboardCard {
  title: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
  description: string;
  to: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export default function DashboardCards({
  stats,
}: DashboardCardsProps) {
  const cards: DashboardCard[] = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: "Registered customers",
      to: "/admin/users",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Owners",
      value: stats?.totalOwners ?? 0,
      icon: UserRoundCog,
      description: "Registered bike owners",
      to: "/admin/owners",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Bikes",
      value: stats?.totalBikes ?? 0,
      icon: Bike,
      description: "Bikes in the system",
      to: "/admin/bikes",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      description: "All bookings to date",
      to: "/admin/bookings",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Payments",
      value: stats?.totalPayments ?? 0,
      icon: CreditCard,
      description: "Recorded payments",
      to: "/admin/payments",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: Users,
      description: "Currently active accounts",
      to: "/admin/users?status=ACTIVE",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Active Bikes",
      value: stats?.activeBikes ?? 0,
      icon: Bike,
      description: "Currently active bikes",
      to: "/admin/bikes?status=AVAILABLE",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Active Bookings",
      value: stats?.activeBookings ?? 0,
      icon: CalendarCheck,
      description: "Currently ongoing rides",
      to: "/admin/bookings?status=ACTIVE",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings ?? 0,
      icon: Clock3,
      description: "Awaiting confirmation",
      to: "/admin/bookings?status=PENDING",
      iconColorClass: "text-amber-500",
      iconBgClass: "bg-amber-500/10",
    },
    {
      title: "Completed Bookings",
      value: stats?.completedBookings ?? 0,
      icon: CheckCircle2,
      description: "Successfully finished",
      to: "/admin/bookings?status=COMPLETED",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Cancelled Bookings",
      value: stats?.cancelledBookings ?? 0,
      icon: XCircle,
      description: "Cancelled or voided",
      to: "/admin/bookings?status=CANCELLED",
      iconColorClass: "text-destructive",
      iconBgClass: "bg-destructive/10",
    },
  ];

  return (
    <section
      aria-label="Admin dashboard statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.title}
            to={card.to}
            className="group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer block"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {card.title}
                  </p>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground/50 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                  {(card.value ?? 0).toLocaleString()}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                  card.iconBgClass ?? "bg-primary/10"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    card.iconColorClass ?? "text-primary"
                  }`}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}