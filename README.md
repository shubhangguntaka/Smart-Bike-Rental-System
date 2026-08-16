# 🚲 Smart Bike Rental System

## Overview

The **Smart Bike Rental System** is a full-stack web application that
allows customers to rent bikes, owners to manage their bikes, and
administrators to oversee the platform. The project is built with
**React + TypeScript + Vite** on the frontend and **Spring Boot + Spring
Security + JWT + MySQL** on the backend.

------------------------------------------------------------------------

# ✨ Features

### Customer

-   Register/Login
-   Browse & search bikes
-   Book bikes
-   Payment
-   Ride history
-   Reviews & Ratings
-   Live GPS Tracking

### Owner

-   Manage bikes
-   Booking requests
-   Earnings dashboard
-   Upload verification documents

### Admin

-   Manage users, owners and bikes
-   Verify documents
-   Reports & Analytics
-   Payment monitoring

------------------------------------------------------------------------

# 🛠️ Technology Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   Axios

## Backend

-   Spring Boot
-   Spring Security
-   JWT
-   Spring Data JPA
-   Hibernate
-   MySQL
-   Swagger/OpenAPI
-   Lombok

## Deployment

-   Frontend: Vercel
-   Backend: Railway
-   Database: MySQL (Railway)

------------------------------------------------------------------------

# 👥 Team Members & Responsibilities

  -----------------------------------------------------------------------
  Member                  Responsibilities
  ----------------------- -----------------------------------------------
  Member 1                Authentication, Booking, Payment, UI Testing

  Member 2                Security, Bike Management, Document
                          Verification

  Member 3                Common UI, Google Maps, GPS, Deployment

  Member 4                Verification, Owner Module, Reports,
                          Documentation

  Member 5                Configuration, Reviews, Notifications, Admin,
                          Final Testing
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 📂 Repository Structure

