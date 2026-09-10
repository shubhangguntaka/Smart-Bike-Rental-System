import { Link } from "react-router-dom";
import { Bike, FileText, CheckCheck, KeyRound, IndianRupee, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function OwnerEarningsSection() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.toUpperCase();

  const startEarningPath = isAuthenticated
    ? (role === "OWNER" ? ROUTES.OWNER.ADD_BIKE : "/owner/add-bike")
    : `${ROUTES.REGISTER}?role=OWNER`;

  const flowSteps = [
    {
      step: "01",
      label: "YOUR BIKE",
      tagline: "Parked or idle",
      description: "Sitting unused in your garage during workdays or weekends.",
      icon: Bike,
    },
    {
      step: "02",
      label: "LIST IT",
      tagline: "2-minute setup",
      description: "Set your per-hour or per-day rate and calendar availability.",
      icon: FileText,
    },
    {
      step: "03",
      label: "GET BOOKINGS",
      tagline: "Verified riders",
      description: "Receive instant rental requests from Aadhaar-verified riders.",
      icon: CheckCheck,
    },
    {
      step: "04",
      label: "HAND OVER",
      tagline: "QR check-in",
      description: "Hand over keys with contactless digital QR code confirmation.",
      icon: KeyRound,
    },
    {
      step: "05",
      label: "EARN",
      tagline: "Direct payouts",
      description: "Receive rental earnings deposited directly into your bank account.",
      icon: IndianRupee,
    },
  ];

  return (
    <section className="py-20 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <IndianRupee className="h-4 w-4" />
            <span>Turn Idle Time Into Income</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Your Bike Doesn't Have to Sit Idle.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            When you're not riding, let someone else ride — and earn passive income from your bike. Full ownership control, GPS protection, and verified customers.
          </p>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="mt-16 relative">
          {/* Subtle Connecting Line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-border via-emerald-500/40 to-emerald-500 -translate-y-8 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === flowSteps.length - 1;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col p-6 rounded-2xl bg-card/80 backdrop-blur-md border ${
                    isLast
                      ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                      : "border-border/80 hover:border-emerald-500/40"
                  } transition-all duration-200 text-left group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      STEP {step.step}
                    </span>
                    <div
                      className={`p-3 rounded-xl ${
                        isLast
                          ? "bg-emerald-500 text-white"
                          : "bg-muted/70 text-foreground group-hover:text-emerald-500"
                      } transition-colors`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3
                    className={`text-sm font-extrabold tracking-wide ${
                      isLast ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-[11px] font-semibold text-primary/80 uppercase mt-1">
                    {step.tagline}
                  </p>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earnings Callout Box & CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h4 className="text-base sm:text-lg font-bold text-foreground">
                Earn ₹8,000 – ₹25,000+ every month
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Maintain 100% control over when your bike is available. Set custom hourly or daily rates, approve renters, and track every ride with real-time GPS.
            </p>
          </div>

          <Link
            to={startEarningPath}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98] shrink-0 transition-all"
          >
            <span>Start Earning</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
