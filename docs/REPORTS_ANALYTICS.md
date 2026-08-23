# Section 3: Member 4 – Reports & Analytics Module Documentation

## 1. Module Overview
The **Reports & Analytics Module** provides business intelligence, operational metrics, live fleet status, transaction summaries, ride telemetry analytics, and operational reports for the Bike Rental System. It enables system administrators and platform owners to gain real-time visibility into business performance, financial turnover, fleet readiness, and user engagement.

---

## 2. Member 4 Responsibilities
- **Analytics Aggregations**: Compute real-time dashboard KPIs, revenue streams, booking volume, fleet distribution, and ride statistics.
- **Reporting Services**: Generate tabular datasets for bookings, revenue, fleet inventory, and payment audits.
- **Exporting Capabilities**: Support instantaneous client-side CSV and formatted PDF report exports with date ranges and structured schemas.
- **Read-Only Data Integrity**: Ensure non-mutating, strictly read-only execution over database entities without impacting live transactional workflows.
- **Performance & Accuracy**: Ensure database-level aggregations (`COUNT`, `SUM`, `GROUP BY`) minimize memory footprint and execution overhead.

---

## 3. Analytics Architecture
The module follows a clean 3-tier Spring Boot architecture integrated with a React TypeScript admin dashboard:

```mermaid
flowchart TD
    AdminUI[Admin Dashboard / Reports UI (React + Recharts + jsPDF)] -->|HTTP REST| APIController[Analytics & Report Controllers]
    APIController -->|Service Layer| Services[AnalyticsServiceImpl & ReportServiceImpl]
    Services -->|JPA & Aggregation Queries| Repo[AnalyticsRepository & Entity Repositories]
    Repo -->|Read-Only SQL| DB[(MySQL Database)]
```

- **Frontend**: `Reports.tsx` consumes `analyticsService.ts` and `reportService.ts` via Axios, displaying visual charts (Area, Bar, Pie charts via Recharts), KPI metric cards, interactive filter toolbars, and export buttons.
- **Backend Controllers**: `AnalyticsController` and `ReportController` expose REST endpoints with strict ISO date formatting.
- **Service Layer**: `AnalyticsServiceImpl` and `ReportServiceImpl` apply `@Transactional(readOnly = true)` annotations, validate date boundaries, and map query projections into typed DTOs.
- **Database Repositories**: `AnalyticsRepository` executes optimized JPQL aggregation queries against MySQL tables.

---

## 4. Data Sources & Database Integration
The module reads from live project database tables:

1. **`users` (`User` entity)**:
   - Tracks total user base, active/enabled status, role breakdown (`CUSTOMER`, `OWNER`, `ADMIN`), and registration dates.
2. **`bikes` (`Bike` entity)**:
   - Tracks fleet size, availability status (`AVAILABLE`, `BOOKED`, `UNDER_MAINTENANCE`, `NOT_AVAILABLE`), rental pricing, location, and creation dates.
3. **`bookings` (`Booking` entity)**:
   - Tracks reservation volume, status distribution (`PENDING`, `APPROVED`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `REJECTED`), payment status, start/return timestamps, and rental fees.
4. **`payments` (`Payment` entity)**:
   - Tracks revenue transactions, payment dates, amounts, and transaction outcomes (`SUCCESS`, `FAILED`, `PENDING`).
5. **`rides` (`Ride` entity)**:
   - Tracks ride sessions, active rides (`endedAt IS NULL`), completed rides, travel distance (km), duration (seconds), and start dates.

---

## 5. Analytics APIs

All analytics endpoints are exposed under `/api/analytics`:

| HTTP Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | None | Retrieves platform-wide snapshot across users, fleet, bookings, revenue, and rides. |
| `GET` | `/api/analytics/revenue` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Aggregates revenue, payment counts, average payment, and revenue grouped by date. |
| `GET` | `/api/analytics/bookings` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns booking count grouped by `BookingStatus`. |
| `GET` | `/api/analytics/users` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns user counts grouped by role and total enabled users. |
| `GET` | `/api/analytics/bikes` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns bike counts grouped by `BikeStatus` and new fleet additions. |
| `GET` | `/api/analytics/rides` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns ride counts, active/completed counts, total/average distance, duration, and date breakdown. |

