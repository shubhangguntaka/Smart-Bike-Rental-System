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
└── payment/
    ├── controller/
    │   └── PaymentController.java        # Exposes payment process REST endpoints
    ├── dto/
    │   ├── PaymentRequest.java
    │   └── PaymentResponse.java
    ├── entity/
    │   └── Payment.java                  # JPA mapping for transaction logs
    ├── repository/
    │   └── PaymentRepository.java        # JpaRepository for payment entries
    └── service/
        ├── PaymentService.java
        └── impl/
            └── PaymentServiceImpl.java    # Logic for billing records & QR creation
```
