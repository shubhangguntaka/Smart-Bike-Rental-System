import { Activity, ShieldCheck, BatteryCharging, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectIntroSection() {
  const stats = [
    {
      value: "100%",
      label: "Eco-Friendly Electric",
      description: "Zero tailpipe emissions and sustainable urban travel",
      icon: BatteryCharging,
      color: "text-emerald-500",
    },
    {
      value: "5 sec",
      label: "Live Telemetry Interval",
      description: "Continuous real-time GPS coordinates and route history",
      icon: Activity,
      color: "text-cyan-500",
    },
    {
      value: "100%",
      label: "Verified Fleet",
      description: "Aadhaar, DL, and RC document checks for full compliance",
      icon: ShieldCheck,
      color: "text-primary",
    },
    {
      value: "24/7",
      label: "Automated Bookings",
      description: "On-demand reservations with seamless digital access",
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-transparent relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A Smarter Way to Rent & Ride
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Engineered to transform urban mobility. Our Smart Bike Rental System unifies IoT bike tracking, customer booking workflows, owner earnings analytics, and strict administrative oversight into one unified digital platform.
          </p>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/70 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-muted/60 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {item.value}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Link to About */}
        <div className="mt-10 text-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span>Learn more about our system architecture & mission</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
