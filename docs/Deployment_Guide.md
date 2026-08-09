# Deployment & Environment Setup Guide

This guide details setup requirements to configure, run, and deploy the Bike Rental application locally and in production.

---

## 1. Prerequisites
- **Java**: JDK 17 (Zulu, Corretto, or OpenJDK)
- **NodeJS**: v18.0.0 or higher (with `npm`)
- **Database**: MySQL Server v8.0 or higher
- **OCR Engine (Optional)**: Tesseract OCR (required if verifying DL/identity documents locally)

---

## 2. Database Environment Setup
1. Create a MySQL database schemas:
   ```sql
   CREATE DATABASE bike_rental_db;
   ```
2. Setup database credentials inside your system environment or edit values directly inside `application.properties`.

---

## 3. Backend Configuration

### 3.1 Properties Configuration (`src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_secure_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Security
jwt.secret=9a62aa5391a24d5218d6e3c09191d849206ea191490cc91d09214710d5c0e149
jwt.expiration=86400000

# File Upload bounds
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

### 3.2 Running the Backend Locally
Using the Maven Wrapper script in the project directory:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

---

## 4. Frontend Configuration

### 4.1 Axios Base URL Configuration (`src/api/axios.ts`)
Ensure the Axios configurations point to the active backend instance URL:
```typescript
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
```

### 4.2 Running the Frontend Locally
1. Navigate to `bike-rental-frontend` directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the client UI page at `http://localhost:5173`.
