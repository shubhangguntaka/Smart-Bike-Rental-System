# System Architecture Documentation

The Bike Rental System is built on a clean three-tier architecture connecting the React frontend, Spring Boot API gateway, and the MySQL database engine.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React Tier]
        App[AppRouter] --> Pages[Pages Catalog]
        Pages --> Context[BookingContext]
        Context --> Hooks[useBooking]
        Hooks --> Services[bookingService]
        Services --> Axios[Axios API client]
    end

    subgraph Backend [Spring Boot Tier]
        Axios --> Controllers[REST Controllers]
        Controllers --> Security[Spring Security / JWT Filter]
        Security --> ServicesImpl[Service Layer]
        ServicesImpl --> Validators[Booking Validator]
        ServicesImpl --> Calculators[Rental Calculator]
        ServicesImpl --> QRGen[QRCode Service]
        ServicesImpl --> Repositories[JPA Repositories]
    end

    subgraph Database [Storage Tier]
        Repositories --> DB[(MySQL Database)]
    end
```

---

## 2. Integrated Core Flows

### 2.1 Verification Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant React as Frontend BookBike
    participant API as Booking Controller
    participant Service as Booking ServiceImpl
    participant Verify as Verification Module

    Customer->>React: Click "Book Now"
    React->>API: GET /check-verification?customerId=X
    API->>Service: checkVerificationStatus(customerId)
    Service->>Verify: Query Aadhaar & DL approvals
    Verify-->>Service: Return verification approval results
    Service-->>API: Return boolean status
    API-->>React: Response (true/false)

    alt is verified
        React->>Customer: Render billing checkout
    else is NOT verified
        React->>Customer: Alert & redirect to /verification page
    end
```

### 2.2 Payment & QR Code Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Checkout as Payment Page
    participant PayAPI as Payment Controller
    participant PayService as Payment ServiceImpl
    participant BookRepo as Booking Repository
    participant QRService as QRCode Service

    Customer->>Checkout: Choose payment method & submit
    Checkout->>PayAPI: POST /api/payments/process
    PayAPI->>PayService: processPayment(Request)
    
    alt payment success
        PayService->>BookRepo: Set status = CONFIRMED, paymentStatus = SUCCESS
        PayService->>QRService: generateQRCode(Text, 250, 250)
        QRService-->>PayService: Return base64 QR Data URI
        PayService->>BookRepo: Save QR code to database record
        PayService-->>PayAPI: Return success response
        PayAPI-->>Checkout: Redirect to receipt with QR Code
    else payment failure
        PayService->>BookRepo: Set status = PENDING, paymentStatus = FAILED
        PayService-->>PayAPI: Return failure response
        PayAPI-->>Checkout: Stay on page with retry warning
    end
```
