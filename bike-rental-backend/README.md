# 🚲 Bike Rental System – Backend

A scalable, secure, and modular backend for the **Smart Bike Rental System**, built with **Spring Boot**, **Spring Security**, **JWT**, and **MySQL**.

---

# 📖 Project Overview

The Smart Bike Rental System backend provides REST APIs for managing authentication, bike rentals, bookings, payments, live GPS tracking, notifications, and administrative operations.

The backend follows a modular architecture, making it easy for multiple developers to work independently on different features.

---

# 👥 User Roles

* 👤 Customer
* 🏍️ Bike Owner
* 🛡️ Admin

---

# 🛠️ Tech Stack

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| Java 21/25        | Programming Language           |
| Spring Boot       | Backend Framework              |
| Spring Security   | Authentication & Authorization |
| JWT               | Secure Authentication          |
| Spring Data JPA   | Database Access                |
| Hibernate         | ORM                            |
| MySQL             | Database                       |
| Maven             | Dependency Management          |
| Lombok            | Boilerplate Reduction          |
| Bean Validation   | Request Validation             |
| Swagger (OpenAPI) | API Documentation              |
| Spring Boot Mail  | Email & OTP                    |
| WebSocket         | Real-Time Notifications        |
| ModelMapper       | Entity ↔ DTO Mapping           |

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to Backend

```bash
cd bike-rental-backend
```

---

## 3. Import into STS4

Open **Spring Tools for Eclipse (STS4)**

* File → Import
* Maven → Existing Maven Projects
* Select the project folder
* Finish

---

## 4. Update Maven

Right Click Project

```
Maven
    → Update Project
```

Enable

* ✔ Force Update of Snapshots/Releases

---

## 5. Configure Database

Create a MySQL database.

Example

```sql
CREATE DATABASE bike_rental;
```

---

## 6. Configure application-dev.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental

spring.datasource.username=root

spring.datasource.password=YOUR_PASSWORD
```

---

## 7. Run the Project

Run

```
BikeRentalBackendApplication.java
```

or

```
Run As
→ Spring Boot App
```

---

# 📂 Project Structure

```
bike-rental-backend/
│
├── .github/
│   └── workflows/
│
├── .mvn/
│   └── wrapper/
│
├── src/
│
├── main/
│
│   ├── java/
│   │
│   └── com/
│       └── bikerental/
│
│           ├── config/
│           │   ├── CorsConfig.java
│           │   ├── SecurityConfig.java
│           │   ├── SwaggerConfig.java
│           │   ├── WebConfig.java
│           │   ├── OpenApiConfig.java
│           │   ├── MailConfig.java
│           │   ├── GoogleMapsConfig.java
│           │   └── RazorpayConfig.java
│           │
│           ├── security/
│           │   ├── jwt/
│           │   │   ├── JwtFilter.java
│           │   │   ├── JwtService.java
│           │   │   ├── JwtAuthenticationEntryPoint.java
│           │   │   └── JwtAuthenticationProvider.java
│           │   │
│           │   ├── user/
│           │   │   └── CustomUserDetailsService.java
│           │   │
│           │   └── PasswordConfig.java
│           │
│           ├── common/
│           │
│           │   ├── dto/
│           │   │
│           │   ├── enums/
│           │   │
│           │   ├── mapper/
│           │   │
│           │   ├── response/
│           │   │
│           │   ├── util/
│           │   │
│           │   ├── constants/
│           │   │
│           │   └── validation/
│           │
│           ├── exception/
│           │   ├── handler/
│           │   ├── custom/
│           │   └── response/
│           │
│           ├── modules/
│
│           │
│           ├── auth/
│           │   ├── controller/
│           │   ├── service/
│           │   │   ├── AuthService.java
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   └── validator/
│           │
│           ├── user/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   └── validator/
│           │
│           ├── owner/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   └── validator/
│           │
│           ├── bike/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   ├── specification/
│           │   └── validator/
│           │
│           ├── booking/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   └── validator/
│           │
│           ├── payment/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── mapper/
│           │   └── gateway/
│           │
│           ├── notification/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   └── entity/
│           │
│           ├── review/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   └── entity/
│           │
│           ├── verification/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── aadhaar/
│           │   ├── drivinglicense/
│           │   ├── rc/
│           │   ├── insurance/
│           │   └── puc/
│           │
│           ├── map/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── dto/
│           │   └── provider/
│           │
│           ├── gps/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── repository/
│           │   ├── dto/
│           │   └── entity/
│           │
│           ├── upload/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── storage/
│           │   ├── dto/
│           │   └── entity/
│           │
│           ├── analytics/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── dto/
│           │   └── report/
│           │
│           ├── report/
│           │   ├── controller/
│           │   ├── service/
│           │   │   └── impl/
│           │   ├── dto/
│           │   └── exporter/
│           │
│           └── admin/
│               ├── controller/
│               ├── service/
│               │   └── impl/
│               ├── repository/
│               ├── dto/
│               ├── entity/
│               ├── dashboard/
│               └── statistics/
│
│
│           └── BikeRentalApplication.java
│
│
├── resources/
│
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│
│   ├── db/
│   │   ├── migration/
│   │   ├── seed/
│   │   └── scripts/
│   │
│   ├── static/
│   │   ├── uploads/
│   │   │   ├── profile/
│   │   │   ├── bikes/
│   │   │   ├── aadhaar/
│   │   │   ├── license/
│   │   │   ├── rc/
│   │   │   ├── insurance/
│   │   │   └── puc/
│   │   │
│   │   └── images/
│   │
│   └── templates/
│       ├── email/
│       ├── invoice/
│       └── reports/
│
├── test/
│   ├── java/
│   │   ├── auth/
│   │   ├── bike/
│   │   ├── booking/
│   │   ├── payment/
│   │   └── integration/
│   │
│   └── resources/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   └── deployment/
│
├── postman/
│
├── scripts/
│
├── uploads/
│
├── .env.example
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

