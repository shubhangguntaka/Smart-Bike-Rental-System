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
