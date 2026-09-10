import { Smartphone, QrCode, Bell, Wifi, ArrowUpRight } from "lucide-react";

export default function AppDownloadSection() {
  const perks = [
    {
      title: "Tap-to-Unlock",
      description: "NFC and rapid QR scanning at any station hub",
      icon: QrCode,
    },
    {
      title: "Real-Time Alerts",
      description: "Push notifications for booking approvals & ride updates",
      icon: Bell,
    },
    {
      title: "Live GPS Telemetry",
      description: "In-ride turn directions and real-time battery status",
      icon: Wifi,
    },
  ];

  return (
    <section className="py-20 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Mobile App Vision & Store Buttons */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Mobile Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Your Ride. Your Phone.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Take the bike rental experience with you. We are actively developing our native iOS and Android mobile applications for instant one-tap rentals, Bluetooth bike telemetry, and seamless owner management on the move.
            </p>

            {/* Mobile Feature Perks */}
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {perks.map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-card/80 backdrop-blur-md border border-border/70 space-y-2 shadow-sm text-left"
                  >
                    <div className="p-2 rounded-lg bg-muted/70 text-primary w-fit">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">{perk.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {perk.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Realistic App Store & Google Play Badges marked as Coming Soon */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
                <span className="text-xs text-muted-foreground">Mobile applications are currently in active development</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Apple App Store Badge (Disabled / Coming Soon) */}
                <button
                  type="button"
                  disabled
                  className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border/80 text-foreground/70 opacity-80 cursor-not-allowed shadow-sm select-none"
                  title="Coming Soon on the Apple App Store"
                >
                  <svg className="h-6 w-6 fill-current text-foreground" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.67-.81 1.13-1.94 1-3.04-.97.04-2.15.65-2.85 1.46-.62.72-1.16 1.88-1.01 2.98 1.09.08 2.19-.59 2.86-1.4" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
                      Download on the
                    </div>
                    <div className="text-xs font-bold text-foreground">App Store</div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 font-semibold ml-2">SOON</span>
                </button>

                {/* Google Play Store Badge (Disabled / Coming Soon) */}
                <button
                  type="button"
                  disabled
                  className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border/80 text-foreground/70 opacity-80 cursor-not-allowed shadow-sm select-none"
                  title="Coming Soon on Google Play"
                >
                  <svg className="h-6 w-6 fill-current text-foreground" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.346-.35-.558-.846-.558-1.408V3.222c0-.562.212-1.058.557-1.408zm11.233 11.234l2.585 2.586-12.012 6.839 9.427-9.425zm0-2.096L5.415 1.527l12.012 6.839-2.585 2.586zm1.463 1.048l3.187 1.815c.954.544.954 1.434 0 1.978l-3.187 1.815-2.228-2.228 2.228-2.18z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
                      Get it on
                    </div>
                    <div className="text-xs font-bold text-foreground">Google Play</div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 font-semibold ml-2">SOON</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right: Modern Futuristic Phone Graphic Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 h-[420px] rounded-[36px] bg-card border-4 border-border shadow-2xl p-4 flex flex-col justify-between overflow-hidden transition-colors">
              <div className="w-20 h-3.5 bg-muted rounded-full mx-auto" />

              <div className="space-y-4 my-auto text-left">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-semibold tracking-wider">BIKE RENTAL OS</span>
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Ride #8491</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">ACTIVE</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-foreground">
                    24.6 <span className="text-xs font-sans text-muted-foreground">km/h</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">GPS Stream: Active Route Telemetry</div>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <span className="text-xs font-bold text-primary flex items-center justify-center gap-2">
                    Scan QR to Unlock
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="w-28 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
