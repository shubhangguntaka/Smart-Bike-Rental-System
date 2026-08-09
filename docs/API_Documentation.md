# Booking Module API Specification

This catalog outlines all REST endpoints exposed by the Booking and Payment modules.

---

## 1. Create Booking
*   **Method**: `POST`
*   **URL**: `/api/bookings`
*   **Authentication**: `CUSTOMER` role required.
*   **Request Params**:
    *   `customerId` (Long, query parameter)
*   **Request Body**:
    ```json
    {
      "bikeId": 5,
      "pickupDate": "2026-08-10",
      "returnDate": "2026-08-15"
    }
    ```
*   **Validation Rules**:
    - `bikeId`, `pickupDate`, `returnDate` must not be null.
    - Dates must be in the present or future.
    - `returnDate` must be after `pickupDate`.
    - Customer must be Aadhaar & DL verified.
    - Bike status must be `AVAILABLE`.
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Booking created successfully.",
      "data": {
        "bookingId": 12,
        "bikeId": 5,
        "customerId": 11,
        "bookingReference": "BK-12",
        "pickupDate": "2026-08-10T00:00:00",
        "returnDate": "2026-08-15T00:00:00",
        "totalDays": 5,
        "rentalAmount": 2500.00,
        "bookingStatus": "PENDING",
        "paymentStatus": "PENDING",
        "qrCode": null
      }
    }
    ```
*   **Error Responses**:
    - `400 Bad Request` (VERIFICATION_REQUIRED): "Customer Aadhaar or Driving License verification required."
    - `400 Bad Request` (BIKE_UNAVAILABLE): "Bike is not available."

---

## 2. Process Payment
*   **Method**: `POST`
*   **URL**: `/api/payments/process`
*   **Authentication**: `CUSTOMER` or `ADMIN` role required.
*   **Request Body**:
    ```json
    {
      "bookingId": 12,
      "amount": 2950.00,
      "status": "SUCCESS"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Payment processed successfully.",
      "data": {
        "paymentId": 45,
        "bookingId": 12,
        "amount": 2950.00,
        "status": "SUCCESS",
        "paymentDate": "2026-08-07T19:00:00"
      }
    }
    ```

---

## 3. Retrieve Booking Details
*   **Method**: `GET`
*   **URL**: `/api/bookings/{bookingId}`
*   **Authentication**: Caller must be Renter, Bike Owner, or `ADMIN`.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Booking fetched successfully.",
      "data": {
        "bookingId": 12,
        "bikeId": 5,
        "customerId": 11,
        "bookingReference": "BK-12",
        "pickupDate": "2026-08-10T00:00:00",
        "returnDate": "2026-08-15T00:00:00",
        "totalDays": 5,
        "rentalAmount": 2500.00,
        "bookingStatus": "CONFIRMED",
        "paymentStatus": "SUCCESS",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAA..."
      }
    }
    ```

---

## 4. Scan Booking QR Code
*   **Method**: `POST`
*   **URL**: `/api/bookings/scan`
*   **Authentication**: `OWNER` or `ADMIN` role required.
*   **Request Params**:
    *   `qrCode` (String, query parameter)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "QR Code scanned successfully.",
      "data": {
        "bookingId": 12,
        "bookingStatus": "CONFIRMED",
        "paymentStatus": "SUCCESS"
      }
    }
    ```

---

## 5. Update Booking Status
*   **Method**: `PUT`
*   **URL**: `/api/bookings/{bookingId}/status`
*   **Authentication**: `OWNER` or `ADMIN` role required.
*   **Request Params**:
    *   `status` (BookingStatus enum: e.g. `ACTIVE`, `COMPLETED`, `CANCELLED`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Booking status updated successfully.",
      "data": {
        "bookingId": 12,
        "bookingStatus": "ACTIVE"
      }
    }
    ```
*   **Error Responses**:
    - `400 Bad Request` (IllegalStateException): "Handover can only be confirmed for bookings that are currently CONFIRMED."
