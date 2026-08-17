# Bike Rental System — Section 1 & 2 API Specification

This catalog outlines all REST endpoints exposed by the backend for Section 1 and Section 2 frontend integration.

---

## 1. Authentication Module (`/api/auth`)

### 1.1 Register User
* **Endpoint:** `/api/auth/register`
* **Method:** `POST`
* **Authentication:** Not required
* **Role:** Public
* **Request Body:**
  ```json
  {
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul@example.com",
    "phoneNumber": "9876543210",
    "password": "Password@123",
    "role": "CUSTOMER"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. OTP sent successfully.",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8f3e...",
      "tokenType": "Bearer",
      "userId": 11,
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "CUSTOMER"
    }
  }
  ```
* **Possible Errors:** `400 Bad Request` (Validation error), `409 Conflict` (Email already registered).
* **Frontend Service:** `authService.register`
* **Frontend Usage:** [`src/pages/auth/Register.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/auth/Register.tsx)

### 1.2 Login User
* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Authentication:** Not required
* **Role:** Public
* **Request Body:**
  ```json
  {
    "email": "rahul@example.com",
    "password": "Password@123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8f3e...",
      "tokenType": "Bearer",
      "userId": 11,
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "CUSTOMER"
    }
  }
  ```
* **Possible Errors:** `400 Bad Request`, `401 Unauthorized` (Invalid credentials).
* **Frontend Service:** `authService.login`
* **Frontend Usage:** [`src/pages/auth/Login.tsx`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/pages/auth/Login.tsx)

### 1.3 Refresh Token
* **Endpoint:** `/api/auth/refresh-token`
* **Method:** `POST`
* **Authentication:** Not required (uses refresh token in body)
* **Role:** Public
* **Request Body:**
  ```json
  {
    "refreshToken": "d8f3e..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully.",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8f3e...",
      "tokenType": "Bearer"
    }
  }
  ```
* **Possible Errors:** `401 Unauthorized` (Invalid or expired refresh token).
* **Frontend Service:** Handled centrally in Axios response interceptor ([`src/api/axios.ts`](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-frontend/src/api/axios.ts)).

### 1.4 Logout User
* **Endpoint:** `/api/auth/logout`
* **Method:** `POST`
* **Authentication:** Bearer token (optional depending on state) + Refresh token body
* **Request Body:**
  ```json
  {
    "refreshToken": "d8f3e..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
* **Frontend Service:** `authService.logout` / `AuthContext.logout`

---

## 2. Verification Module (`/api/aadhaar`, `/api/driving-license`, `/api/bike-document`, `/api/ocr`)

### 2.1 Verify Aadhaar
* **Endpoint:** `/api/aadhaar/verify`
* **Method:** `POST`
* **Authentication:** Required (`CUSTOMER`, `OWNER`, `ADMIN`)
* **Content-Type:** `multipart/form-data`
* **Request Form Data:**
  - `file`: MultipartFile (Aadhaar image)
  - `customerId`: Long (optional)
  - `purpose`: String (e.g. `BIKE_OWNER` or `USER`)
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "aadhaarNumber": "XXXXXXXX1234",
    "fullName": "Rahul Sharma",
    "gender": "Male",
    "verified": true,
    "message": "Aadhaar verified successfully"
  }
  ```
* **Possible Errors:** `400 Bad Request` (Invalid/cropped image or QR decode failure).
* **Frontend Service:** `verificationService.verifyAadhaar`

### 2.2 Aadhaar Status Check
* **Endpoint:** `/api/aadhaar/status`
* **Method:** `GET`
* **Authentication:** Required
* **Params:** `customerId` (optional), `purpose` (optional)
* **Response:** `200 OK` with `AadhaarVerification` entity, or `204 No Content` if unverified.

### 2.3 Verify Driving License
* **Endpoint:** `/api/driving-license/verify`
* **Method:** `POST`
* **Authentication:** Required (`CUSTOMER`, `ADMIN`)
* **Content-Type:** `multipart/form-data`
* **Request Form Data:** `file` (MultipartFile), `customerId` (optional)
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "licenseNumber": "DL-1420110012345",
    "fullName": "Rahul Sharma",
    "verified": true,
    "message": "Driving license verified successfully"
  }
  ```
* **Frontend Service:** `verificationService.verifyDrivingLicense`

### 2.4 Driving License Status Check
* **Endpoint:** `/api/driving-license/status`
* **Method:** `GET`
* **Authentication:** Required
* **Params:** `customerId` (Long)
* **Response:** `200 OK` with entity, or `204 No Content`.