Each feature/module will contain its own controllers, services, repositories, DTOs, and related classes during development.

---

# 🌿 Git Workflow

```
main
│
└── develop
     ├── feature/authentication
     ├── feature/customer
     ├── feature/owner
     ├── feature/admin
     ├── feature/bike
     ├── feature/booking
     ├── feature/payment
     ├── feature/maps
     ├── feature/gps
     ├── feature/review
     └── feature/notification
```

---

## Branch Rules

* Never develop directly on **main**.
* Create feature branches from **develop**.
* Create Pull Requests before merging.
* Resolve merge conflicts before approval.
* Ensure the project builds successfully before pushing.

---

# 📋 Coding Guidelines

## Package Naming

```
lowercase
```

Example

```
authentication

booking

payment
```

---

## Class Naming

```
PascalCase
```

Example

```
AuthenticationController

BookingService

PaymentRepository
```

---

## Method Naming

```
camelCase
```

Example

```
registerUser()

createBooking()

cancelBooking()
```

---

## REST Endpoint Naming

```
/api/auth

/api/customers

/api/owners

/api/bikes

/api/bookings

/api/payments

/api/reviews
```

Use plural resource names where appropriate.

---

## Entity Naming

```
User

Bike

Booking

Payment
```

---

## DTO Naming

```
LoginRequest

RegisterRequest

BikeResponse

BookingResponse
```

---

# 📌 General Rules

* Use constructor injection instead of field injection.
* Keep controllers lightweight.
* Business logic belongs in services.
* Validate all incoming requests.
* Use DTOs instead of exposing entities directly.
* Write meaningful method and variable names.
* Remove unused imports before committing.
* Do not commit secrets or passwords.
* Follow SOLID principles where practical.

---



# 📦 API Response Format

All APIs use a consistent response structure.

## Success Response

```json
{
  "success": true,
  "message": "Bike fetched successfully",
  "data": {},
  "timestamp": "2026-08-20T10:00:00"
}

{
  "success": false,
  "message": "Bike not found with id: 10",
  "data": null,
  "timestamp": "2026-08-20T10:00:00"
}

{
  "success": false,
  "message": "Validation Failed",
  "data": {
    "email": "Email is required",
    "password": "Password must not be blank"
  },
  "timestamp": "2026-08-20T10:00:00"
}

---

# 📝 Commit Message Convention

Examples

```
feat: implement authentication module

feat: add bike management APIs

fix: resolve JWT validation issue

refactor: optimize booking service

docs: update backend README

test: add authentication tests
```

---

# 📚 API Documentation

Swagger UI

```
http://localhost:8080/swagger-ui/index.html
```

(API documentation will be available after Swagger configuration.)

---

# 📦 Important Commands

Run Project

```bash
mvn spring-boot:run
```

Build Project

```bash
mvn clean install
```

Run Tests

```bash
mvn test
```

Clean Project

```bash
mvn clean
```

---

# 🚧 Development Modules

The backend will be developed module-wise.

* Authentication & JWT
* User Management
* Bike Management
* Booking Management
* Document Verification
* Payment Integration
* Google Maps Integration
* Live GPS Tracking
* Notifications
* Reviews & Ratings
* Admin Dashboard
* Reports & Analytics

Each module should be developed in its own feature branch.

---

# 🤝 Team Responsibilities

* Follow the agreed project architecture.
* Keep business logic inside services.
* Avoid duplicate code.
* Use common DTOs and response models.
* Test APIs before creating Pull Requests.
* Keep commits focused on a single feature.
* Do not modify another developer's module without discussion.

---

# 📄 License

This project is developed as part of the **SSSIT Institute Major Project**.

All contributors should follow the team's coding standards, architecture, and Git workflow.

---

## Happy Coding! 🚀
