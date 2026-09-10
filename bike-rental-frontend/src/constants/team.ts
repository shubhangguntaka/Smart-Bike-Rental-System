export interface TeamMember {
  id: string;
  name: string;
  code: string;
  role: string;
  module: string;
  description: string;
  avatarUrl: string;
  handle: string;
  status: string;
  innerGradient?: string;
  behindGlowColor?: string;
  highlights?: string[];
  technologies?: string[];
}

export interface InstituteInfo {
  name: string;
  description: string;
  imageSrc: string;
  altText: string;
}

// ============================================================================
// INSTITUTE DATA (Easily replace imageSrc with your institute campus/logo photo)
// ============================================================================
export const INSTITUTE_DATA: InstituteInfo = {
  name: "SSSIT Major Project",
  description: "Full-stack peer-to-peer smart bike rental platform engineered as an academic capstone.",
  // Replace this demo image with your institute campus or logo photo
  imageSrc: "/SSSIT.png",
  altText: "SSSIT Major Engineering Project",
};

// ============================================================================
// TEAM MEMBERS DATA (Easily replace avatarUrl for each member below)
// ============================================================================
const DEFAULT_STATIC_PHOTO = "/Shubhang.png";

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Anil Kumar",
    code: "M1",
    role: "Payment & Billing",
    module: "Financial Transactions Engine",
    description: "Integrated Razorpay checkout, automated invoice generation, and refund workflows.",
    handle: "billing.lead",
    status: "Online",
    avatarUrl: "/Anil.png",
    innerGradient: "linear-gradient(145deg, rgba(245, 158, 11, 0.18) 0%, rgba(16, 185, 129, 0.22) 100%)",
    behindGlowColor: "rgba(245, 158, 11, 0.45)",
    highlights: [
      "Razorpay Checkout Integration",
      "Automated PDF Invoicing",
      "Transaction Webhooks & Sync",
      "Refunds & Security Deposits"
    ],
    technologies: ["Razorpay API", "Spring Boot", "React", "Tailwind CSS"]
  },
  {
    id: "member-2",
    name: "Gnaneshwar",
    code: "M2",
    role: "GPS & Live Tracking",
    module: "Real-Time Telemetry & Tracking",
    description: "Architected real-time WebSocket location tracking, Leaflet breadcrumbs, and telemetry stats.",
    handle: "gnaneshwar",
    status: "Active Lead",
    avatarUrl: "/Gnaneshwar.png",
    innerGradient: "linear-gradient(145deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.30) 100%)",
    behindGlowColor: "rgba(16, 185, 129, 0.55)",
    highlights: [
      "Live WebSocket GPS Feeds",
      "Interactive Leaflet Maps",
      "Geofencing & Route History",
      "Telemetry & Speed Analytics"
    ],
    technologies: ["WebSockets / STOMP", "Leaflet.js", "OpenStreetMap", "TypeScript"]
  },
  {
    id: "member-3",
    name: "Shubhang",
    code: "M3",
    role: "Admin Operations",
    module: "Platform Governance & Fleet Oversight",
    description: "Built centralized admin dashboards, user moderation, bike inventory control, and audit logs.",
    handle: "admin.ops",
    status: "Online",
    avatarUrl: "/Shubhang.png",
    innerGradient: "linear-gradient(145deg, rgba(6, 182, 212, 0.22) 0%, rgba(99, 102, 241, 0.25) 100%)",
    behindGlowColor: "rgba(6, 182, 212, 0.45)",
    highlights: [
      "Fleet & Bike Management",
      "Role-Based Access Control",
      "User Verification Oversight",
      "Audit Trail & Event Logging"
    ],
    technologies: ["Spring Security", "React Admin", "PostgreSQL", "JWT"]
  },
  {
    id: "member-4",
    name: "Pruthvi",
    code: "M4",
    role: "Reports & Analytics",
    module: "Business Intelligence & Reporting",
    description: "Engineered real-time KPI aggregations, interactive Recharts charts, and PDF/CSV pipelines.",
    handle: "analytics.dev",
    status: "Online",
    avatarUrl: "/Pruthvi.png",
    innerGradient: "linear-gradient(145deg, rgba(168, 85, 247, 0.22) 0%, rgba(236, 72, 153, 0.22) 100%)",
    behindGlowColor: "rgba(168, 85, 247, 0.45)",
    highlights: [
      "Revenue & Booking KPI Metrics",
      "Interactive Recharts Visuals",
      "Automated CSV/Excel Exports",
      "Dynamic Date-Range Filters"
    ],
    technologies: ["Recharts", "Data Aggregation", "Export Pipelines", "REST APIs"]
  },
  {
    id: "member-5",
    name: "Shiva Sai Kalyan",
    code: "M5",
    role: "Compliance & Security",
    module: "KYC Verification & System Integration",
    description: "Implemented Aadhaar & Driving License verification workflows, JWT filters, and test gates.",
    handle: "compliance.eng",
    status: "Online",
    avatarUrl: "/Kalyan.png",
    innerGradient: "linear-gradient(145deg, rgba(59, 130, 246, 0.22) 0%, rgba(16, 185, 129, 0.22) 100%)",
    behindGlowColor: "rgba(59, 130, 246, 0.45)",
    highlights: [
      "Aadhaar & License Verification",
      "KYC Document Upload Flow",
      "JWT Security & Route Guards",
      "Integration & Unit Test Suite"
    ],
    technologies: ["Spring Security", "Document Upload Flow", "Axios Interceptors", "JUnit / Testing"]
  },
];
