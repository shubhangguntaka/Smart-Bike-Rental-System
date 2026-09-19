import { Code2, Server, Database, Map, CreditCard, Cpu } from "lucide-react";

export default function TechnologySection() {
  const techCategories = [
    {
      category: "Frontend Core",
      icon: Code2,
      color: "text-cyan-500",
      technologies: [
        { name: "React 19", role: "UI Component Library" },
        { name: "TypeScript", role: "End-to-End Type Safety" },
        { name: "Tailwind CSS v4", role: "Design Token Engine" },
        { name: "Three.js", role: "3D WebGL Vehicle Showcase" },
      ],
    },
    {
      category: "Backend Services",
      icon: Server,
      color: "text-emerald-500",
      technologies: [
        { name: "Spring Boot 3", role: "Modular Microservices REST API" },
        { name: "Spring Security", role: "Role-Based Access Control" },
        { name: "JWT Authentication", role: "Stateless Token Verification" },
        { name: "Spring Data JPA", role: "Hibernate ORM Layer" },
      ],
    },
    {
      category: "Database & Storage",
      icon: Database,
      color: "text-blue-500",
      technologies: [
        { name: "MySQL 8.0", role: "Relational ACID Persistence" },
        { name: "Document Vault", role: "Aadhaar & DL Verification Files" },
        { name: "Ride Telemetry Logs", role: "Time-Series GPS Coordinates" },
        { name: "Audit Trail Ledger", role: "Administrative Mutation History" },
      ],
    },
    {
      category: "Telemetry & Payments",
      icon: Cpu,
      color: "text-purple-500",
      technologies: [
        { name: "Leaflet Maps", role: "Interactive Station Pinning" },
        { name: "GPS Tracking", role: "Haversine Distance Engine" },
        { name: "Razorpay Gateway", role: "Test Mode Payment Processing" },
        { name: "Recharts & jsPDF", role: "Data Visualization & Invoicing" },
      ],
    },
  ];

  return (
    <section className="py-20 bg-muted/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            Engineering Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Technology Behind the Platform
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Built on robust, industry-standard technologies ensuring security, sub-second telemetry, and seamless high-concurrency scaling.
          </p>
        </div>

        {/* Tech Cards Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techCategories.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 text-left space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-muted/70 ${group.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {group.category}
                  </h3>
                </div>

                <div className="space-y-3">
                  {group.technologies.map((tech, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3 rounded-xl bg-muted/30 border border-border/50 group-hover:border-border transition-colors space-y-1"
                    >
                      <div className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>{tech.name}</span>
                        <span className="h-2 w-2 rounded-full bg-primary/60" />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {tech.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
