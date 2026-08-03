import React from "react";
import { ShieldCheck, Award, MapPin, Smile, Leaf, Zap } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Rides Completed", value: "250K+" },
    { label: "Active Fleet Bikes", value: "1,200+" },
    { label: "Verified Users", value: "45K+" },
    { label: "CO2 Saved (kg)", value: "180,000" },
  ];

  const features = [
    { icon: MapPin, title: "Real-time Tracking", description: "Our bikes are integrated with premium Google Maps GPS telemetry, monitoring coordinate feeds second-by-second." },
    { icon: ShieldCheck, title: "Document Verification", description: "Instantly register using securely encrypted KYC protocols verifying digital documents for quick bike collection." },
    { icon: Leaf, title: "Eco-friendly Transit", description: "Promoting green micro-mobility alternatives to traditional emission vehicles in local communities." },
    { icon: Zap, title: "IoT Smart Locks", description: "Unlock and lock rides cleanly using our mobile application interface linked directly to smart IoT bike locking units." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-background min-h-screen text-foreground space-y-16">
      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          About Smart Bike Rental
        </h1>
        <p className="text-base text-muted-foreground">
          Revolutionizing urban transport systems through modern electric and manual bicycles, powered by state-of-the-art telemetry and accessible user design.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <p className="text-3xl font-black text-primary">{stat.value}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Key Benefits Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Why Ride With Us?</h2>
          <p className="text-sm text-muted-foreground">Our technology stack brings safety and simplicity to rental bikes</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
