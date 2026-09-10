import HeroSection from "@/components/home/HeroSection";
import MarketplaceSection from "@/components/home/MarketplaceSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ExploreMapSection from "@/components/home/ExploreMapSection";
import OwnerEarningsSection from "@/components/home/OwnerEarningsSection";
import FeatureSection from "@/components/home/FeatureSection";
import TrustSafetySection from "@/components/home/TrustSafetySection";
import StatisticsSection from "@/components/home/StatisticsSection";
import AppDownloadSection from "@/components/home/AppDownloadSection";
import TechnologySection from "@/components/home/TechnologySection";
import TeamSection from "@/components/home/TeamSection";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden">
      {/* Global Ambient Perspective Glows & Cyber Grid that spread across all sections */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Deep ambient dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        {/* Global Continuous Cyber Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--foreground) 1px, transparent 1px),
              linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Continuous Soft Ambient Atmosphere Orbs throughout the scroll */}
        {/* Upper Right (3D Bike glow flowing into marketplace) */}
        <div className="absolute top-[8%] -right-24 w-[38rem] h-[38rem] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px]" />
        
        {/* Mid-Left (Owner earnings / How it works ambient glow) */}
        <div className="absolute top-[32%] -left-28 w-[40rem] h-[40rem] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[150px]" />

        {/* Mid-Right (Map & Feature section aura) */}
        <div className="absolute top-[55%] -right-20 w-[42rem] h-[42rem] bg-primary/10 dark:bg-primary/15 rounded-full blur-[160px]" />

        {/* Lower Left (Telemetry & Tech Stack glow) */}
        <div className="absolute top-[78%] -left-20 w-[36rem] h-[36rem] bg-cyan-500/10 dark:bg-cyan-500/12 rounded-full blur-[140px]" />

        {/* Bottom Ambient Floor Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      </div>

      {/* 1. Hero Section: Two-Sided Marketplace identity, 3D Bike Model & Dual CTAs */}
      <HeroSection />

      {/* 2. One Platform. Two Ways to Ride. (Rent a Bike vs. Rent Out Your Bike) */}
      <MarketplaceSection />

      {/* 3. How Bike Sharing Works (Dual 5-step journey for Riders and Owners) */}
      <HowItWorksSection />

      {/* 4. Find a Bike Near You (Interactive map exploration & featured listings) */}
      <ExploreMapSection />

      {/* 5. Your Bike Doesn't Have to Sit Idle (Owner visual flow & earnings calculator) */}
      <OwnerEarningsSection />

      {/* 6. Platform Capabilities & Features */}
      <FeatureSection />

      {/* 7. Built for Safer, Smarter Rentals (Trust & Safety) */}
      <TrustSafetySection />

      {/* 8. Platform Statistics & Metrics */}
      <StatisticsSection />

      {/* 9. Mobile App Experience (Coming Soon) */}
      <AppDownloadSection />

      {/* 10. Platform Technology Architecture */}
      <TechnologySection />

      {/* 11. Built by the Team Behind the Platform */}
      <TeamSection />
    </div>
  );
}