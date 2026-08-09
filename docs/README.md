# Bike Rental System - Booking Module

This repository contains the full source code and technical implementation for the **Booking Module** of the Bike Rental System.

## Project Overview

The Booking Module manages the reservation lifecycle, linking customers, available bikes, driving and identity verifications, invoice calculation, billing payments, and owner handovers using secure ZXing QR codes.

## Technology Stack

*   **Backend**: Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, Hibernate, MySQL, Maven
*   **Frontend**: React, TypeScript, React Router, Material-UI (MUI), Axios, Context API
*   **Developer Tooling**: VS Code, Git, ZXing QR generation, Yup schemas

## Key Features

1.  **Date Picker & Estimator**: Interactive date inputs validating calendar bounds and estimating totals prior to payment.
2.  **Identity Verification Guard**: Queries the Aadhaar & DL verification tables to restrict bookings to verified users.
3.  **Simulated Checkout Billing**: Generates line-item invoices including 18% GST and billing methods (Mock Cards / UPI).
4.  **Base64 QR Handover**: Encodes references inside ZXing QR codes, allowing bike owners to scan and confirm pickup.
5.  **Stepping Ride Progress**: Stepper timeline indicating lifecycle checkpoints.

## Installation & Setup

Please refer to the [Deployment Guide](file:///c:/Users/pruth/OneDrive/Desktop/SSSIT/Project/JavaProject1/docs/Deployment_Guide.md) for local environment setup parameters.

## API Mappings Summary

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | `CUSTOMER` | Request a new reservation |
| `PUT` | `/api/bookings/{id}` | `CUSTOMER` / `ADMIN` | Edit booking parameters |
| `GET` | `/api/bookings/{id}` | Authenticated | Retrieve reservation summary |
| `GET` | `/api/bookings` | `ADMIN` | Fetch all system records |
| `PUT` | `/api/bookings/{id}/cancel` | `CUSTOMER` / `ADMIN` | Cancel a pending reservation |
| `POST` | `/api/bookings/{id}/confirm` | `OWNER` / `ADMIN` | Confirm handover pickup |
| `POST` | `/api/payments/process` | `CUSTOMER` / `ADMIN` | Process simulated billing |

## Project Structures Map

The directory breakdowns can be reviewed inside the [Booking Module Documentation](file:///c:/Users/pruth/OneDrive/Desktop/SSSIT/Project/JavaProject1/docs/Booking_Module_Documentation.md).

## Future Enhancements
See our development suggestions in [Future Enhancements](file:///c:/Users/pruth/OneDrive/Desktop/SSSIT/Project/JavaProject1/docs/Future_Enhancements.md).
