# 🚲 Bike Rental System — Modern Frontend Client

An enterprise-grade, responsive, and high-performance web application for the **Smart Bike Rental System**, built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Material-UI**, and **Three.js**.

---

## 🌟 Highlights & Key Features

### 👤 Customer Experience
- **Interactive Fleet Catalog**: Filter bikes by brand, fuel type, daily/hourly rate, CC category, and availability.
- **Dual Map Navigation**: Interactive **Leaflet / OpenStreetMap** and **Google Maps** integration for locating nearby bikes in Hyderabad.
- **3D Bike Interactive Showcase**: Real-time 3D vehicle inspection powered by **Three.js**.
- **Seamless Booking Flow**: Live fare estimation, date/time pickers, and automated 18% GST calculation.
- **Razorpay Checkout Integration**: Instant card, net banking, and UPI payment simulation with signature verification.
- **Live Ride GPS Tracking**: Real-time geolocation coordinates, ride duration, and speed telemetry.
- **QR Code Handover**: Dynamic QR code generation for pickup and dropoff validation.
- **Document KYC Submission**: Upload Aadhaar and Driving License documents with instant status checks.
- **Ride History & PDF Invoices**: Detailed booking records with downloadable PDF tax receipts using `jspdf`.

### 🏍️ Fleet Owner Portal
- **Fleet Management**: Add, update, archive, and manage bike specifications and rental prices.
- **Vehicle Document Verification**: Upload and track RC, fitness, and insurance documentation.
- **Booking Requests Dashboard**: Approve or decline incoming customer reservations in real-time.
- **QR Handover Scanner**: In-browser camera QR code scanner powered by `jsqr` to authenticate bike release to customers.
- **Earnings & Analytics**: Revenue tracking, utilization graphs, and payouts history.

### 🛡️ Administrative Control Center
- **System Overview Dashboard**: Real-time counters for active rides, revenue, fleet utilization, and user growth.
- **KYC Verification Reviewer**: Review pending Aadhaar, Driving License, and RC certificates with one-click approve/reject actions.
- **Fleet Moderation**: Audit vehicle listings, enforce maintenance locks, and inspect reports.
- **Financial Analytics & Export**: Interactive charts powered by `Recharts` and `Chart.js`, with CSV and PDF export capabilities.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Material-UI (MUI v5), Emotion, Lucide React, React Icons |
| **State Management** | Redux Toolkit, Zustand, Context API |
| **Data Fetching** | Axios, TanStack React Query (v5) |
| **Forms & Validation** | React Hook Form, Yup schema validator |
| **Maps & Geolocation** | Leaflet, React-Leaflet, Google Maps API (`@react-google-maps/api`) |
| **3D Rendering** | Three.js (`@types/three`) |
| **Charts & Analytics** | Recharts, Chart.js, React-Chartjs-2 |
| **Utilities & PDF** | Day.js, jspdf, jspdf-autotable, react-qr-code, jsqr, react-hot-toast |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm**: v9.x or v10.x+
- **Backend Service**: Ensure the Spring Boot backend is active on port `8888`.

### 2. Installation
Navigate to the frontend folder and install dependencies:

```bash
cd bike-rental-frontend
npm install
```

### 3. Environment Configuration
Copy the sample environment file to create `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Ensure the configuration matches your local backend:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8888/api

# Application Display Title
VITE_APP_NAME=Smart Bike Rental System

# Optional Third-Party Keys
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=rzp_test_TU4lU75r4fP9AF
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 4. Development Server
Start Vite with hot-module replacement (HMR):

```bash
npm run dev
```

The application will be accessible at:
```text
http://localhost:5173
```

---

## 📂 Project Directory Structure

```text
bike-rental-frontend/
├── public/                 # Static public assets, favicon, mock models
├── src/
│   ├── api/                # Axios instance, interceptors, and API client definitions
│   ├── assets/             # Images, SVG illustrations, and icons
│   ├── components/         # Reusable presentation components
│   │   ├── admin/          # Admin stats, verification cards, charts
│   │   ├── auth/           # Login/register modals, protected route guards
│   │   ├── bike/           # Bike cards, filters, 3D bike inspection modal
│   │   ├── booking/        # Booking forms, price break-down, calendar pickers
│   │   ├── common/         # Buttons, badges, spinners, modal dialogs, navbar, footer
│   │   ├── map/            # Leaflet map container, custom markers, route polyline
│   │   ├── owner/          # Bike upload form, request approvals, earnings breakdown
│   │   ├── payment/        # Razorpay simulated modal, payment summary
│   │   └── verification/   # Aadhaar/DL upload forms and status indicators
│   ├── config/             # Environment configs and API routes
│   ├── context/            # React Context providers (AuthContext, ThemeContext)
│   ├── hooks/              # Custom hooks (useAuth, useGeolocation, useBookings)
│   ├── layouts/            # Page shell layouts (MainLayout, DashboardLayout)
│   ├── pages/              # Primary route view components
│   │   ├── admin/          # AdminDashboard, UserManagement, VerificationRequests
│   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   ├── customer/       # ExploreBikes, BikeDetails, BookingPage, RideTracker
│   │   ├── owner/          # OwnerDashboard, MyBikes, AddBike, BookingRequests
│   │   └── errors/         # NotFound 404, Unauthorized 403
│   ├── routes/             # AppRoutes definition with role-based protections
│   ├── services/           # Service layer interfacing with API endpoints
│   ├── store/              # Redux slices and Zustand state stores
│   ├── types/              # Comprehensive TypeScript interfaces & enums
│   ├── utils/              # Formatting helpers, PDF generators, date formatters
│   ├── App.tsx             # Root Application component with Router
│   ├── main.tsx            # React DOM client entrypoint
│   └── index.css           # Global Tailwind CSS imports and utility layers
├── package.json            # Dependencies and npm scripts
├── vite.config.ts          # Vite build config with Tailwind integration
└── tsconfig.json           # TypeScript compiler configuration
```

---

## 🧪 Shared Test Accounts for Frontend Testing

| Persona | Credentials (Email / Password) | Recommended Screens to Test |
| :--- | :--- | :--- |
| **System Admin** | `admin@bikerental.test` / `Admin@123` | Admin Dashboard, KYC Verification, Reports & Analytics |
| **Bike Owner (Ravi)** | `ravi.owner@bikerental.test` / `Owner@123` | My Bikes, Add Bike, QR Handover Pickup Scanner |
| **Bike Owner (Priya)** | `priya.owner@bikerental.test` / `Owner@123` | Fleet maintenance states, Electric vehicles |
| **Customer (Arjun)** | `arjun.customer@bikerental.test` / `Customer@123` | Active Ride Tracker (#503), Download Past Ride PDF |
| **Customer (Neha)** | `neha.customer@bikerental.test` / `Customer@123` | Explore Bikes, Checkout, Razorpay Mock Payment |
| **Customer (Vikram)** | `vikram.customer@bikerental.test` / `Customer@123` | Verification notice, Pending Aadhaar / DL upload |

---

## 📦 Build & Production Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local development server on `http://localhost:5173` |
| `npm run build` | Compiles TypeScript and creates optimized production bundle in `/dist` |
| `npm run preview` | Locally preview the production build output |
| `npm run lint` | Runs ESLint check across all TSX and TS files |

---

## 🔗 Quick Navigation Links
- 🏠 [Root Project README](../README.md)
- ⚙️ [Backend Documentation](../bike-rental-backend/README.md)
- 🗄️ [Database Test Data Guide](../database/README.md)
- 📚 [Full Documentation Hub](../docs/README.md)