---

## 6. Report APIs

All report generation endpoints are exposed under `/api/reports`:

| HTTP Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/bookings` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns list of detailed booking records within the given date period. |
| `GET` | `/api/reports/revenue` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns list of completed revenue transactions within the given date period. |
| `GET` | `/api/reports/bikes` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns list of bikes registered within the given date period. |
| `GET` | `/api/reports/payments` | `from=YYYY-MM-DD`, `to=YYYY-MM-DD` | Returns full payment transaction audit records within the given date period. |

---

## 7. Dashboard Metrics
The executive dashboard presents summary metric cards:
- **Today's Revenue**: Total revenue from successful payments for the current day.
- **Today's Bookings**: Count of bookings initiated today.
- **Active Rentals**: Count of bookings currently in active progress.
- **Completed Rentals**: Count of bookings completed today.
- **Available Fleet**: Active bikes ready for immediate customer booking out of total fleet size.
- **Total Customers**: Count of registered customers on the platform.
- **Fleet Utilization Percentage**: Calculated dynamically as `(bookedBikes / totalBikes) * 100`.

---

## 8. Booking Analytics
- Grouped aggregation on `BookingStatus` (`PENDING`, `APPROVED`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `REJECTED`).
- Visualized as a doughnut lifecycle distribution chart in the dashboard.
- Safe zero-count handling for statuses with no entries in the selected date window.

---

## 9. Revenue Analytics
- Calculates total successful payment revenue (`calculateSuccessfulPaymentRevenue`).
- Groups revenue daily (`revenueByDate`) to display the area trend chart.
- Computes average payment value per successful transaction.
- Accurately tracks successful vs. failed payment transaction counts.

---

## 10. User Analytics
- Groups registered users by `Role` (`CUSTOMER`, `OWNER`, `ADMIN`).
- Computes total users and active enabled accounts (`countEnabledUsers`).
- Tracks user onboarding velocity via `countUsersCreatedBetween`.

---

## 11. Bike Analytics
- Groups fleet by operational status: `AVAILABLE` (green), `BOOKED` (blue), `UNDER_MAINTENANCE` (amber), `NOT_AVAILABLE` (red).
- Visualized as an operational readiness bar chart.
- Tracks fleet acquisition via `countBikesCreatedBetween`.

---

## 12. Ride Analytics
- Measures operational trip activity: total rides, active ongoing trips, and completed journeys.
- Computes telemetry aggregates: total distance traveled (km), average distance per trip, total ride duration (seconds), and average duration.
- Tracks ride trip frequency grouped by date (`ridesByDate`).

---

## 13. Date-Range Filtering & Boundary Calculations
The system implements a consistent date boundary logic:
- **Start Boundary**: `from.atStartOfDay()` (`00:00:00.000000`)
- **End Boundary**: `to.plusDays(1).atStartOfDay()` (`00:00:00.000000` of the following day)
- **Validation**:
  - `from` and `to` are required (rejects `null`).
  - `from.isAfter(to)` throws `IllegalArgumentException` ("From date cannot be after to date").
- **Supported Frontend Presets**:
  1. `TODAY`: Current day only.
  2. `7DAYS`: Past 7 rolling days (`today - 6` to `today`).
  3. `30DAYS`: Past 30 rolling days (`today - 29` to `today`).
  4. `THIS_MONTH`: First day of current month to current day.

---

## 14. Detailed Reports Specifications

### A. Booking Report (`/api/reports/bookings`)
- **Fields**: `bookingId`, `bikeId`, `customerId`, `bookingStatus`, `paymentStatus`, `rentalAmount`, `startTime`, `returnTime`, `actualPickupTime`, `actualReturnTime`, `createdAt`.
- **Filtering**: Filters on `createdAt >= start AND createdAt < end`.

### B. Revenue Report (`/api/reports/revenue`)
- **Fields**: `paymentId`, `bookingId`, `amount`, `paymentDate`, `status`.
- **Filtering**: Only includes `status = 'SUCCESS'` and `paymentDate` in range.

### C. Bike Report (`/api/reports/bikes`)
- **Fields**: `bikeId`, `ownerId`, `bikeName`, `brand`, `model`, `registrationNumber`, `rentalPrice`, `location`, `bikeStatus`, `rentalType`, `hourlyRate`, `availableDate`, `createdAt`.
- **Filtering**: Filters on `createdAt >= start AND createdAt < end`.

### D. Payment Report (`/api/reports/payments`)
- **Fields**: `paymentId`, `bookingId`, `amount`, `status`, `paymentDate`, `createdAt`.
- **Filtering**: Filters on `paymentDate >= start AND paymentDate < end`.

---

## 15. CSV Export
- Implemented in `exportReportToCSV` (`Reports.tsx`) and `exportCsv.ts`.
- Extracts dynamic table headers and row fields.
- Safely escapes quotes (`""`) and formats dates and null values (`""`).
- Downloads dynamically with formatted filenames (e.g., `bookings-report.csv`, `revenue-report.csv`).

---

## 16. PDF Export
- Implemented in `exportReportToPDF` (`Reports.tsx`) using `jspdf` and `jspdf-autotable`.
- Renders in landscape `A4` format with clear section header, date range period, uppercase column titles, formatted numeric values, and responsive padding.
- Handles empty states and large tabular datasets cleanly.

---

## 17. Read-Only Business Rule
- All repository queries and service methods in the Reports & Analytics module are strictly **READ-ONLY**.
- Annotated with Spring's `@Transactional(readOnly = true)`.
- No `INSERT`, `UPDATE`, or `DELETE` queries are executed by this module.
- Business transaction workflows (booking creation, status changes, payments, GPS ride updates) remain 100% untouched.

---

## 18. Testing Performed
Automated unit and integration test suite created and validated:

1. **`AnalyticsServiceAccuracyTest`**:
   - `testGetDashboardAnalyticsAccuracy`: Validates KPI aggregations, utilization percentage, booking counts, and ride metrics.
   - `testGetRevenueAnalyticsAccuracy`: Validates successful/failed payment revenue, averages, and date grouping.
   - `testGetRevenueAnalyticsZeroPayments`: Validates zero payment boundary handling without divide-by-zero exceptions.
   - `testGetBookingAnalyticsAccuracy`: Validates status group mapping.
   - `testGetUserAnalyticsAccuracy`: Validates role counts, active users, and totals.
   - `testGetBikeAnalyticsAccuracy`: Validates status distributions and date range counts.
   - `testGetRideAnalyticsAccuracy`: Validates distance and duration calculations.
   - `testDateRangeValidation`: Validates rejection of invalid dates and reversed ranges.

2. **`ReportServiceAccuracyTest`**:
   - `testGetBookingReportAccuracyAndBoundaries`: Validates exact start and end boundary inclusions and exclusions.
   - `testGetRevenueReportFiltersSuccessAndDate`: Validates filtering of non-success payments.
   - `testGetBikeReportAccuracy`: Validates bike report projection mapping.
   - `testGetPaymentReportAccuracy`: Validates payment audit logs.
   - `testEmptyDateRangeResults`: Validates empty result handling.

3. **`AnalyticsControllerTest` & `ReportControllerTest`**:
   - Validates HTTP 200 responses, parameter binding, and date range error handling.

**Test Run Result**: 50/50 test cases passed (0 failures, 0 errors, 0 skipped).

---

## 19. Performance Validation
- **Database-Level Aggregation**: Calculations (`SUM`, `COUNT`, `AVG`) are delegated to database JPQL queries to avoid in-memory overhead.
- **Index Utilization**: Queries leverage indexed entity columns (`idx_bookings_customer_id`, `idx_bookings_bike_id`, `idx_bookings_status`, `idx_bikes_status`, `idx_bikes_owner_id`).
- **Read-Only Transaction Isolation**: Prevents dirty checking and hibernate session entity snapshot overhead.
- **Frontend Optimization**: Recharts charts use memoized data mappings (`useMemo`) and debounced network requests.

---

## 20. Known Limitations & Future Roadmap
1. **Large Dataset Pagination for Tabular Reports**:
   - Currently, report tables load all matching rows for the selected timeframe. For high-volume enterprise deployments with 100,000+ daily rentals, cursor-based pagination can be added to the tabular view.
2. **Scheduled Automated Email Dispatch**:
   - Report generation is currently on-demand via the UI. Automated daily/weekly PDF dispatch via cron task can be integrated in future phases.
