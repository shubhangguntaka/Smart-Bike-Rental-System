import { Link } from "react-router-dom";
import { Bike, IndianRupee, ArrowRight, Search, CalendarCheck, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import useAuth from "@/hooks/useAuth";

export default function MarketplaceSection() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.toUpperCase();

  const listBikePath = isAuthenticated
    ? (role === "OWNER" ? ROUTES.OWNER.ADD_BIKE : "/owner/add-bike")
    : `${ROUTES.REGISTER}?role=OWNER`;

  return (
    <section className="py-20 bg-muted/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Two-Sided Mobility Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            One Platform. Two Ways to Ride.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Whether you need a reliable bike for your daily commute or own an unused bike that could be generating passive income, our platform connects you directly.
          </p>
        </div>

        {/* Two Major Marketplace Cards */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Rent a Bike (For Renters) */}
          <div className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/50 shadow-md hover:shadow-2xl transition-all duration-300 text-left overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="space-y-6">
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
                  <Bike className="h-7 w-7" />
                </div>
                <span className="text-xs font-mono font-bold text-primary uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  For Renters
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                  Looking for a Ride?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Find bikes available near you, choose the one that fits your journey, and book it with ease. No long queues, no excessive paperwork.
                </p>
              </div>

              {/* Step Flow Pipeline */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Your 4-Step Journey
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">1. Explore</span>
                    <span className="text-[10px] text-muted-foreground">Nearby bikes</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">2. Choose</span>
                    <span className="text-[10px] text-muted-foreground">Best match</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">3. Book</span>
                    <span className="text-[10px] text-muted-foreground">Instant slot</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-primary block">4. Ride</span>
                    <span className="text-[10px] text-muted-foreground">GPS tracking</span>
                  </div>
                </div>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Interactive map search by location & price</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time GPS ride telemetry & digital QR unlock</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <Link
                to={ROUTES.BIKES}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
              >
                <span>Explore Bikes</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Rent Out Your Bike (For Owners) */}
          <div className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-emerald-500/50 shadow-md hover:shadow-2xl transition-all duration-300 text-left overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="space-y-6">
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform duration-200">
                  <IndianRupee className="h-7 w-7" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  For Bike Owners
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-emerald-500 transition-colors">
                  Have a Bike? Make It Earn.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  List your bike when you're not using it and earn steady income by sharing it with verified riders who need transport.
                </p>
              </div>

              {/* Step Flow Pipeline */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Your 4-Step Earning Flow
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">1. List</span>
                    <span className="text-[10px] text-muted-foreground">Upload specs</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">2. Schedule</span>
                    <span className="text-[10px] text-muted-foreground">Set free times</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-foreground block">3. Approve</span>
                    <span className="text-[10px] text-muted-foreground">Accept rider</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border/50">
                    <span className="font-bold text-emerald-500 block">4. Earn</span>
                    <span className="text-[10px] text-muted-foreground">Direct payouts</span>
                  </div>
                </div>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Full KYC check on every rider before booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Real-time GPS ride monitoring to track your asset</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <Link
                to={listBikePath}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
              >
                <span>List Your Bike</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