### 2.5 Verify Bike RC Document
* **Endpoint:** `/api/bike-document/verify`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Content-Type:** `multipart/form-data`
* **Request Form Data:** `file`, `ownerId` (optional), `bikeId` (optional), `registrationNumber` (optional)
* **Response (200 OK):**
  ```json
  {
    "documentId": 1,
    "registrationNumber": "MH12AB1234",
    "verified": true,
    "message": "RC document verified successfully"
  }
  ```
* **Frontend Service:** `verificationService.verifyBikeDocument`

---

## 3. Bike Management Module (`/api/bikes`)

### 3.1 Get All Bikes (Public Catalog)
* **Endpoint:** `/api/bikes`
* **Method:** `GET`
* **Authentication:** Public
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Bikes fetched successfully",
    "data": [
      {
        "id": 1,
        "bikeId": 1,
        "ownerId": 2,
        "bikeName": "Royal Enfield Classic 350",
        "brand": "Royal Enfield",
        "model": "Classic 350",
        "registrationNumber": "MH12AB1234",
        "rentalPrice": 500.00,
        "hourlyRate": 60.00,
        "location": "Pune",
        "bikeStatus": "AVAILABLE",
        "imageUrl": "https://...",
        "rentalType": "HOURLY"
      }
    ]
  }
  ```
* **Frontend Service:** `bikeService.getAllBikes`

### 3.2 Search Bikes
* **Endpoint:** `/api/bikes/search`
* **Method:** `GET`
* **Authentication:** Public
* **Params:** `location`, `brand`, `category`, `bikeStatus`, `minPrice`, `maxPrice`
* **Response (200 OK):** `ApiResponse<List<BikeDTO>>`

### 3.3 Get Bike By ID
* **Endpoint:** `/api/bikes/{bikeId}`
* **Method:** `GET`
* **Authentication:** Public
* **Response (200 OK):** `ApiResponse<BikeDTO>`

### 3.4 Add Bike (Owner)
* **Endpoint:** `/api/bikes`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Request Body:** `BikeDTO`
* **Response (201 Created):** `ApiResponse<BikeDTO>`
* **Frontend Service:** `bikeService.addBike`

### 3.5 Update Bike (Owner)
* **Endpoint:** `/api/bikes/{bikeId}`
* **Method:** `PUT`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Request Body:** `BikeDTO`
* **Response (200 OK):** `ApiResponse<BikeDTO>`

### 3.6 Delete Bike (Owner)
* **Endpoint:** `/api/bikes/{bikeId}`
* **Method:** `DELETE`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Response (200 OK):** `ApiResponse<String>`

---

## 4. Booking Module (`/api/bookings`)

### 4.1 Create Booking
* **Endpoint:** `/api/bookings`
* **Method:** `POST`
* **Authentication:** Required (`CUSTOMER`)
* **Query Params:** `customerId` (Long)
* **Request Body:**
  ```json
  {
    "bikeId": 1,
    "startTime": "2026-08-20T10:00:00",
    "returnTime": "2026-08-22T18:00:00"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Booking created successfully.",
    "data": {
      "bookingId": 12,
      "bikeId": 1,
      "customerId": 11,
      "bookingReference": "BK-12",
      "startTime": "2026-08-20T10:00:00",
      "returnTime": "2026-08-22T18:00:00",
      "totalDays": 2,
      "totalAmount": 1200.00,
      "bookingStatus": "PENDING",
      "paymentStatus": "PENDING"
    }
  }
  ```
* **Frontend Service:** `BookingService.createBooking`

### 4.2 Get Customer Booking History
* **Endpoint:** `/api/bookings/customer/{customerId}`
* **Method:** `GET`
* **Authentication:** Required (`CUSTOMER`, `ADMIN`)
* **Response (200 OK):** `ApiResponse<List<BookingResponse>>`
* **Frontend Service:** `BookingService.fetchBookingHistory` / `BookingService.getCustomerBookings`

### 4.3 Cancel Booking
* **Endpoint:** `/api/bookings/{bookingId}/cancel`
* **Method:** `PUT`
* **Authentication:** Required (`CUSTOMER`, `ADMIN`)
* **Response (200 OK):** `ApiResponse<BookingResponse>`

### 4.4 Confirm Booking
* **Endpoint:** `/api/bookings/{bookingId}/confirm`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Response (200 OK):** `ApiResponse<BookingResponse>`

### 4.5 Scan Booking QR Code
* **Endpoint:** `/api/bookings/scan`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`, `ADMIN`)
* **Query Params / Body:** `qrCode`
* **Response (200 OK):** `ApiResponse<BookingResponse>`

---

## 5. Owner Module (`/api/owner`)

