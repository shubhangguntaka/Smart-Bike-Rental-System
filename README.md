# 🚲 Smart Bike Rental System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg?logo=openjdk)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1.svg?logo=mysql)](https://www.mysql.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D.svg?logo=swagger)](http://localhost:8888/swagger-ui/index.html)
[![License](https://img.shields.io/badge/License-Academic%20Project-lightgrey.svg)](LICENSE)

An enterprise-grade, full-stack web platform enabling seamless bike rentals, fleet onboarding for owners, automated document KYC verification, live GPS tracking, and comprehensive administrative governance.

---

## 📑 Table of Contents

1. [System Overview](#-system-overview)
2. [Core Features](#-core-features)
3. [Technology Stack](#️-technology-stack)
4. [Repository Structure](#-repository-structure)
5. [Quick Start Guide](#-quick-start-guide)
   - [Backend Setup (Spring Boot)](#1-backend-setup-spring-boot)
   - [Database Setup (MySQL)](#2-database-setup-mysql)
   - [Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
6. [Shared Test Accounts & Seed Data](#-shared-test-accounts--seed-data)
7. [API Documentation & Swagger](#-api-documentation--swagger)
8. [Team Responsibilities & Work Allocation](#-team-responsibilities--work-allocation)
9. [Documentation Hub Directory](#-documentation-hub-directory)
10. [Future Roadmap](#-future-roadmap)

---

## 🌐 System Overview

The **Smart Bike Rental System** bridges the gap between bike owners seeking passive income and customers needing flexible, affordable urban mobility. 

Featuring interactive geolocation maps, real-time GPS telemetry, digital QR handovers, online Razorpay billing with GST compliance, and rigorous document verification (Aadhaar, Driving License, RC), the platform delivers a modern, safe, and transparent rental experience.

---

## ✨ Core Features

### 👤 Customer Experience
- **Smart Fleet Discovery**: Search and filter by bike brand, engine displacement (CC), fuel type, and hourly/daily rates.
- **Interactive Map Search**: Discover nearby bikes in Hyderabad using **Leaflet / OpenStreetMap** and **Google Maps**.
- **3D Bike Viewer**: Inspect bike models interactively in real-time 3D rendered with **Three.js**.
- **Transparent Fare Calculation**: Live price estimates including 18% GST calculation and security deposit terms.
- **Digital Payments**: Integrated Razorpay payment workflow supporting Mock UPI, Cards, and Net Banking.
- **Live Ride Tracking**: Real-time GPS coordinate updates, speed telemetry, and ride duration counters.
- **Secure QR Handover**: Receive a dynamic QR code for bike pickup verification by the owner.
- **Document KYC Submission**: Upload Aadhaar and Driving License for one-time verification.
- **Ride History & PDF Invoices**: Downloadable PDF tax receipts generated on-the-fly.

### 🏍️ Bike Owner Portal
- **Fleet Management**: Add new motorcycles/scooters with specs, photos, and rental pricing.
- **RC & Document Verification**: Upload Registration Certificates (RC) for admin approval.
- **Booking Approvals**: Accept or reject reservation requests in real-time.
- **Camera QR Handover Scanner**: In-browser QR scanner to authenticate bike release to customers.
- **Owner Earnings & Analytics**: Track gross revenue, platform commissions, and net payouts.

### 🛡️ Administrator Governance
- **Platform Analytics Dashboard**: High-level counters for active rentals, total revenue, fleet status, and user growth.
- **Document KYC Audit Queue**: Dedicated review portal to approve or reject pending Aadhaar, Driving License, and RC certificates.
- **Fleet Moderation**: Audit vehicle conditions, manage maintenance status locks, and enforce security policies.
- **Financial Reports & Exports**: Generate exportable revenue summaries (PDF / Excel).

---

## 🛠️ Technology Stack

### Frontend Client
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4, Material-UI (MUI v5), Emotion
- **3D Graphics**: Three.js
- **Maps**: Leaflet, React-Leaflet, Google Maps API (`@react-google-maps/api`)
- **State Management**: Redux Toolkit, Zustand, React Context API
- **Data Fetching & Forms**: Axios, TanStack React Query v5, React Hook Form, Yup
- **Visuals & Charts**: Recharts, Chart.js, Lucide React, React Icons, Framer Motion
- **Document & QR**: jspdf, jspdf-autotable, react-qr-code, jsqr

### Backend API Service
- **Framework**: Spring Boot 3.2.5 (Java 21 LTS)
- **Security**: Spring Security 6, JJWT (0.12.6), BCrypt Password Encoder
- **Persistence**: Spring Data JPA, Hibernate ORM, MySQL Connector/J
- **Database**: MySQL 8.x
- **Payment & Cloud**: Razorpay Java SDK, Cloudinary Image/Document Storage
- **QR & Media**: ZXing ("Zebra Crossing") Core & JavaSE
- **Documentation**: Springdoc OpenAPI 2.x (Swagger UI)
- **Utilities**: Lombok, ModelMapper, Apache Commons IO/Lang3, Spring Boot Mail

---

## 📂 Repository Structure

```text
BikeRentalSystem/
├── bike-rental-backend/       # Spring Boot 3.2.5 REST API backend service
│   ├── src/main/java/         # Application source (com.sssit.bikerental)
│   ├── src/main/resources/    # Configuration properties (application-local.properties)
│   ├── pom.xml                # Maven dependencies and build plugins
│   └── README.md              # Dedicated Backend Technical Guide
│
├── bike-rental-frontend/      # React 19 + TypeScript + Vite web client
│   ├── src/                   # React components, pages, hooks, state, types
│   ├── package.json           # Frontend dependencies and npm scripts
│   ├── vite.config.ts         # Vite build configuration
│   └── README.md              # Dedicated Frontend Technical Guide
│
├── bike-rental-customer-app/  # React Native (Expo) Customer Mobile App
│   ├── src/                   # Mobile screens, navigation, components, services
│   ├── package.json           # Expo & React Native dependencies
│   ├── app.json               # Expo app configuration
│   └── README.md              # Dedicated Customer Mobile App Technical Guide
│
├── database/                  # Database schema and seed data
│   ├── bike_rental_test_data_hyderabad.sql # Complete reset + seed script (13 tables)
│   └── README.md              # Database setup and verification guide
│
├── docs/                      # Central project documentation repository
│   ├── Architecture.md        # System architecture specifications
│   ├── API_Documentation.md   # Endpoint contracts and payload definitions
│   ├── Admin_Module_Documentation.md   # Admin module documentation
│   ├── Booking_Module_Documentation.md # Booking module documentation
│   ├── Deployment_Guide.md    # Railway & Vercel deployment walkthrough
│   ├── Testing_Report.md      # Testing plan and verification results
│   ├── User_Manual.md         # End-user operations handbook
│   └── README.md              # Documentation index and hub
│
├── postman/                   # API collection guides and environment specs
│   └── README.md              # Postman testing manual & Swagger import guide
│
├── screenshots/               # Application UI captures and workflow diagrams
├── CHANGELOG.md               # Version history and feature release notes
├── CONTRIBUTING.md            # Guidelines for team collaboration
├── CODE_OF_CONDUCT.md        # Project conduct guidelines
├── LICENSE                    # Academic project license terms
└── README.md                  # Root project documentation (this file)
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL)
1. Ensure **MySQL Server 8.x** is running on port `3306`.
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS bike_rental;
   ```
3. Import the shared Hyderabad test dataset (creates test users, 14 bikes, bookings, KYC records):
   ```bash
   # From the project root:
   mysql -u root -p < database/bike_rental_test_data_hyderabad.sql
   ```

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd bike-rental-backend
   ```
2. Verify local database credentials in `src/main/resources/application-local.properties`:
   ```properties
   server.port=8888
   spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Run the application:
   ```bash
   # Windows
   mvnw.cmd spring-boot:run

   # Linux / macOS
   ./mvnw spring-boot:run
   ```
4. The backend starts on: **`http://localhost:8888`**

### 3. Frontend Setup (React + Vite)
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd bike-rental-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser at: **`http://localhost:5173`**

---

## 🧪 Shared Test Accounts & Seed Data

The shared Hyderabad dataset comes pre-configured with accounts across all three user roles:

| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@bikerental.test` | `Admin@123` | Full administrative control, KYC approvals, analytics |
| **OWNER 1** | `ravi.owner@bikerental.test` | `Owner@123` | Fleet owner of 7 bikes (Classic 350, MT-15, etc.) |
| **OWNER 2** | `priya.owner@bikerental.test` | `Owner@123` | Fleet owner of EV scooters & sports bikes |
| **CUSTOMER 1** | `arjun.customer@bikerental.test` | `Customer@123` | Verified customer with active rental (#503) |
| **CUSTOMER 2** | `neha.customer@bikerental.test` | `Customer@123` | Verified customer with confirmed reservation |
| **CUSTOMER 3** | `vikram.customer@bikerental.test` | `Customer@123` | Unverified customer (tests KYC pending state) |
| **CUSTOMER 4** | `pending.customer@bikerental.test` | `Customer@123` | Rejected KYC state (tests verification block) |

---

## 📖 API Documentation & Swagger

When the backend server is running, the interactive OpenAPI Swagger UI is available at:

```text
http://localhost:8888/swagger-ui/index.html
```

Raw OpenAPI 3.0 JSON specification:
```text
http://localhost:8888/v3/api-docs
```

---

## 👥 Team Responsibilities & Work Allocation

| Member | Focus Modules & Technical Responsibilities |
| :--- | :--- |
| **Member 1** | Authentication, JWT, Booking Engine, Payment Integration, UI Testing |
| **Member 2** | Spring Security, Fleet Management, Document KYC Verification (Aadhaar / DL / RC) |
| **Member 3** | Common UI System, Leaflet & Google Maps, Real-time GPS Tracking, Deployment |
| **Member 4** | Verification Workflow, Owner Portal, PDF Reports, Technical Documentation |
| **Member 5** | System Configuration, Reviews & Ratings, Notifications, Admin Governance, End-to-End Testing |

---

## 📚 Documentation Hub Directory

Detailed documentation is available in the [`docs/`](docs/README.md) directory:

- 🏛️ [System Architecture](docs/Architecture.md)
- 🗄️ [Database ERD & Schema](docs/Database_Documentation.md)
- 🔌 [API Documentation](docs/API_Documentation.md)
- 🛡️ [Admin Module Documentation](docs/Admin_Module_Documentation.md)
- 📅 [Booking Module Documentation](docs/Booking_Module_Documentation.md)
- 📍 [GPS & Geolocation Documentation](docs/MEMBER_2_GPS_DOCUMENTATION.md)
- 📊 [Reports & Analytics](docs/REPORTS_ANALYTICS.md)
- 🚀 [Deployment Guide](docs/Deployment_Guide.md)
- 🧪 [Testing Report](docs/Testing_Report.md)
- 📘 [User Manual](docs/User_Manual.md)
- 🔮 [Future Enhancements](docs/Future_Enhancements.md)

---

## 🔮 Future Roadmap

- 📱 **Native Mobile Application**: Cross-platform mobile client built with React Native / Flutter.
- 💳 **Digital In-App Wallet**: In-platform wallet for instant cashbacks, booking refunds, and credits.
- 🤖 **AI Dynamic Pricing & Recommendation**: Machine-learning driven price adjustments based on demand spikes, weather, and fleet density.
- 🔒 **IoT Smart Bike Lock**: BLE and cellular IoT remote lock/unlock directly from the customer app.
- 💬 **Live Customer-Owner Chat**: Real-time WebRTC/Socket messaging for coordination during pick-up.

---

## 📄 License & Attribution

Developed as an academic major project under the **SSSIT Institute of Technology**.  
All rights reserved © 2026 Smart Bike Rental System Team.
