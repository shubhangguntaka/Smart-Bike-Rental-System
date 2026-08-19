# Bike Rental System — Section 3: Admin Operations Module Documentation

**Author / Assigned Role:** Member 3 (Admin Operations)  
**Development Milestone:** Day 8 — Final Polish and Documentation  
**Commit Reference:** `fix(admin): finalize administration workflows and documentation`

---

## 1. Module Overview & Responsibilities

The **Admin Operations** module provides centralized platform governance, system oversight, resource monitoring, and security enforcement across the Bike Rental System.

### Primary Responsibilities:
1. **Platform Analytics & Actionable Dashboard**: Real-time aggregate statistics for active and historical users, owners, bikes, bookings, and financial transactions with 1-click drill-down navigation into filtered entity pages.
2. **User Management**: Inspection, search, role-based filtering, and security activation/deactivation of customer, owner, and administrative accounts with self-deactivation protection.
3. **Customer Supervision**: Detailed customer verification status (Aadhaar & Driving License compliance), booking frequency, cancellation history, and rental expenditure metrics with dedicated inspection summary modal.
4. **Owner Management**: Fleet overview, total owner bookings, gross earnings ledger in INR (`₹`), and verification status with inspection modal.
5. **Global Fleet Control**: Supervise all rental bicycles, registration parameters, location hubs, rental rates, and operational status (`AVAILABLE`, `BOOKED`, `UNDER_MAINTENANCE`, `NOT_AVAILABLE`) with detailed specification modals and safe availability toggle.
6. **Booking Administration**: Multi-parameter search and audit over platform bookings, scheduled pickup/return timeframes, rental amounts, and lifecycle states (`PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
7. **Payment Visibility**: Transparent read-only ledger of billing transactions, booking linkages, amounts, and transaction status (`SUCCESS`, `PENDING`, `FAILED`).
8. **Document Verification Oversight**: Interface for reviewing uploaded KYC documents (Aadhaar, Driving License, RC) submitted by customers and owners.
9. **Admin Activity Log**: Real-time audit trail capturing all administrative actions (`USER_ACTIVATED`, `USER_DEACTIVATED`, `BIKE_ACTIVATED`, `BIKE_DEACTIVATED`, `BIKE_STATUS_CHANGED`, `VERIFICATION_*`) recorded strictly after database mutations succeed.
10. **Role-Based Access Enforcement**: Strict segregation ensuring administrative endpoints and views are accessible exclusively to authenticated users with `ROLE_ADMIN`.

---

## 2. Architecture & Service Contracts

In compliance with the project architecture guidelines:
- **No direct internal modification** of teammate modules (`PaymentService`, `BookingService`, `BikeService`, `GPSService`, `Analytics`, or `Compliance`).
- **Admin consumes other modules via established service contracts**:
  - `UserService`: User account listing and account status updates (`changeUserStatus`).
  - `OwnerService`: Owner registry and fleet aggregation (`getAllOwners`).
  - `BikeService`: Complete fleet retrieval (`getAllBikesForAdmin`) and status updates (`updateBikeStatus`).
  - `BookingService`: System-wide booking retrieval (`getAllBookings`) and verification checks (`checkVerificationStatus`).
  - `PaymentService`: System-wide payment retrieval (`getAllPayments`).
  - `CurrentUserService`: Security context resolution for authenticated admin identity.
  - `VerificationAuditRepository`: Verification audit trail integration.

---

## 3. Backend REST API Reference

All Admin endpoints are mapped under the base path `/api/admin` and require JWT authentication with `ROLE_ADMIN`.

| Method | Endpoint | Description | Request Parameters / Body | Response Status | Response Type |
|---|---|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Returns summary metrics for dashboard cards | None | `200 OK` | `AdminDashboardDTO` |
| `GET` | `/api/admin/users` | List all system users across all roles | None | `200 OK` | `List<UserAdminDTO>` |
| `PUT` | `/api/admin/users/{id}/status` | Activate or deactivate user account (records activity) | `enabled` (boolean query param) | `200 OK` | `UserAdminDTO` |
| `GET` | `/api/admin/customers` | List all customers with verification and booking aggregates | None | `200 OK` | `ApiResponse<List<CustomerAdminDTO>>` |
| `GET` | `/api/admin/owners` | List all bike owners with fleet & earnings metrics | None | `200 OK` | `List<OwnerAdminDTO>` |
| `GET` | `/api/admin/bikes` | List all registered fleet vehicles | None | `200 OK` | `List<BikeAdminDTO>` |
| `PUT` | `/api/admin/bikes/{id}/status` | Update operational status of a bike (records activity) | `status` (string query param: `AVAILABLE`, `NOT_AVAILABLE`, `UNDER_MAINTENANCE`, `BOOKED`) | `200 OK` | `BikeAdminDTO` |
| `GET` | `/api/admin/bookings` | List all platform bookings | None | `200 OK` | `List<BookingAdminDTO>` |
| `GET` | `/api/admin/payments` | List all payment transaction records (read-only) | None | `200 OK` | `List<PaymentResponse>` |
| `GET` | `/api/admin/activity` | List administrative activity log records | None | `200 OK` | `List<AdminActivityDTO>` |

---

## 4. Frontend Route Architecture & Actionable Navigation

All Admin frontend pages are rendered inside [`DashboardLayout`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/layouts/DashboardLayout.tsx) protected by `<ProtectedRoute allowedRoles={["ADMIN"]}>`.

### Dashboard Card Drill-Down Navigation & URL Filter Routing:
- **Total Users** → `/admin/users`
- **Active Users** → `/admin/users?status=ACTIVE`
- **Total Owners** → `/admin/owners`
- **Total Bikes** → `/admin/bikes`
- **Active Bikes** → `/admin/bikes?status=AVAILABLE`
- **Total Bookings** → `/admin/bookings`
- **Active Bookings** → `/admin/bookings?status=ACTIVE`
- **Pending Bookings** → `/admin/bookings?status=PENDING`
- **Completed Bookings** → `/admin/bookings?status=COMPLETED`
- **Cancelled Bookings** → `/admin/bookings?status=CANCELLED`
- **Total Payments** → `/admin/payments`

### Route Breakdown:
| Route | Page Component | Key Functionality |
|---|---|---|
| `/admin/dashboard` | [`Dashboard.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Dashboard.tsx) | Live dashboard summary metric tiles with drill-down links, quick operations grid, platform health gauges, recent bookings and live activity previews. Direct entry to `/admin/reports`. |
| `/admin/users` | [`Users.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Users.tsx) | URL filter sync (`?status=ACTIVE`), search, role filter, activate/deactivate modal, user inspection modal, admin root protection. |
| `/admin/customers` | [`Customers.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Customers.tsx) | Customer KYC verification status badges, total/completed/cancelled booking counts, spend ledger, customer details inspection modal. |
| `/admin/owners` | [`Owners.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Owners.tsx) | Owner verification badges, fleet count, booking metrics, total earnings ledger in INR, owner summary modal. |
| `/admin/bikes` | [`Bikes.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Bikes.tsx) | URL filter sync (`?status=AVAILABLE`), global fleet overview, availability toggling (`AVAILABLE` ↔ `NOT_AVAILABLE`), bike specifications modal. |
| `/admin/bookings` | [`Bookings.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Bookings.tsx) | URL filter sync (`?status=PENDING`, `?status=COMPLETED`), booking audit, customer & owner linkages, booking timeline details modal. |
| `/admin/payments` | [`Payments.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Payments.tsx) | Read-only payment audit trail, semantic status badges (`SUCCESS`, `PENDING`, `FAILED`), payment receipt modal. |
| `/admin/verification` | [`Verification.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Verification.tsx) | KYC document review queue, verification badges, document image previews, rejection/approval modals. |
| `/admin/activity` | [`Activity.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Activity.tsx) | Administrative audit log table, timestamps, action types, actors, detail descriptions, search, pagination, inspection modal. |
| `/admin/reports` | [`Reports.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Reports.tsx) | Executive analytics dashboard with Recharts (Revenue Trends, Booking Lifecycle Breakdown, Fleet Readiness, Category Popularity), Date Range Filters (`All Time`, `Today`, `7 Days`, `30 Days`, `This Month`), clickable KPI cards, and CSV Report Export. |
| `/admin/profile` | [`Profile.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Profile.tsx) | Authenticated admin profile management, safe profile information updates, secure password changes, non-sensitive credential overview. |
| `/admin/settings` | [`Settings.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Settings.tsx) | Theme mode toggle (`Light`, `Dark`, `System`), table pagination defaults, platform variables, security policies, and system telemetry diagnostics. |

---

## 5. Security & Authorization Enforcement

1. **Backend Security Layer**:
   - `SecurityConfig.java` enforces `.requestMatchers("/api/admin/**", "/api/users/**", "/api/reports/**").hasRole("ADMIN")`.
   - `AdminController.java` is annotated at class-level with `@PreAuthorize("hasRole('ADMIN')")`.
   - Admin account records are protected from self-deactivation via frontend validation guard in `handleStatusAction` and backend authorization.

2. **Frontend Route Protection**:
   - `<ProtectedRoute allowedRoles={["ADMIN"]}>` prevents unauthorized access or token escalation from non-admin roles (`CUSTOMER`, `OWNER`).
   - If an unauthorized user attempts to open `/admin/*`, they are immediately redirected to `/unauthorized`.
   - Sensitive credentials (JWT tokens, password hashes, secrets) are strictly isolated and never exposed in UI views or export files.

---

## 6. Verification and Build Status

- **Frontend TypeScript Validation**: `npx tsc --noEmit` $\rightarrow$ Passed with **0 errors**.
- **Frontend Production Build**: `npx vite build` $\rightarrow$ **`✓ built successfully`**.
- **Backend Build Validation**: Maven build `mvnw clean package -DskipTests` $\rightarrow$ **`BUILD SUCCESS`**.
   - `ProtectedRoute` checks active session authentication and `allowedRoles={["ADMIN"]}`.
   - Non-admin attempts to access `/admin/*` trigger redirection to `/unauthorized`.
   - `ADMIN_SIDEBAR` is dynamically loaded in `DashboardLayout` exclusively when `user.role === "ADMIN"`.

---

## 6. UI & Design System Alignment

All Admin module views utilize the project's central design system tokens defined in `src/index.css`:
- **Containers & Surfaces**: `bg-background text-foreground`, `bg-card border border-border rounded-2xl shadow-xs`.
- **Typography & Hierarchies**: `text-xl font-bold tracking-tight text-foreground`, `text-xs text-muted-foreground`.
- **Status Badges**:
  - `ACTIVE` / `AVAILABLE` / `VERIFIED` / `SUCCESS`: `bg-green-500/10 text-green-500`
  - `INACTIVE` / `NOT_AVAILABLE` / `CANCELLED` / `FAILED`: `bg-destructive/10 text-destructive`
  - `PENDING` / `UNDER_MAINTENANCE`: `bg-amber-500/10 text-amber-500`
- **Feedback & Load States**: Animated spinners, pulse skeletons, empty-state illustration vectors with search reset hints, and `react-hot-toast` notifications.
