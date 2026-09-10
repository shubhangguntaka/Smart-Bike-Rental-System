import {
  Bike,
  MapPin,
  CalendarCheck,
  Navigation,
  ShieldCheck,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      title: "Bike Discovery",
      subtitle: "Near You",
      description: "Find bikes available for rent near your location. Filter by model, hourly/daily rates, specifications, and availability.",
      icon: Bike,
      iconColor: "text-blue-500",
      bullets: ["Real-time availability status", "Search by brand & type", "Transparent pricing"],
    },
    {
      title: "Interactive Map",
      subtitle: "Geo-Spatial Navigation",
      description: "Explore bikes and pickup stations visually with interactive Leaflet map markers and turn-by-turn route directions.",
      icon: MapPin,
      iconColor: "text-emerald-500",
      bullets: ["Station hub markers", "Proximity radius search", "Walking directions"],
    },
    {
      title: "Easy Booking",
      subtitle: "Fast Reservation",
      description: "Choose your pickup dates, rental hours, and confirm reservation instantly with automated owner notification.",
      icon: CalendarCheck,
      iconColor: "text-purple-500",
      bullets: ["Instant slot reservation", "Flexible extension option", "Booking history tracking"],
    },
    {
      title: "Live Ride Tracking",
      subtitle: "GPS Telemetry",
      description: "Track active journeys in real time with continuous GPS updates, speed calculations, and traveled route polyline maps.",
      icon: Navigation,
      iconColor: "text-cyan-500",
      bullets: ["Real-time coordinate stream", "Route polyline breadcrumbs", "Odometer & duration tracker"],
    },
    {
      title: "Secure Verification",
      subtitle: "KYC Compliance",
      description: "Comprehensive document verification for Aadhaar cards, Driving Licenses, and vehicle RC documentation before riding.",
      icon: ShieldCheck,
      iconColor: "text-amber-500",
      bullets: ["Customer DL verification", "Owner RC document check", "Admin audit approval"],
    },
    {
      title: "Secure Payments",
      subtitle: "Razorpay Gateway",
      description: "Complete fast, protected rental payments via UPI, Debit/Credit cards, and NetBanking in Razorpay Test Mode.",
      icon: CreditCard,
      iconColor: "text-rose-500",
      bullets: ["Instant payment settlement", "Automated GST tax invoice", "Transparent refund processing"],
    },
    {
      title: "Owner Earnings",
      subtitle: "Monetize Idle Assets",
      description: "Track gross and net rental earnings, view payout schedules, and monitor bike return condition with full ledger logs.",
      icon: IndianRupee,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bullets: ["Earnings breakdown ledger", "Direct bank withdrawals", "Utilization analytics"],
    },
    {
      title: "Smart Dashboard",
      subtitle: "Role-Based Portals",
      description: "Dedicated control panels for Riders, Bike Owners, and Admins to manage active rentals, fleet health, and support.",
      icon: LayoutDashboard,
      iconColor: "text-indigo-500",
      bullets: ["Rider booking center", "Owner fleet manager", "Admin governance panel"],
    },
  ];

  return (
    <section className="py-20 bg-muted/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Built for Smooth, Reliable Bike Rentals
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every tool required to connect riders with bike owners safely, securely, and transparently.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-muted/60 border border-border/60 group-hover:scale-105 transition-transform">
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {feature.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
                  {feature.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
