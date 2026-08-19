# Bike Rental System — Section 3: Admin Operations Module Documentation

**Author / Assigned Role:** Member 3 (Admin Operations)  
**Development Milestone:** Day 8 — Final Polish and Documentation  
**Commit Reference:** `fix(admin): finalize administration workflows and documentation`

---

## 1. Module Overview & Responsibilities

The **Admin Operations** module provides centralized platform governance, system oversight, resource monitoring, and security enforcement across the Bike Rental System.

### Primary Responsibilities:
1. **Platform Analytics & Dashboard**: Real-time aggregate statistics for active and historical users, owners, bikes, bookings, and financial transactions.
2. **User Management**: Inspection, search, role-based filtering, and security activation/deactivation of customer, owner, and administrative accounts.
3. **Customer Supervision**: Detailed customer verification status (Aadhaar & Driving License compliance), booking frequency, cancellation history, and rental expenditure metrics.
4. **Owner Management**: Fleet overview, total owner bookings, gross earnings, and account status.
5. **Global Fleet Control**: Supervise all rental bicycles, registration parameters, location hubs, and operational status (`AVAILABLE`, `BOOKED`, `UNDER_MAINTENANCE`, `NOT_AVAILABLE`).
6. **Booking Administration**: Multi-parameter search and audit over platform bookings, pickup/return timeframes, rental amounts, and lifecycle states.
7. **Payment Visibility**: Transparent read-only ledger of billing transactions, booking linkages, amounts, and transaction status.
8. **Document Verification Oversight**: Interface for reviewing uploaded KYC documents (Aadhaar, Driving License, RC) submitted by customers and owners.
9. **Admin Activity Log**: Audit trail view for administrative events and system actions.
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

---

## 3. Backend REST API Reference

All Admin endpoints are mapped under the base path `/api/admin` and require JWT authentication with `ROLE_ADMIN`.

| Method | Endpoint | Description | Request Parameters / Body | Response Status | Response Type |
|---|---|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Returns summary metrics for dashboard cards | None | `200 OK` | `AdminDashboardDTO` |
| `GET` | `/api/admin/users` | List all system users across all roles | None | `200 OK` | `List<UserAdminDTO>` |
| `PUT` | `/api/admin/users/{id}/status` | Activate or deactivate user account | `enabled` (boolean query param) | `200 OK` | `UserAdminDTO` |
| `GET` | `/api/admin/customers` | List all customers with verification and booking aggregates | None | `200 OK` | `ApiResponse<List<CustomerAdminDTO>>` |
| `GET` | `/api/admin/owners` | List all bike owners with fleet & earnings metrics | None | `200 OK` | `List<OwnerAdminDTO>` |
| `GET` | `/api/admin/bikes` | List all registered fleet vehicles | None | `200 OK` | `List<BikeAdminDTO>` |
| `PUT` | `/api/admin/bikes/{id}/status` | Update operational status of a bike | `status` (string query param: `AVAILABLE`, `NOT_AVAILABLE`, `UNDER_MAINTENANCE`, `BOOKED`) | `200 OK` | `BikeAdminDTO` |
| `GET` | `/api/admin/bookings` | List all platform bookings | None | `200 OK` | `List<BookingAdminDTO>` |
| `GET` | `/api/admin/payments` | List all payment transaction records (read-only) | None | `200 OK` | `List<PaymentResponse>` |
| `GET` | `/api/admin/activity` | List administrative activity log records | None | `200 OK` | `List<AdminActivity>` |

---

## 4. Frontend Route Architecture & Pages

All Admin frontend pages are rendered inside [`DashboardLayout`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/layouts/DashboardLayout.tsx) protected by `<ProtectedRoute allowedRoles={["ADMIN"]}>`.

| Route | Page Component | Key Functionality |
|---|---|---|
| `/admin/dashboard` | [`Dashboard.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Dashboard.tsx) | Live dashboard summary metric tiles, skeleton loading, manual refresh trigger. |
| `/admin/users` | [`Users.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Users.tsx) | Searchable user table, role & status filtering, activation/deactivation confirmation modal. |
| `/admin/customers` | [`Customers.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Customers.tsx) | Customer KYC verification status badges, total/completed/cancelled booking counts, rental spend. |
| `/admin/owners` | [`Owners.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Owners.tsx) | Owner verification badges, fleet count, booking metrics, total earnings ledger in INR. |
| `/admin/bikes` | [`Bikes.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Bikes.tsx) | Global fleet overview, availability toggling (`AVAILABLE` ↔ `NOT_AVAILABLE`), status badges. |
| `/admin/bookings` | [`Bookings.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Bookings.tsx) | Booking audit, customer & owner linkages, booking status, payment status, formatted currency. |
| `/admin/payments` | [`Payments.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Payments.tsx) | Read-only payment audit trail, booking IDs, timestamps, payment status indicators. |
| `/admin/verification` | [`Verification.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Verification.tsx) | KYC document review queue, verification badges, document image previews. |
| `/admin/activity` | [`Activity.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Activity.tsx) | Administrative audit log table, timestamps, action types, actors, detail descriptions, search. |
| `/admin/reports` | [`Reports.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Reports.tsx) | Platform reports placeholder module. |
| `/admin/settings` | [`Settings.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Settings.tsx) | Administrative configuration panel. |
| `/admin/profile` | [`Profile.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/admin/Profile.tsx) | Admin account credentials and profile details. |

---

## 5. Security & Authorization Enforcement

1. **Backend Security Layer**:
   - `SecurityConfig.java` enforces `.requestMatchers("/api/admin/**", "/api/users/**", "/api/reports/**").hasRole("ADMIN")`.
   - `AdminController.java` is annotated at class-level with `@PreAuthorize("hasRole('ADMIN')")`.
   - Admin account records are protected from self-deactivation via frontend validation guard in `handleStatusAction`.

2. **Frontend Route Protection**:
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
  - `PENDING` / `UNDER_MAINTENANCE`: `bg-amber-500/10 text-amber-500` or `bg-yellow-500/10 text-yellow-600`
- **Feedback & Load States**: Animated spinners, pulse skeletons, empty-state illustration vectors with search reset hints, and `react-hot-toast` notifications.

---

## 7. Known Integration Boundaries & Notes

- **Payment Operations**: The Admin module maintains read-only payment inspection through `/api/admin/payments`. Financial mutations (refunds/payout processing) are encapsulated within Member 2's `PaymentService` domain.
- **Verification Review**: Document approval/rejection updates use `bookingService.checkVerificationStatus` and customer identity records.
- **Activity Log Persistence**: `GET /api/admin/activity` returns an array of administrative audit entries. When connected to a centralized log database, the UI dynamically renders entries with full search and pagination capabilities.
