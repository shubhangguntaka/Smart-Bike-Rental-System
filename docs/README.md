# 📚 Smart Bike Rental System — Documentation Hub

Welcome to the central documentation repository for the **Smart Bike Rental System** (Major Academic Project). This directory houses technical blueprints, module specifications, API contracts, deployment guides, user manuals, and work allocation records.

---

## 📑 Documentation Index

### 1. 🏛️ Architecture & System Design
- [System Architecture](Architecture.md) — High-level technical architecture, layered pattern, entity relationships, and component interactions.
- [Database Documentation](Database_Documentation.md) — Complete ER diagrams, 13 core relational tables, foreign-key constraints, and indexing.
- [Frontend Readiness Baseline](Frontend_Readiness_Baseline.md) — UI component specifications, client state management, responsive layout baselines, and design tokens.
- [Architecture Blueprints Folder](architecture/) — Architectural diagrams and component schematics.
- [UI/UX Design Assets](ui-design/) — Wireframes, responsive screen mockups, and interaction prototypes.
- [API Design Specifications](api-design/) — Contract definitions and schema specifications.

### 2. 🧩 Module Specifications
- [Admin Module Documentation](Admin_Module_Documentation.md) — Comprehensive guide for administrative control: user/owner moderation, document KYC verification (Aadhaar/DL/RC), fleet audits, and system logs.
- [Booking Module Documentation](Booking_Module_Documentation.md) — Full reservation lifecycle: availability check, pricing & GST calculation, identity gatekeeping, ZXing QR generation for handover, and lifecycle progress.
- [GPS & Geolocation Module](MEMBER_2_GPS_DOCUMENTATION.md) — Live GPS tracking, Leaflet/Google Maps integration, coordinates streaming, geofencing, and proximity calculations.
- [Reports & Analytics Documentation](REPORTS_ANALYTICS.md) — Revenue trends, fleet utilization metrics, booking status distributions, and multi-format report exports (PDF / Excel).

### 3. 🔌 API & Integration Guides
- [API Documentation](API_Documentation.md) — Detailed REST endpoint specs: request/response bodies, query parameters, JWT authentication headers, and standard error formats.
- **Swagger / OpenAPI Interactive UI**: Available at `http://localhost:8888/swagger-ui/index.html` when the Spring Boot backend is active.

### 4. 🚀 Deployment, Operations & Testing
- [Deployment Guide](Deployment_Guide.md) — Production & staging deployment instructions for Railway (Backend + MySQL) and Vercel (Frontend), plus environment variable configuration.
- [Testing Report](Testing_Report.md) — Unit test coverage, integration testing scenarios, API verification logs, and user acceptance testing (UAT).
- [User Manual](User_Manual.md) — End-user guide covering Customer registration, Bike discovery, Booking & Payment, QR Verification, Owner fleet management, and Admin oversight.

### 5. 👥 Project Planning & Team Allocations
- [Section-wise Work Allocation](SECTION-WISE WORK ALLOCATION.docx) — Detailed division of technical duties across modules.
- [Team Members & Contact](TeamMembers.docx) — Project contributors, roles, and assigned sprint tasks.
- [Role-Access Matrix](Role-Access%20Table.xlsx) — Role-Based Access Control (RBAC) permission matrix for `CUSTOMER`, `OWNER`, and `ADMIN`.
- [Project Proposal](BikeRentalProject-Proposal.pptx) — Initial project pitch, scope, objectives, and milestones.
- [Project Storyboard](StoryBoard.docx) — User journey mapping and UX flow storyboard.
- [Meeting Notes](meeting-notes/) — Minutes of development syncs and review checkpoints.
- [Project Requirements](requirements/) — Functional (SRS) and non-functional requirements.
- [Workflows](workflow/) — State machine diagrams for booking, ride status, and KYC verification.

### 6. 🔮 Roadmap & Enhancements
- [Future Enhancements](Future_Enhancements.md) — In-app digital wallet, AI-driven dynamic pricing, WebRTC/Socket chat, IoT smart-lock integration, and native mobile applications.

---

## 🛠️ Quick System Reference

| Layer | Technology | Port / URL |
| :--- | :--- | :--- |
| **Backend API** | Spring Boot 3.2.5 (Java 21) | `http://localhost:8888/api` |
| **Swagger UI** | Springdoc OpenAPI 2.x | `http://localhost:8888/swagger-ui/index.html` |
| **Frontend Web** | React 19 + TypeScript + Vite + Tailwind CSS v4 | `http://localhost:5173` |
| **Database** | MySQL 8.x (`bike_rental`) | `localhost:3306` |

---

## 🧭 Navigation Quick Links
- ⬅️ Back to [Root Project README](../README.md)
- ⚙️ Backend Guide: [bike-rental-backend/README.md](../bike-rental-backend/README.md)
- 🎨 Frontend Guide: [bike-rental-frontend/README.md](../bike-rental-frontend/README.md)
- 🗄️ Database Setup: [database/README.md](../database/README.md)
- 📮 Postman API Guide: [postman/README.md](../postman/README.md)
