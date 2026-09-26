# 📮 Postman API Testing Guide & Collection Reference

This directory serves as the API testing manual and request catalog for the **Smart Bike Rental System** REST API.

---

## 🌐 Quick Configuration

| Parameter | Default Local Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:8888/api` | Backend API base URL (Spring Boot) |
| `swaggerUrl` | `http://localhost:8888/swagger-ui/index.html` | Interactive OpenAPI Swagger UI |
| `openApiJson` | `http://localhost:8888/v3/api-docs` | Raw OpenAPI JSON spec for direct import |

---

## 📥 Importing into Postman

### Option 1: Direct Import from Swagger / OpenAPI (Recommended)
1. Ensure the Spring Boot backend is running (`mvnw.cmd spring-boot:run`).
2. Open Postman.
3. Click **Import** (top left).
4. Enter the URL:
   ```text
   http://localhost:8888/v3/api-docs
   ```
5. Select **Import as API** or **Postman Collection**.
6. Postman will automatically generate every endpoint, DTO schema, and parameter structure directly from the live application!

### Option 2: Manual Environment Configuration
Create a new Environment in Postman named **Bike Rental Local** with these variables:
- `baseUrl`: `http://localhost:8888/api`
- `authToken`: *(leave blank initially; will be populated upon login)*
- `adminToken`: *(token received when logging in as Admin)*
- `ownerToken`: *(token received when logging in as Owner)*
- `customerToken`: *(token received when logging in as Customer)*

---

## 🔐 Authentication & JWT Setup

The backend utilizes Bearer JWT tokens in the `Authorization` header:
```http
Authorization: Bearer <your-jwt-token>
```

### Auto-Saving Token in Postman
In the **Tests** tab of your Login request (`POST {{baseUrl}}/auth/login`), add this script:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    var token = jsonData.data.accessToken || jsonData.data.token || jsonData.token;
    if (token) {
        pm.environment.set("authToken", token);
        console.log("Token set successfully:", token);
    }
}
```

---

## 🧪 Shared Test Credentials

Use these pre-seeded accounts from `database/bike_rental_test_data_hyderabad.sql`:

| Role | Email | Password | Primary Test Purpose |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@bikerental.test` | `Admin@123` | Dashboard, moderation, verification approvals, analytics |
| **OWNER 1** | `ravi.owner@bikerental.test` | `Owner@123` | Bikes 101-104, 109, 110, 113; earnings & booking approvals |
| **OWNER 2** | `priya.owner@bikerental.test` | `Owner@123` | Bikes 105-108, 111, 112, 114; maintenance bikes & EV fleet |
| **CUSTOMER 1** | `arjun.customer@bikerental.test` | `Customer@123` | Fully verified, active ride (#503), completed ride (#501) |
| **CUSTOMER 2** | `neha.customer@bikerental.test` | `Customer@123` | Verified customer, upcoming confirmed booking |
| **CUSTOMER 3** | `vikram.customer@bikerental.test` | `Customer@123` | Pending Aadhaar & DL verification state |
| **CUSTOMER 4** | `pending.customer@bikerental.test` | `Customer@123` | Rejected verification test case |

---

## 📑 Core API Endpoints Reference

### 1. 🔑 Authentication (`/api/auth`)
- **Register**: `POST {{baseUrl}}/auth/register`
  ```json
  {
    "fullName": "Test User",
    "email": "user@example.com",
    "password": "Password@123",
    "phone": "9876543210",
    "role": "ROLE_CUSTOMER"
  }
  ```
- **Login**: `POST {{baseUrl}}/auth/login`
  ```json
  {
    "email": "arjun.customer@bikerental.test",
    "password": "Customer@123"
  }
  ```
- **Refresh Token**: `POST {{baseUrl}}/auth/refresh-token`
- **Verify OTP**: `POST {{baseUrl}}/auth/verify-otp`
- **Forgot Password**: `POST {{baseUrl}}/auth/forgot-password`
- **Reset Password**: `POST {{baseUrl}}/auth/reset-password`

### 2. 🏍️ Bikes (`/api/bikes`)
- **List All Available Bikes**: `GET {{baseUrl}}/bikes?status=AVAILABLE`
- **Get Bike Details**: `GET {{baseUrl}}/bikes/{id}`
- **Search & Filter Bikes**: `GET {{baseUrl}}/bikes/search?brand=Royal%20Enfield&location=Banjara%20Hills`
- **Get Nearby Bikes (GPS)**: `GET {{baseUrl}}/bikes/nearby?lat=17.4156&lng=78.4347&radius=10`
- **Add New Bike (Owner)**: `POST {{baseUrl}}/bikes` *(Requires OWNER role)*
- **Update Bike Details**: `PUT {{baseUrl}}/bikes/{id}`
- **Delete / Archive Bike**: `DELETE {{baseUrl}}/bikes/{id}`

### 3. 📅 Bookings (`/api/bookings`)
- **Create Booking**: `POST {{baseUrl}}/bookings`
  ```json
  {
    "bikeId": 101,
    "startDate": "2026-10-01T09:00:00",
    "endDate": "2026-10-02T18:00:00",
    "pickupLocation": "Banjara Hills, Hyderabad"
  }
  ```
- **Customer My Bookings**: `GET {{baseUrl}}/bookings/my-bookings`
- **Owner Booking Requests**: `GET {{baseUrl}}/bookings/owner/requests`
- **Confirm Handover (Scan QR)**: `POST {{baseUrl}}/bookings/{id}/confirm`
- **Cancel Booking**: `PUT {{baseUrl}}/bookings/{id}/cancel`
- **Complete Rental**: `PUT {{baseUrl}}/bookings/{id}/complete`

### 4. 💳 Payments (`/api/payments`)
- **Create Razorpay Order**: `POST {{baseUrl}}/payments/create-order`
  ```json
  {
    "bookingId": 501,
    "amount": 1499.00
  }
  ```
- **Verify Payment Signature**: `POST {{baseUrl}}/payments/verify`
- **Payment History**: `GET {{baseUrl}}/payments/history`

### 5. 🪪 Document KYC Verification (`/api/verification`)
- **Upload Aadhaar**: `POST {{baseUrl}}/verification/aadhaar` *(Multipart / Form-Data)*
- **Upload Driving License**: `POST {{baseUrl}}/verification/driving-license`
- **Upload Bike RC (Owner)**: `POST {{baseUrl}}/verification/bike-rc`
- **My Verification Status**: `GET {{baseUrl}}/verification/status`

### 6. 📍 Live GPS & Tracking (`/api/gps`)
- **Stream Bike Location**: `POST {{baseUrl}}/gps/update`
  ```json
  {
    "bikeId": 101,
    "latitude": 17.4156,
    "longitude": 78.4347,
    "speed": 42.5
  }
  ```
- **Get Live Location**: `GET {{baseUrl}}/gps/tracking/{bikeId}`

### 7. 🛡️ Admin Management (`/api/admin`)
- **Dashboard Metrics**: `GET {{baseUrl}}/admin/dashboard`
- **List All Users**: `GET {{baseUrl}}/admin/users`
- **Pending KYC Documents**: `GET {{baseUrl}}/admin/verifications/pending`
- **Approve / Reject KYC**: `PUT {{baseUrl}}/admin/verifications/{id}/decision`
- **System Reports**: `GET {{baseUrl}}/admin/reports/revenue`

---

## 🔗 Related Resources
- 🏠 [Root Project README](../README.md)
- ⚙️ [Backend Architecture & Docs](../bike-rental-backend/README.md)
- 🗄️ [Database Test Data Guide](../database/README.md)
