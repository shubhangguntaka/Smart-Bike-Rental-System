# Booking Module Testing Report

This report outlines key validation checks, edge-case assertions, and test scripts used to verify the reliability, correctness, and security of the Booking module.

---

## 1. Automated Unit & Integration Tests

### 1.1 Backend Test Scenarios
*   **Booking Creation Verification**: Asserts that sending valid DTO inputs to `createBooking()` saves a record with status `PENDING` and returns correct totals.
*   **Identity Blockade Validation**: Sends booking requests for unverified renter IDs. Verifies that `VerificationRequiredException` is thrown and returns HTTP `400 Bad Request`.
*   **Unavailable Bike Conflict Assertion**: Sends booking requests targeting a bike whose status is already `BOOKED`. Verifies that `BookingNotAvailableException` is thrown.
*   **Role Guard Validations**: Attempts to invoke `scanQRCode` utilizing a role token matching `CUSTOMER`. Asserts that Spring Security throws `AccessDeniedException` (HTTP `403 Forbidden`).

---

## 2. Manual Testing Matrices

| Test Case ID | Feature Area | Input Conditions | Expected Behavior | Actual Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-B01** | Date Validations | Pickup date in the past | Yup validation stops submit, displays error message | **Pass** |
| **TC-B02** | Date Range Bounds | Return date before pickup | Form rejects action, highlights return field error | **Pass** |
| **TC-B03** | Renter Verification | User missing approved Aadhaar/DL records | API throws `400`, frontend displays verification warning | **Pass** |
| **TC-B04** | Billing Checkouts | Simulated Card Payment `SUCCESS` | State transitions to `CONFIRMED`, QR code generated | **Pass** |
| **TC-B05** | Transaction Failures | Simulated Card Payment `FAILED` | State remains `PENDING`, paymentStatus transitions to `FAILED` | **Pass** |
| **TC-B06** | QR Code Validation | Scan valid QR reference code | Resolved details are fetched, confirms handover successfully | **Pass** |
| **TC-B07** | QR Replay Prevention | Scan completed QR reference code | Handler blocks pickup button, indicates ride completed | **Pass** |
| **TC-B08** | Unauthorized Access | Attempt reading another customer's invoice | Service throws AccessDeniedException (403 Forbidden) | **Pass** |

---

## 3. Security Hardening Validations

### 3.1 SQL Injection Protection Testing
*   **Input**: `CustomerId` query parameter value containing `' OR '1'='1`.
*   **Expected**: Rejected by parameter binder or parsed as a valid numeric boundary representation. JPA parameterized bindings prevent raw concatenations.
*   **Result**: Secure.

### 3.2 XSS Protection Testing
*   **Input**: Setting bike model name string to `<script>alert('xss')</script>`.
*   **Expected**: Renders as plain string safely inside React components. No `dangerouslySetInnerHTML` is used in presentational views.
*   **Result**: Secure.
