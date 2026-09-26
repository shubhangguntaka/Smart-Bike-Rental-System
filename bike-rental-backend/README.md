# 🚲 Smart Bike Rental System — Backend API Service

A robust, enterprise-grade RESTful API service built with **Spring Boot 3.2.5**, **Java 21**, **Spring Security**, **JWT Authentication**, and **Spring Data JPA (Hibernate)** for the **Smart Bike Rental System**.

---

## 📖 System Overview

The backend service coordinates all core transactional, operational, and analytical capabilities of the platform:
- **Authentication & Security**: Multi-role JWT authentication (`CUSTOMER`, `OWNER`, `ADMIN`), refresh tokens, and BCrypt password encryption.
- **Fleet & Inventory Management**: CRUD operations for bike listings, real-time availability states, engine specs, and image galleries.
- **Reservation & Handover**: Complete booking lifecycle management, fare breakdown, 18% GST calculation, and QR code handover verification.
- **Payment Processing**: Integrated Razorpay payment order generation and cryptographic signature verification.
- **Document KYC Verification**: Secure uploads and administrative approval flows for Aadhaar, Driving License, and Vehicle RC documents.
- **Live Geolocation & GPS**: Coordinate streaming, proximity queries, and tracking for rented bikes in Hyderabad.
- **Admin Moderation & Analytics**: Platform-wide metrics, revenue charts, user management, and PDF/Excel report exports.

---

## 🛠️ Technology Stack

| Technology | Version / Spec | Purpose |
| :--- | :--- | :--- |
| **Java** | 21 (LTS) | Core Programming Language |
| **Spring Boot** | 3.2.5 | Application Framework |
| **Spring Security** | 6.x | Role-based Authorization & Route Guards |
| **JSON Web Token (JJWT)** | 0.12.6 | Stateless Authentication |
| **Spring Data JPA** | 3.2.5 | Database Abstraction & Repositories |
| **Hibernate ORM** | 6.x | Object-Relational Mapping |
| **MySQL** | 8.x | Relational Database |
| **Springdoc OpenAPI (Swagger)** | 2.x | Live Interactive API Documentation |
| **Razorpay Java SDK** | 1.4.3 | Payment Gateway Integration |
| **Cloudinary SDK** | 1.39.0 | Cloud Document & Image Asset Storage |
| **ZXing ("Zebra Crossing")** | 3.5.3 | QR Code Handover Generation & Decoding |
| **ModelMapper** | 3.2.4 | Entity ↔ DTO Data Transformation |
| **Lombok** | 1.18.40 | Boilerplate Reduction |
| **Spring Boot Mail** | 3.2.5 | Email Notifications & OTP Verification |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java Development Kit (JDK)**: JDK 21 installed (`java -version`).
- **MySQL Server**: MySQL 8.x running on `localhost:3306`.
- **Maven**: Bundled Maven Wrapper (`./mvnw` or `mvnw.cmd`) or Maven 3.9+.

### 2. Database Setup
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS bike_rental;
   ```
2. Import the shared Hyderabad test data (resets and populates all 13 tables):
   ```bash
   # From the project root:
   mysql -u root -p < database/bike_rental_test_data_hyderabad.sql
   ```

### 3. Application Configuration
The active profile is set to `local` in `src/main/resources/application.properties`:
```properties
spring.profiles.active=local
```

Inspect or configure `src/main/resources/application-local.properties`:
```properties
server.port=8888

spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=YourSecretKeyMustBeAtLeast32CharactersLongForHS256Algorithm
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

### 4. Running the Application
From the `bike-rental-backend/` directory:

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The server starts on port **8888**:
```text
Tomcat started on port 8888 (http) with context path ''
```

---

## 📚 Interactive API Documentation (Swagger UI)

Once the application is running, visit the interactive Swagger UI to explore and test endpoints in your browser:

```text
http://localhost:8888/swagger-ui/index.html
```

Raw OpenAPI JSON definition:
```text
http://localhost:8888/v3/api-docs
```

---

## 📂 Source Code Package Architecture

Root package: `com.sssit.bikerental`

```text
com.sssit.bikerental/
├── config/                     # Security, CORS, Swagger, Mail, Cloudinary configs
├── security/                   # JwtFilter, JwtService, CustomUserDetailsService
├── common/
│   ├── dto/                    # Base API response wrappers and paginated DTOs
│   ├── enums/                  # Role, BookingStatus, BikeStatus, PaymentStatus
│   └── exception/              # GlobalExceptionHandler and custom exceptions
├── modules/
│   ├── auth/                   # Registration, Login, OTP verification, Token refresh
│   ├── user/                   # User profiles, customer details, password change
│   ├── owner/                  # Fleet owner management, earnings, statistics
│   ├── bike/                   # Bike catalog, specifications, filters, gallery images
│   ├── booking/                # Reservation engine, date validator, QR handover
│   ├── payment/                # Razorpay checkout, transaction logs, refunds
│   ├── verification/           # Aadhaar, Driving License, RC upload & admin review
│   ├── gps/                    # Telemetry coordinates, live tracking, speed updates
│   ├── review/                 # Star ratings and feedback comments
│   ├── notification/           # User in-app notifications and alerts
│   └── admin/                  # System metrics, user moderation, reports generation
└── BikeRentalBackendApplication.java  # Main Spring Boot bootstrap class
```

---

## 🧪 Shared Test Accounts

The seeded database comes pre-loaded with these test accounts:

| Role | Username / Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@bikerental.test` | `Admin@123` | Master control over fleet, users, KYC, and finances |
| **OWNER** | `ravi.owner@bikerental.test` | `Owner@123` | Fleet owner with 7 bikes across Hyderabad |
| **OWNER** | `priya.owner@bikerental.test` | `Owner@123` | Fleet owner with EV scooters and sports bikes |
| **CUSTOMER** | `arjun.customer@bikerental.test` | `Customer@123` | Fully verified customer with active ride #503 |
| **CUSTOMER** | `neha.customer@bikerental.test` | `Customer@123` | Verified customer with confirmed reservation |
| **CUSTOMER** | `vikram.customer@bikerental.test` | `Customer@123` | Unverified customer (pending KYC evaluation) |

---

## 📦 Useful Maven Commands

| Command | Action |
| :--- | :--- |
| `mvn clean compile` | Compiles Java sources and checks syntax |
| `mvn test` | Executes unit and integration test suites |
| `mvn clean package -DskipTests` | Builds the executable standalone `.jar` in `/target` |
| `mvn spring-boot:run` | Runs the development application server |

---

## 🔗 Quick Navigation Links
- 🏠 [Root Project README](../README.md)
- 🎨 [Frontend Documentation](../bike-rental-frontend/README.md)
- 🗄️ [Database Test Data Guide](../database/README.md)
- 📮 [Postman API Guide](../postman/README.md)
- 📚 [Full Documentation Hub](../docs/README.md)
