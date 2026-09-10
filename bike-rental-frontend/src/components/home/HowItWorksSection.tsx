import { useState } from "react";
import { Search, Bike, CalendarCheck, Navigation, CheckCircle, PlusCircle, Calendar, CheckSquare, Key, IndianRupee } from "lucide-react";

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"riders" | "owners">("riders");

  const riderSteps = [
    {
      step: "01",
      title: "Explore",
      tagline: "Find Nearby Bikes",
      description: "Search bikes listed by local owners on the interactive map or catalog.",
      icon: Search,
    },
    {
      step: "02",
      title: "Choose",
      tagline: "Compare & Select",
      description: "Pick the right model, specs, hourly/daily rates, and pickup location.",
      icon: Bike,
    },
    {
      step: "03",
      title: "Request",
      tagline: "Instant Booking",
      description: "Submit your rental timeframe and complete secure Razorpay checkout.",
      icon: CalendarCheck,
    },
    {
      step: "04",
      title: "Ride",
      tagline: "Live GPS Tracking",
      description: "Unlock with QR code and enjoy your ride with live route tracking.",
      icon: Navigation,
    },
    {
      step: "05",
      title: "Return",
      tagline: "Quick Hand-off",
      description: "Return the bike to the agreed station and download your receipt.",
      icon: CheckCircle,
    },
  ];

  const ownerSteps = [
    {
      step: "01",
      title: "List Your Bike",
      tagline: "Upload Specs",
      description: "Add your bike photos, model specifications, RC documents, and hourly rates.",
      icon: PlusCircle,
    },
    {
      step: "02",
      title: "Set Availability",
      tagline: "Calendar Control",
      description: "Choose exactly when your bike is free to rent (weekdays, weekends, or daily).",
      icon: Calendar,
    },
    {
      step: "03",
      title: "Approve Requests",
      tagline: "Screen Riders",
      description: "Review incoming booking requests from verified, KYC-checked customers.",
      icon: CheckSquare,
    },
    {
      step: "04",
      title: "Hand Over",
      tagline: "Scan QR",
      description: "Verify the customer in-person with contactless QR verification and hand over keys.",
      icon: Key,
    },
    {
      step: "05",
      title: "Earn",
      tagline: "Direct Payouts",
      description: "Watch your earnings accumulate and receive automatic deposits.",
      icon: IndianRupee,
    },
  ];

  const currentSteps = activeTab === "riders" ? riderSteps : ownerSteps;

  return (
    <section className="py-20 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            Simple 5-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            How Bike Sharing Works
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Transparent, verified, and effortless for both sides of the marketplace.
          </p>

          {/* Interactive Role Toggle */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("riders")}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === "riders"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Riders (Rent a Bike)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("owners")}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === "owners"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Owners (Rent Out Your Bike)
              </button>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {currentSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 text-left group"
                >
                  <div>
                    {/* Step Number & Icon Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-black bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {item.step}
                      </span>
                      <div className="p-3 rounded-xl bg-muted/70 text-primary group-hover:scale-110 transition-transform duration-200">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider mt-1">
                      {item.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
