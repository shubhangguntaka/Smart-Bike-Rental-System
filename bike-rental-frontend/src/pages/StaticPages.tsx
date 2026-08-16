import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, HelpCircle, FileText, CreditCard, Sparkles, ArrowLeft } from "lucide-react";

export function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Transparent Pricing
        </span>
        <h1 className="text-3xl font-extrabold text-foreground">Flexible Rental Plans</h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Rent by the hour or by the day with no hidden charges. All rentals include helmet and standard insurance coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">Hourly</span>
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">₹60 <span className="text-xs font-normal text-muted-foreground">/ hr</span></div>
          <p className="text-xs text-muted-foreground">Ideal for quick errands or short intra-city trips.</p>
          <ul className="text-xs text-foreground space-y-2 pt-2 border-t border-border">
            <li>✓ Helmet included</li>
            <li>✓ Pay per hour used</li>
            <li>✓ Instant QR unlocking</li>
          </ul>
        </div>

        <div className="bg-primary/5 border-2 border-primary rounded-3xl p-6 space-y-4 shadow-xl relative">
          <span className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Popular</span>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-primary uppercase">Daily</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">₹480 <span className="text-xs font-normal text-muted-foreground">/ day</span></div>
          <p className="text-xs text-muted-foreground">Best value for full-day rides and daily commuting.</p>
          <ul className="text-xs text-foreground space-y-2 pt-2 border-t border-border">
            <li>✓ 24-hour full access</li>
            <li>✓ Complimentary helmet</li>
            <li>✓ Free cancellation before trip</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">Weekly</span>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">₹2,800 <span className="text-xs font-normal text-muted-foreground">/ week</span></div>
          <p className="text-xs text-muted-foreground">Save up to 25% on long-term weekly rentals.</p>
          <ul className="text-xs text-foreground space-y-2 pt-2 border-t border-border">
            <li>✓ Priority maintenance</li>
            <li>✓ Full insurance included</li>
            <li>✓ Free doorstep delivery</li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link to="/nearby-bikes" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition">
          Browse Available Bikes
        </Link>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    { q: "How do I rent a bike?", a: "Browse available bikes on the Explore Map or Nearby Bikes page, select your desired rental period, complete security verification, and confirm your booking." },
    { q: "What documents are required?", a: "You need a valid Aadhaar card and a valid Driving License for identity and riding eligibility verification." },
    { q: "How does the QR handover work?", a: "When picking up your bike, present your Booking QR code to the bike owner. The owner scans it to initiate the ride." },
    { q: "What is the cancellation policy?", a: "Bookings can be cancelled free of charge prior to bike handover confirmation by the owner." },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-foreground flex items-center justify-center gap-2">
          <HelpCircle className="text-primary w-8 h-8" /> Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-foreground">Got questions? We've got answers.</p>
      </div>

      <div className="space-y-4 pt-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground">{faq.q}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link to="/contact" className="text-xs font-bold text-primary hover:underline">
          Have more questions? Contact our Support Team →
        </Link>
      </div>
    </div>
  );
}

export function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-foreground">Help Center & Support</h1>
        <p className="text-sm text-muted-foreground">Assistance for bike rentals, owner listings, and payments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-foreground">Renter Assistance</h3>
          <p className="text-xs text-muted-foreground">Need help booking a bike or tracking an ongoing rental? Contact customer support anytime.</p>
          <Link to="/contact" className="inline-block text-xs font-bold text-primary hover:underline">Customer Support →</Link>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-foreground">Owner Partner Support</h3>
          <p className="text-xs text-muted-foreground">Questions about RC document verification, bike listings, or earnings payouts?</p>
          <Link to="/contact" className="inline-block text-xs font-bold text-primary hover:underline">Partner Support →</Link>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
        <FileText className="text-primary w-8 h-8" /> Privacy Policy
      </h1>
      <p className="text-xs text-muted-foreground">Last updated: August 2026</p>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-4 text-xs text-muted-foreground leading-relaxed shadow-xs">
        <h3 className="text-sm font-bold text-foreground">1. Information Collection</h3>
        <p>We collect essential user information such as name, email, phone number, and identity verification documents (Aadhaar & RC) solely to enable secure bike rentals and regulatory compliance.</p>

        <h3 className="text-sm font-bold text-foreground">2. Location Data</h3>
        <p>With user permission, GPS coordinates are used exclusively to display nearby bikes and calculate pickup routes. We do not track location in the background without active consent.</p>

        <h3 className="text-sm font-bold text-foreground">3. Data Security</h3>
        <p>All sensitive credentials and documents are stored securely using industry-standard encryption protocols.</p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
        <ShieldCheck className="text-primary w-8 h-8" /> Terms & Conditions
      </h1>
      <p className="text-xs text-muted-foreground">Last updated: August 2026</p>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-4 text-xs text-muted-foreground leading-relaxed shadow-xs">
        <h3 className="text-sm font-bold text-foreground">1. Rental Agreement</h3>
        <p>By renting a vehicle through Smart Bike Rental System, renters agree to return the bike on schedule and in safe working condition.</p>

        <h3 className="text-sm font-bold text-foreground">2. Eligibility</h3>
        <p>Renters must be at least 18 years of age and hold a valid government-issued driver's license.</p>

        <h3 className="text-sm font-bold text-foreground">3. Owner Obligations</h3>
        <p>Bike owners guarantee that listed vehicles possess valid RC registration, insurance, and are structurally safe for riding.</p>
      </div>
    </div>
  );
}
