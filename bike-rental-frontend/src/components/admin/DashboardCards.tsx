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
  iconColorClass?: string;
  iconBgClass?: string;
}

export default function DashboardCards({
  stats,
}: DashboardCardsProps) {
  const cards: DashboardCard[] = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered customers",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Owners",
      value: stats.totalOwners,
      icon: UserRoundCog,
      description: "Registered bike owners",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Bikes",
      value: stats.totalBikes,
      icon: Bike,
      description: "Bikes in the system",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
      description: "All bookings to date",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      description: "Recorded payments",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      description: "Currently active accounts",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Active Bikes",
      value: stats.activeBikes,
      icon: Bike,
      description: "Currently active bikes",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: CalendarCheck,
      description: "Currently ongoing rides",
      iconColorClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      title: "Pending Bookings",
      value: stats.pendingBookings,
      icon: Clock3,
      description: "Awaiting confirmation",
      iconColorClass: "text-amber-500",
      iconBgClass: "bg-amber-500/10",
    },
    {
      title: "Completed Bookings",
      value: stats.completedBookings,
      icon: CheckCircle2,
      description: "Successfully finished",
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-500/10",
    },
    {
      title: "Cancelled Bookings",
      value: stats.cancelledBookings,
      icon: XCircle,
      description: "Cancelled or voided",
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
          <article
            key={card.title}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                  {card.value.toLocaleString()}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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
          </article>
        );
      })}
    </section>
  );
}