### 5.1 Owner Dashboard
* **Endpoint:** `/api/owner/dashboard`
* **Method:** `GET`
* **Authentication:** Required (`OWNER`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Dashboard data fetched successfully",
    "data": {
      "totalBikes": 3,
      "availableBikes": 2,
      "bookedBikes": 1,
      "totalBookings": 15,
      "totalEarnings": 18500.00,
      "todayEarnings": 1200.00,
      "weeklyEarnings": 4500.00,
      "monthlyEarnings": 12000.00,
      "pendingBookings": 2,
      "completedBookings": 12,
      "aadhaarVerified": true,
      "rcVerified": true
    }
  }
  ```
* **Frontend Service:** `ownerService.getDashboard`

### 5.2 Owner Booking Requests
* **Endpoint:** `/api/owner/bookings`
* **Method:** `GET`
* **Authentication:** Required (`OWNER`)
* **Response (200 OK):** `ApiResponse<List<BookingRequestDTO>>`
* **Frontend Service:** `ownerService.getBookingRequests`

### 5.3 Approve Booking Request
* **Endpoint:** `/api/owner/approve/{bookingId}`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`)
* **Response (200 OK):** `ApiResponse<Void>`
* **Frontend Service:** `ownerService.approveBooking`

### 5.4 Reject Booking Request
* **Endpoint:** `/api/owner/reject/{bookingId}`
* **Method:** `POST`
* **Authentication:** Required (`OWNER`)
* **Response (200 OK):** `ApiResponse<Void>`
* **Frontend Service:** `ownerService.rejectBooking`

---

## 6. Review Module (`/api/reviews`)

### 6.1 Add Review
* **Endpoint:** `/api/reviews`
* **Method:** `POST`
* **Authentication:** Required
* **Request Body:**
  ```json
  {
    "bikeId": 1,
    "customerId": 11,
    "bookingId": 12,
    "rating": 5,
    "comment": "Smooth ride, excellent condition!"
  }
  ```
* **Response (200 OK):** `Review` entity
* **Frontend Service:** `reviewService.addReview`

### 6.2 Get Reviews by Bike
* **Endpoint:** `/api/reviews/bike/{bikeId}`
* **Method:** `GET`
* **Authentication:** Public
* **Response (200 OK):** `List<Review>`
* **Frontend Service:** `reviewService.getReviewsByBike`

### 6.3 Get Average Rating
* **Endpoint:** `/api/reviews/bike/{bikeId}/average`
* **Method:** `GET`
* **Authentication:** Public
* **Response (200 OK):** Double (e.g. `4.8`)
* **Frontend Service:** `reviewService.getAverageRating`

---

## 7. Notification Module (`/api/notifications`)

### 7.1 Get User Notifications
* **Endpoint:** `/api/notifications/user/{userId}`
* **Method:** `GET`
* **Authentication:** Required (Self or `ADMIN`)
* **Response (200 OK):** `List<Notification>`
* **Frontend Service:** `notificationService.getNotificationsByUser`

### 7.2 Get Unread Notifications
* **Endpoint:** `/api/notifications/user/{userId}/unread`
* **Method:** `GET`
* **Authentication:** Required
* **Response (200 OK):** `List<Notification>`
* **Frontend Service:** `notificationService.getUnreadNotifications`

### 7.3 Get Unread Count
* **Endpoint:** `/api/notifications/user/{userId}/count`
* **Method:** `GET`
* **Authentication:** Required
* **Response (200 OK):** Long (e.g. `3`)
* **Frontend Service:** `notificationService.getUnreadCount`

### 7.4 Mark Notification As Read
* **Endpoint:** `/api/notifications/read/{notificationId}`
* **Method:** `PUT`
* **Authentication:** Required
* **Response (200 OK):** `Notification`
* **Frontend Service:** `notificationService.markAsRead`

---

## 8. Maps & Payments Module (`/api/maps`, `/api/payments`)

### 8.1 Get Nearby Bikes
* **Endpoint:** `/api/maps/nearby-bikes`
* **Method:** `GET`
* **Authentication:** Public / Customer
* **Params:** `latitude` (Double), `longitude` (Double)
* **Frontend Service:** `mapService.getNearbyBikes`

### 8.2 Process Payment
* **Endpoint:** `/api/payments/process`
* **Method:** `POST`
* **Authentication:** Required (`CUSTOMER`, `ADMIN`)
* **Request Body:**
  ```json
  {
    "bookingId": 12,
    "amount": 1200.00,
    "status": "SUCCESS"
  }
  ```
* **Response (200 OK):** `ApiResponse<PaymentResponse>`
* **Frontend Service:** `paymentService.processPayment`
