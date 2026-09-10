import { ShieldCheck, IndianRupee, Navigation, Clock } from "lucide-react";
import Bike3DViewer from "./Bike3DViewer";
import HeroActions from "./HeroActions";

export default function HeroSection() {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-20 sm:pt-24 pb-16 md:pb-20 min-h-screen flex items-center">
      {/* Full-Page Expansive Futuristic Background Layer */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Deep ambient dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        {/* Expansive Cyber Perspective Grid (spans whole screen from left to right) */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.09]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--foreground) 1px, transparent 1px),
              linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Horizon Glow Line across the middle of the whole page */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent blur-sm -translate-y-12" />

        {/* Grand Radial Glows spanning entire width */}
        {/* Left Glow under Text & CTAs */}
        <div className="absolute top-1/3 left-10 w-[32rem] h-[32rem] bg-primary/15 rounded-full blur-[110px]" />
        
        {/* Center / Horizon Ambient Wash */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[24rem] bg-cyan-500/10 rounded-full blur-[130px]" />

        {/* Right Glow under 3D Bike Model */}
        <div className="absolute top-1/3 right-10 w-[36rem] h-[36rem] bg-emerald-500/15 rounded-full blur-[120px]" />

        {/* Bottom Wide Road Gradient Sweep */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-emerald-500/5 via-cyan-500/5 to-transparent blur-2xl" />

        {/* Subtle Cyber Floating Starfield / Dust Dots */}
        <div
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Marketplace Headline & Value Proposition */}
          <div className="lg:col-span-6 text-left space-y-6 z-20">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>SMART • SIMPLE • SHARED // PEER-TO-PEER MOBILITY</span>
            </div>

            {/* Main Marketplace Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Your Bike. <br />
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
                  Their Journey.
                </span>{" "}
                <br />
                Your Earnings.
              </h1>
            </div>

            {/* Core Marketplace Message */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Discover bikes available for rent near you, or list your own bike and earn whenever you're not using it. A peer-to-peer bike sharing marketplace built for flexible rides and reliable owner income.
            </p>

            {/* Action Buttons (Explore Bikes + List Your Bike + Auth) */}
            <div className="pt-1">
              <HeroActions />
            </div>

            {/* Micro Highlights Row representing both sides */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground border-t border-border/60">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-500" />
                <span>Earn on Idle Bikes</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-cyan-400" />
                <span>Live GPS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Verified KYC & RC</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Hourly & Daily Rates</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Interactive Bike Showcase */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center overflow-visible z-10">
            {/* Ambient Backlight for the 3D Model */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-cyan-500/15 to-emerald-500/10 rounded-full blur-3xl -z-10 scale-110" />

            <div className="w-full max-w-xl lg:max-w-none">
              <Bike3DViewer />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