``` text
BikeRentalSystem/
├── bike-rental-frontend/
├── bike-rental-backend/
├── database/
├── docs/
├── postman/
├── screenshots/
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

------------------------------------------------------------------------

# 📦 Project Modules

## Section 1

-   Authentication
-   Security
-   User Verification

## Section 2

-   Bike Management
-   Booking
-   Google Maps
-   Reviews & Notifications

## Section 3

-   Payments
-   GPS Tracking
-   Reports
-   Admin Panel

## Section 4

-   Testing
-   Documentation
-   Deployment

------------------------------------------------------------------------

# 🚀 Getting Started

## Frontend

``` bash
cd bike-rental-frontend
npm install
npm run dev
```

## Backend

``` bash
cd bike-rental-backend
./mvnw spring-boot:run
```

Windows:

``` bash
mvnw.cmd spring-boot:run
```

------------------------------------------------------------------------

# 🗄️ Database Setup

1.  Create MySQL database.
2.  Configure `application-dev.properties`.
3.  Run the backend.
4.  Hibernate will create/update tables (development).
5.  The Smart Bike Rental System uses **MySQL** with the database name:

```text
bike_rental
```

Database Setup

The Smart Bike Rental System uses MySQL.

Database name:

bike_rental

The backend uses Spring Data JPA + Hibernate, which creates/updates
the required tables during development.

2.1 Start MySQL

Make sure MySQL Server is running.

Open MySQL:

mysql -u root -p

Enter your local MySQL password.

2.2 Create the Database

Inside MySQL:

CREATE DATABASE IF NOT EXISTS bike_rental;

Select the database:

USE bike_rental;

Verify:

SELECT DATABASE();

Expected:

bike_rental
2.3 Configure Backend Database Connection

Open:

bike-rental-backend/src/main/resources/application-dev.properties

Configure your local MySQL connection.

Example:

spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

Use your own local MySQL password.

⚠️ Never commit real database passwords, API keys, JWT secrets, or
other sensitive credentials to GitHub.

2.4 Start the Backend Once

Open a terminal:

cd bike-rental-backend
Linux/macOS
./mvnw spring-boot:run
Windows
mvnw.cmd spring-boot:run

Hibernate will create/update the required database tables according to
the backend entities.

Wait until the Spring Boot application starts successfully.

🧪 3. Load Shared Test Database

The repository contains a shared test-data SQL file:

database/bike_rental_test_data_hyderabad.sql

This file provides the same development/testing data for every team
member.

The dataset contains:

7 Users
2 Owners
14 Bikes
19 Bike Images
6 Aadhaar Verification Records
4 Driving License Records
14 Bike Document/RC Verification Records
8 Bookings
8 Payments
3 Reviews
10 Notifications
4 OTP Records
5 Refresh Tokens

All bike locations are based in:

Hyderabad, Telangana, India
⚠️ Important — Test Database Reset

The shared SQL file is a RESET + SEED script.

It contains TRUNCATE TABLE statements.

Therefore, running the file will remove existing application data from
the local test database before inserting the shared dataset.

Use it only for:
Local development
Testing
Integration testing
Team testing
Demo preparation
Do NOT use it for:
Production
Railway production database
Any database containing important data
Any database that has data you need to preserve

Every team member should preferably use their own local:

bike_rental

database.

🗃️ 4. Import Test Data

There are two recommended ways to import the shared test data.

Option A — Windows CMD

From the project root:

mysql -u root -p < database/bike_rental_test_data_hyderabad.sql

Enter your MySQL password when prompted.

The SQL file automatically selects:

USE bike_rental;

so you don't need to specify the database in the command.

Option B — MySQL Command Line

Open MySQL:

mysql -u root -p

Select the database:

USE bike_rental;

Run the SQL file:

SOURCE C:/path/to/BikeRentalSystem/database/bike_rental_test_data_hyderabad.sql;
Windows path example
SOURCE C:/Users/YourName/Documents/BikeRentalSystem/database/bike_rental_test_data_hyderabad.sql;

Use / instead of \ in the SOURCE command.

🔍 5. Verify Database Tables

After importing the SQL file:

USE bike_rental;

Check the tables:

SHOW TABLES;

The database should contain:

aadhaar_verification
bike_document_verification
bike_images
bikes
bookings
driving_license_verification
notifications
otp_verifications
owners
payments
refresh_tokens
reviews
users
📊 6. Verify Test Data

Check the number of users:

SELECT COUNT(*) FROM users;

Expected:

7

Owners:

SELECT COUNT(*) FROM owners;

Expected:

2

Bikes:

SELECT COUNT(*) FROM bikes;

Expected:

14

Bookings:

SELECT COUNT(*) FROM bookings;

Expected:

8

Payments:

SELECT COUNT(*) FROM payments;

Expected:

8

Reviews:

SELECT COUNT(*) FROM reviews;

Expected:

3
🏍️ 7. Verify Bikes

Run:

SELECT
    bike_id,
    bike_name,
    brand,
    model,
    bike_status,
    rc_verified,
    rental_price,
    rental_type,
    location,
    latitude,
    longitude
FROM bikes
ORDER BY bike_id;

The dataset contains different bike states, including:

AVAILABLE
BOOKED
UNDER_MAINTENANCE
NOT_AVAILABLE

This allows the application to test different bike-management and
booking scenarios.

📍 8. Hyderabad Location Test Data

The test bikes are distributed across Hyderabad, Telangana, India.

Locations include:

Banjara Hills
Jubilee Hills
Madhapur
Kondapur
Somajiguda
Kukatpally
Tank Bund
Hitech City
Gachibowli
Secunderabad
Ameerpet
Rajiv Gandhi International Airport

Each bike contains latitude and longitude values.

This allows testing of:

Google Maps
Nearby bike search
Location-based filtering
GPS functionality
Distance-based functionality
Multiple bikes at the same location
Map markers
🖼️ 9. Test Image URLs

The shared SQL uses external HTTPS image URLs instead of local paths
such as:

/uploads/bikes/classic350.jpg

This means every teammate can use the same database without having to
copy image files into the backend project.

The image URLs are test/demo assets only.

The verification documents also use test placeholder images and do not
represent real Aadhaar cards, driving licences, or RC documents.

🔐 10. Shared Test Accounts

The database contains common test accounts for the entire team.

Admin
Email:
admin@bikerental.test


Password:
Admin@123

Role:

ADMIN
Owner 1
Email:
ravi.owner@bikerental.test


Password:
Owner@123

Role:

OWNER
Owner 2
Email:
priya.owner@bikerental.test


Password:
Owner@123

Role:

OWNER
Customer 1
Email:
arjun.customer@bikerental.test


Password:
Customer@123

Role:

CUSTOMER
Customer 2
Email:
neha.customer@bikerental.test


Password:
Customer@123

Role:

CUSTOMER
Customer 3
Email:
vikram.customer@bikerental.test


Password:
Customer@123

Role:

CUSTOMER
Customer 4
Email:
pending.customer@bikerental.test


Password:
Customer@123

Role:

CUSTOMER

⚠️ These accounts are strictly for development/testing.

🧪 11. Verification Test Scenarios

The shared database intentionally contains different verification
states.

Aadhaar
Ravi    → VERIFIED
Priya   → VERIFIED
Arjun   → VERIFIED
Neha    → VERIFIED
Vikram  → PENDING
Kiran   → REJECTED
Driving License
Arjun   → VERIFIED
Neha    → VERIFIED
Vikram  → PENDING
Kiran   → REJECTED
Bike RC

Most bikes are:

VERIFIED

Bike 108 is intentionally:

PENDING

and:

rc_verified = 0
bike_status = NOT_AVAILABLE

This allows the team to test verification restrictions.

------------------------------------------------------------------------

# 📖 API Documentation

Swagger UI:

    http://localhost:8080/swagger-ui/index.html

------------------------------------------------------------------------

# 🌿 Git Workflow

``` text
main
└── develop
    ├── feature/authentication
    ├── feature/bike-management
    ├── feature/booking
    ├── feature/payment
    ├── feature/maps
    ├── feature/gps
    ├── feature/admin
    └── feature/testing
```

------------------------------------------------------------------------

# 🚀 Deployment

  Component   Platform
  ----------- ---------------
  Frontend    Vercel
  Backend     Railway
  Database    Railway MySQL

------------------------------------------------------------------------

# 🔮 Future Enhancements

-   Wallet
-   AI Recommendations
-   Real-time Chat
-   Push Notifications
-   Mobile Application

------------------------------------------------------------------------

# 📄 License

Developed as an academic major project.
