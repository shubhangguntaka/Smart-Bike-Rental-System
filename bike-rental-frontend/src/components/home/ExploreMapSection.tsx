import { Link } from "react-router-dom";
import { MapPin, Navigation, ArrowRight, Compass, Bike, IndianRupee, ShieldCheck } from "lucide-react";

export default function ExploreMapSection() {
  const previewBikes = [
    {
      name: "Cruiser 350",
      type: "Geared Classic",
      price: "₹450 / day",
      hub: "Jubilee Hills Hub",
      rating: "4.9",
      available: true,
    },
    {
      name: "Urban Commuter 125",
      type: "Automatic Scooter",
      price: "₹300 / day",
      hub: "Hitec City Station",
      rating: "4.8",
      available: true,
    },
    {
      name: "Sport Street 200",
      type: "Performance Sport",
      price: "₹550 / day",
      hub: "Gachibowli Hub",
      rating: "5.0",
      available: true,
    },
  ];

  return (
    <section className="py-20 bg-muted/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <Compass className="h-4 w-4 animate-spin text-primary" />
            <span>Interactive Fleet Map</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            A Bike for Every Journey
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Explore bikes available around you and choose the right ride for your next trip. Filter by hub location, price per day, and bike specifications.
          </p>
        </div>

        {/* Map Preview & Featured Bikes Container */}
        <div className="mt-14 rounded-3xl overflow-hidden border border-border/80 bg-card/85 backdrop-blur-md p-6 sm:p-10 shadow-xl space-y-8">
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Map Preview Viewport */}
            <div className="lg:col-span-7 relative h-72 sm:h-80 w-full rounded-2xl bg-slate-900 overflow-hidden border border-border/60">
              {/* Grid Lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Simulated Route Polyline */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 50 180 Q 150 60 260 120 T 420 80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              </svg>

              {/* Marker 1 */}
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-bounce">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/50">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-white bg-slate-900/90 px-2 py-1 rounded mt-1 border border-primary/40">
                  Hub A (₹300/d)
                </span>
              </div>

              {/* Marker 2 */}
              <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/50">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-white bg-slate-900/90 px-2 py-1 rounded mt-1 border border-emerald-500/40">
                  Hub B (₹450/d)
                </span>
              </div>

              {/* Overlay Action Button */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex items-center justify-between sm:justify-start gap-3">
                <Link
                  to="/maps"
                  className="px-4 py-2 rounded-xl bg-background/90 hover:bg-background text-foreground text-xs font-bold backdrop-blur-md shadow-md flex items-center gap-2 transition-all"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Open Full Map Experience</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Right: Quick Bike Cards Preview */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Nearby Featured Listings
              </div>

              {previewBikes.map((bike, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/50 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-bold text-foreground">{bike.name}</h4>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{bike.type}</span>
                      <span>•</span>
                      <span>{bike.hub}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {bike.price}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  to="/bikes"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <span>Browse all available rental bikes →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
