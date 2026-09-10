import { ShieldCheck, FileCheck, UserCheck, Navigation, Lock, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TrustSafetySection() {
  const safetyPillars = [
    {
      title: "Owner & Bike RC Verification",
      description: "Every bike listed undergoes owner identity and vehicle RC documentation checks before appearing on the public search.",
      icon: FileCheck,
      color: "text-emerald-500",
    },
    {
      title: "Customer DL & Aadhaar KYC",
      description: "Riders must verify their Government Driving License and identity documents before reserving or picking up any vehicle.",
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      title: "Real-Time GPS Tracking",
      description: "Rides are protected by real-time GPS telemetry, alerting both owner and admin during route deviations or unauthorized pauses.",
      icon: Navigation,
      color: "text-cyan-500",
    },
    {
      title: "Razorpay Escrow & Invoices",
      description: "Transactions are processed securely through Razorpay with transparent refundable security deposits and GST invoices.",
      icon: Lock,
      color: "text-purple-500",
    },
    {
      title: "Tamper-Proof Audit Trail",
      description: "Every booking modification, hand-over scan, and ride status update is logged immutably in administrative audit ledgers.",
      icon: ShieldAlert,
      color: "text-amber-500",
    },
    {
      title: "Contactless QR Check-in",
      description: "Secure QR verification ensures the bike is handed over only to the authenticated customer who booked it.",
      icon: ShieldCheck,
      color: "text-primary",
    },
  ];

  return (
    <section className="py-20 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            <span>Trust & Platform Security</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Built for Safer, Smarter Rentals
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A peer-to-peer bike sharing marketplace built on verified identities, tamper-evident booking ledgers, and real-time GPS asset protection.
          </p>
        </div>

        {/* Safety Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 text-left space-y-3"
              >
                <div className={`p-3 rounded-xl bg-muted/70 w-fit ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
