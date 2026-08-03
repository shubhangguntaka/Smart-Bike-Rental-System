# Bike Rental System - Workflow and Architecture Overview

This document provides a comprehensive overview of the current structure, routing workflow, state management, and modular architecture of both the backend and frontend components of the Bike Rental application.

---

## 📂 1. Project Directory Structure

The project is structured as a multi-module workspace containing separate client and server subdirectories:

```text
javaproject1/
├── bike-rental-backend/     # Spring Boot (Java) backend service
└── bike-rental-frontend/    # React + TypeScript (Vite) frontend application
```

---

## 🌐 2. Frontend Architecture (`bike-rental-frontend`)

The frontend is a modern web application built using **React**, **TypeScript**, **React Router v6**, **Axios**, and **Tailwind CSS**.

### Directory Structure

```text
src/
├── api/             # Axios instance, request/response interceptors, and endpoints
├── components/      # Reusable UI components (buttons, input fields, passwords)
├── config/          # Environment variables and configurations
├── constants/       # Global constants, including system routes
├── context/         # React Contexts (AuthContext, ThemeContext)
├── hooks/           # Custom React hooks (e.g., useAuth)
├── layouts/         # Layout wraps (e.g., MainLayout, DashboardLayout)
├── pages/           # Screen views organized by feature/role
├── routes/          # Navigation routers and guard components
├── services/        # Service layers for network requests (e.g., authService)
└── utils/           # Utility functions (storage, JWT processing)
```

### 🛡️ Routing and Authorization Guard Flow

Routes are configured dynamically in [AppRoutes.tsx](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/routes/AppRoutes.tsx). Navigation checks are controlled by two guards:

1. **[AuthGuard.tsx](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/routes/AuthGuard.tsx)**
   * **Target**: Auth-specific pages like `/login`, `/register`, `/verify-otp`, `/forgot-password`, and `/reset-password`.
   * **Action**: If a user is already logged in, it redirects them to their respective role-specific dashboard (e.g., `/admin/dashboard`, `/owner/dashboard`, or `/customer/dashboard`).

2. **[ProtectedRoute.tsx](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/routes/ProtectedRoute.tsx)**
   * **Target**: Secure routes (`/customer/*`, `/owner/*`, `/admin/*`).
   * **Action**: Verifies that the user is authenticated. If not, redirects them to `/login`. If the route has an `allowedRoles` filter, it checks the user's role and redirects to `/unauthorized` (which displays a `403 Forbidden Access` message) on access violations.

### 🔐 Authentication State Management

* **Context Layer ([AuthContext.tsx](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/context/AuthContext.tsx))**:
  Exposes the `token`, `user` object, `isAuthenticated` status, `loading` indicator, and handlers for `login()` and `logout()`.
* **Token Expiry & Validation**:
  Upon initialization, the app pulls the token and user metadata from local storage. If the token is expired, the session is cleared automatically.
* **HTTP Interceptors ([axios.ts](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/api/axios.ts))**:
  * **Requests**: Injects the active JWT token via the `Authorization: Bearer <token>` header. Configured with `withCredentials: true`.
  * **Responses**: 
    - Automatically intercepts `401 Unauthorized` responses, clears invalid credentials, and redirects the browser session to `/login`.
    - Automatically intercepts `403 Forbidden` responses and redirects the browser session to `/unauthorized`.

---

## ☕ 3. Backend Architecture (`bike-rental-backend`)

The backend is built using the **Spring Boot** framework, managed by **Maven**, and follows a modular package pattern under `com.sssit.bikerental`.

### Directory Structure

```text
src/main/java/com/sssit/bikerental/
├── BikeRentalBackendApplication.java   # App bootstrap entry point
├── common/                             # Shared utility methods & base classes
├── config/                             # Spring Configurations (Beans, CORS setup)
├── exception/                          # Global controller advice and exception classes
├── security/                           # Spring Security & JWT setup
│   ├── filter/                         # Filters including JwtFilter (with custom try-catch 401 handling)
│   ├── handler/                        # Custom handlers (CustomAccessDeniedHandler returning 403 response)
│   ├── jwt/                            # JWT token generation, parsing, and AuthenticationEntryPoint
│   ├── service/                        # CustomUserDetailsService
│   └── user/                           # UserDetails implementation (User entity)
└── modules/                            # Feature-specific sub-packages (modular)
    ├── admin/                          # System configurations, audit logs, and admin tasks
    ├── analytics/                      # Site metrics and telemetry data
    ├── auth/                           # Registration, sign-in, and OTP code controllers
    ├── bike/                           # Bike details, inventory, and telemetry profiles
    ├── booking/                        # Rental booking logic and state changes
    ├── gps/                            # IoT tracking/GPS integration
    ├── map/                            # Geolocation data and maps API integrations
    ├── notification/                   # Email and SMS alert dispatchers
    ├── owner/                          # Bike owner registration and controls
    ├── payment/                        # Transaction flows and invoice processing
    ├── report/                         # CSV and PDF reporting pipelines
    ├── review/                         # Ratings, reviews, and client feedback
    ├── upload/                         # Static file/image uploads handler
    ├── user/                           # Main user entities and profile repositories
    └── verification/                   # User and vehicle document validations
```

### 🔒 Request Authentication & Authorization Flow

1. **Authentication (JWT Verification)**:
   - Evaluated by `JwtFilter`. If the JWT is invalid, malformed, or expired, the filter catches the exception, clears the security context, and delegates to `JwtAuthenticationEntryPoint` to return a `401 Unauthorized` JSON payload.
2. **Authorization (Role-based Restrictions)**:
   - Configured via `SecurityConfig` with `@EnableMethodSecurity`.
   - Explicitly maps routes `/api/admin/**` to `ADMIN` role, `/api/owner/**` to `OWNER` role, and `/api/customer/**` to `CUSTOMER` role.
   - Any access denied violation triggers `CustomAccessDeniedHandler` to return a `403 Forbidden` JSON response matching the application's standard error response scheme.


---
