# Booking Module Technical Documentation

This document describes the structure, design, and responsibilities of the Booking Module.

## Introduction
The Booking Module provides the central transactional system of the Bike Rental application. It enables renters to book bikes, processes verifications and billing, and manages active ride tracking.

## Objectives
- Restrict rental access to drivers with approved Aadhaar and DL status.
- Generate secure digital invoices and print-friendly PDF receipts.
- Deliver real-time status transitions using secure QR scanner handovers.
- Maintain micro-architectural standards with JPA repositories and React Context structures.

## Scope
The module encapsulates:
- Rent forms and pricing computation.
- JPA mapping indexes for quick query lookups.
- Mock payment integration (Cards & UPI).
- Handover scanning interface using ZXing QR codes.

## Module Folder Structures

### 1. Frontend Structure
```text
src/
├── api/
│   ├── bookingApi.ts        # Axios mappings to Booking Controller
│   └── paymentApi.ts        # Axios mappings to Payment Controller
├── components/
│   └── booking/
│       ├── BookingCard.tsx      # Hover-lift summary card
│       ├── BookingForm.tsx      # Date parameters selector with Yup
│       ├── BookingQRCode.tsx    # Renders base64 data URIs
│       ├── BookingReceipt.tsx   # Printable PDF receipt
│       ├── BookingStatus.tsx    # Badge wrapper
│       ├── BookingStatusChip.tsx # Color-coded status chip
│       ├── BookingTimeline.tsx  # Active Stepper timeline
│       ├── QRScanner.tsx        # Pulsing scan mockup viewport
│       └── RideSummary.tsx      # Breakdown detailing rent + GST
├── context/
│   └── BookingContext.tsx   # Holds global state & API callbacks
├── hooks/
│   └── useBooking.ts        # Consumes context values safely
├── pages/
│   ├── customer/
│   │   ├── BookBike.tsx         # Rent search catalog with shimmers
│   │   ├── BookingHistory.tsx   # History table with cancellation
│   │   ├── BookingQRCodePage.tsx # Presents large QR to owners
│   │   ├── Payment.tsx          # Card/UPI payment checkout page
│   │   └── RideTracking.tsx     # Active duration & simulation map
│   └── owner/
│       └── QRScannerPage.tsx    # Owner-side scan landing screen
└── routes/
    └── AppRoutes.tsx        # Declares customer/owner dashboard paths
```

### 2. Backend Structure
```text
src/main/java/com/sssit/bikerental/modules/
├── booking/
│   ├── controller/
│   │   └── BookingController.java        # Exposes booking REST endpoints
│   ├── dto/
│   │   ├── BookingRequest.java           # Date and bike inputs DTO
│   │   └── BookingResponse.java          # Booking details outputs DTO
│   ├── entity/
│   │   └── Booking.java                  # JPA mapping with index declarations
│   ├── enums/
│   │   ├── BookingStatus.java            # Status mapping (PENDING, ACTIVE, etc.)
│   │   └── PaymentStatus.java            # Payment mapping (SUCCESS, FAILED)
│   ├── exception/
│   │   ├── BookingNotAvailableException.java
│   │   └── VerificationRequiredException.java
│   ├── mapper/
│   │   └── BookingMapper.java            # Conversions between entities & DTOs
│   ├── repository/
│   │   └── BookingRepository.java        # Parameterized JpaRepository interface
│   ├── service/
│   │   ├── BookingService.java           # Interface declarations
│   │   └── QRCodeService.java            # Interface for QR code generation
│   ├── service/impl/
│   │   ├── BookingServiceImpl.java       # Concrete business logic & security checks
│   │   └── QRCodeServiceImpl.java        # ZXing PNG QR code generator implementation
│   └── util/
│       └── BookingCalculator.java        # Total rent calculator utility
│   └── payment/
│       ├── config/
│       │   └── PaymentProperties.java        # Platform fee & late charge configurations
│       ├── controller/
│       │   └── PaymentController.java        # Exposes payment process REST endpoints
│       ├── dto/
│       │   ├── InvoiceDTO.java
│       │   ├── PaymentRequest.java
│       │   └── PaymentResponse.java
│       ├── entity/
│       │   ├── Payment.java                  # JPA mapping for transaction logs
│       │   └── PaymentStatus.java            # State machine enum
│       ├── gateway/
│       │   └── RazorpayGateway.java          # Order creation & signature verification
│       ├── repository/
│       │   └── PaymentRepository.java        # JpaRepository for payment entries
│       └── service/
│           ├── PaymentCalculationService.java
│           ├── PaymentService.java
│           └── impl/
│               ├── PaymentCalculationServiceImpl.java # Authoritative billing calculations
│               └── PaymentServiceImpl.java            # Payment lifecycle management
```

## Payment & Billing Lifecycle

### 1. State Machine & Order Sequence
```text
Booking Requested / Approved / Active
   └── Payment: NOT_STARTED

Bike Handover -> Trip in progress -> Bike Return Confirmed
   └── Backend: Booking.actualReturnTime recorded

Customer requests Payment Preparation (POST /api/payments/prepare/{bookingId})
   └── Payment: READY_FOR_PAYMENT (Razorpay order generated with authoritative final amount)

Payment processing initiated by checkout (POST /api/payments/process)
   └── Payment: PROCESSING (Atomic transition)

Signature verification:
   ├── Verified -> Payment: SUCCESS (Invoice INV-{bookingId}-{paymentId} generated)
   └── Verification Failed -> Payment: FAILED (Allows retry creating fresh provider order)
```

### 2. Actual-Duration & Early Return Billing
- **Early Return (`actualReturn < scheduledReturn`)**: The customer is charged based on actual billable hours using the bike's hourly rate, ensuring they do not pay for unused scheduled duration.
- **On-time Return (`actualReturn <= scheduledReturn + grace`)**: Normal scheduled rental amount is charged.
- **Late Return (`actualReturn > scheduledReturn + grace`)**: Base rental amount plus configured flat late charge from `PaymentProperties`.
- **Platform Fee Tiering**: Automatically computed based on configured transaction threshold (3% below threshold, 5% above threshold).
- **Backend Authority**: All monetary computations utilize `BigDecimal` with strict `HALF_UP` rounding. Frontend amounts are never trusted for payment processing.

### 3. Booking Cancellation Workflow
- **Customer Cancellation**: Can cancel only own bookings in `PENDING`, `VERIFICATION_REQUIRED`, `APPROVED`, or `CONFIRMED` state. Cannot cancel `ACTIVE` or `COMPLETED` bookings. Reason is required (up to 500 chars), with `cancelledBy=CUSTOMER` and timestamp recorded.
- **Owner Cancellation**: Can cancel bookings associated with own bikes in eligible states. Cannot cancel another owner's booking or `ACTIVE` bookings. Recorded with `cancelledBy=OWNER`.
- **Admin Cancellation**: System administrators can cancel eligible bookings across the platform (`cancelledBy=ADMIN`).
- **Bike Availability Protection**: When a booking is cancelled, the bike status is restored to `AVAILABLE` only after verifying that no other concurrent `ACTIVE`, `CONFIRMED`, or `APPROVED` reservation requires the bike.
- **Payment Invalidation**: Cancelled bookings cannot prepare payment or transition to `READY_FOR_PAYMENT`.

### 4. Security & Ownership Enforcement
- **IDOR Protection**: All payment lookup, history, and invoice endpoints strictly validate that the authenticated `customerId` matches the payment or booking record. Admin role retains cross-tenant oversight.
- **Invoice Access**: Invoices are accessible exclusively for successful transactions (`PaymentStatus.SUCCESS`).

