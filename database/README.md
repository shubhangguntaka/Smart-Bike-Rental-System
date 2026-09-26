# 🗄️ Smart Bike Rental System — Shared Test Database

This directory contains the database scripts, schemas, and shared seed dataset for the **Smart Bike Rental System** (Spring Boot + MySQL + React).

The dataset is designed to provide every teammate with an identical, fully populated `bike_rental` database for consistent development, testing, and demonstration.

---

## 📁 Files in this Directory

- `bike_rental_test_data_hyderabad.sql` — Complete reset + seed SQL script (Hyderabad dataset).
- `README.md` — This setup and verification guide.

---

## 1. ⚙️ What the Seed Script Does

The SQL script (`bike_rental_test_data_hyderabad.sql`):
1. **Creates Database**: `CREATE DATABASE IF NOT EXISTS bike_rental;`
2. **Selects Context**: `USE bike_rental;`
3. **Disables Foreign Key Checks**: Allows clean truncation of dependent tables.
4. **Resets Tables**: Truncates all 13 application tables.
5. **Seeds Users**: Inserts Admin, Owners, and Customers with hashed BCrypt passwords.
6. **Seeds Owners**: Links owner profile records to user entities.
7. **Seeds Bikes**: Inserts 14 Hyderabad-based bikes covering varied models, engine categories, fuel types, and rental pricing.
8. **Seeds Bike Images**: Associates high-resolution CDN images with each vehicle.
9. **Seeds KYC Records**: Inserts Aadhaar, Driving License, and RC verification records across pending, verified, and rejected statuses.
10. **Seeds Bookings**: Populates reservations spanning all enum states (`PENDING`, `VERIFICATION_REQUIRED`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
11. **Seeds Payments**: Records Razorpay transaction entries with matching statuses (`SUCCESS`, `PENDING`, `FAILED`, `REFUNDED`).
12. **Seeds Reviews & Ratings**: Realistic customer reviews with 1–5 star ratings.
13. **Seeds Notifications**: System alerts and notification logs.
14. **Seeds OTPs & Tokens**: Mock OTP verifications and refresh tokens for testing auth lifecycles.
15. **Re-enables Foreign Key Checks** and executes table count validation queries.

---

## 2. ⚠️ Important Warning: Destructive Reset

> [!WARNING]
> This script is a **RESET + SEED** script. It issues `TRUNCATE TABLE` commands on all 13 project tables.
> 
> Running this file **will erase any existing custom records** in your local `bike_rental` database before repopulating it with the test dataset.
> 
> **Never run this script against a production database (e.g., Railway live DB) or any environment where active data must be retained!**

---

## 3. 📋 The 13 Core Database Tables

The project relies on the following 13 relational tables:

```text
1. users                         - User accounts, roles (CUSTOMER, OWNER, ADMIN), credentials
2. owners                        - Bike owner profile extensions, earnings, contact details
3. bikes                         - Vehicle details, pricing, engine CC, location coordinates
4. bike_images                   - Gallery image URLs for bike listings
5. aadhaar_verification          - Government identity KYC records and status
6. driving_license_verification  - Driving permit KYC records, expiry dates, status
7. bike_document_verification    - RC, insurance, and fitness documentation
8. bookings                      - Rental reservation records, timestamps, total fare
9. payments                      - Payment transactions, Razorpay IDs, payment status
10. reviews                      - Customer feedback, ratings, and bike review comments
11. notifications                - User notification inbox alerts and read receipts
12. otp_verifications             - One-Time Password verification requests
13. refresh_tokens               - JWT refresh token persistence
```

> **Note:** The backend uses Spring Data JPA (`spring.jpa.hibernate.ddl-auto=update`), which automatically validates and updates table schemas when the Spring Boot backend starts.

---

## 4. 🚀 Prerequisites & Connection Settings

- **MySQL Server**: 8.0 or newer
- **Default Database**: `bike_rental`
- **Default Host / Port**: `localhost:3306`
- **Backend Port**: `8888` (Spring Boot API)

Ensure your backend configuration in `bike-rental-backend/src/main/resources/application-local.properties` (or `application-dev.properties`) matches your local MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bike_rental
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

---

## 5. 📥 How to Import the Dataset

### Option A — Direct Command Line (Windows PowerShell / CMD)
From the project root directory:

```bash
# Windows PowerShell / CMD
mysql -u root -p < database/bike_rental_test_data_hyderabad.sql
```
*(Enter your MySQL root password when prompted.)*

### Option B — Within MySQL Shell / Workbench
1. Log into your MySQL console:
   ```bash
   mysql -u root -p
   ```
2. Run the script using forward slashes in the path:
   ```sql
   SOURCE e:/CMRM/SSSIT/Project/javaproject1/database/bike_rental_test_data_hyderabad.sql;
   ```

---

## 6. 🔍 Verification & Expected Record Counts

Execute the following query to confirm accurate population:

```sql
USE bike_rental;

SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM owners) AS owners,
    (SELECT COUNT(*) FROM bikes) AS bikes,
    (SELECT COUNT(*) FROM bike_images) AS bike_images,
    (SELECT COUNT(*) FROM aadhaar_verification) AS aadhaar,
    (SELECT COUNT(*) FROM driving_license_verification) AS licenses,
    (SELECT COUNT(*) FROM bike_document_verification) AS bike_documents,
    (SELECT COUNT(*) FROM bookings) AS bookings,
    (SELECT COUNT(*) FROM payments) AS payments,
    (SELECT COUNT(*) FROM reviews) AS reviews,
    (SELECT COUNT(*) FROM notifications) AS notifications,
    (SELECT COUNT(*) FROM otp_verifications) AS otps,
    (SELECT COUNT(*) FROM refresh_tokens) AS refresh_tokens;
```

### Expected Output:
| Table | Record Count |
| :--- | :--- |
| `users` | **7** |
| `owners` | **2** |
| `bikes` | **14** |
| `bike_images` | **19** |
| `aadhaar_verification` | **6** |
| `driving_license_verification` | **4** |
| `bike_document_verification` | **14** |
| `bookings` | **8** |
| `payments` | **8** |
| `reviews` | **3** |
| `notifications` | **10** |
| `otp_verifications` | **4** |
| `refresh_tokens` | **5** |

---

## 7. 🔐 Pre-configured Test Accounts

| Role | Name | Email | Password | Status & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | System Admin | `admin@bikerental.test` | `Admin@123` | Full access to moderation, KYC, and fleet analytics |
| **OWNER** | Ravi Kumar | `ravi.owner@bikerental.test` | `Owner@123` | Fleet owner with 7 bikes; verified KYC |
| **OWNER** | Priya Sharma | `priya.owner@bikerental.test` | `Owner@123` | Fleet owner with 7 bikes (including EV & maintenance bikes) |
| **CUSTOMER** | Arjun Reddy | `arjun.customer@bikerental.test` | `Customer@123` | Verified customer; has active (#503) & past rentals |
| **CUSTOMER** | Neha Patel | `neha.customer@bikerental.test` | `Customer@123` | Verified customer with upcoming confirmed booking |
| **CUSTOMER** | Vikram Singh | `vikram.customer@bikerental.test` | `Customer@123` | Customer with PENDING KYC (tests document block) |
| **CUSTOMER** | Kiran Rao | `pending.customer@bikerental.test` | `Customer@123` | Customer with REJECTED KYC / failed payment |

---

## 8. 📍 Hyderabad Location Test Dataset

All bikes are geo-tagged across major Hyderabad hubs with accurate coordinates for Leaflet and Google Maps testing:

| Bike ID | Model | Location | Coordinates (Lat, Lng) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **101** | Royal Enfield Classic 350 | Banjara Hills | `17.4156, 78.4347` | AVAILABLE |
| **102** | Honda Activa 125 | Jubilee Hills | `17.4319, 78.4073` | AVAILABLE |
| **103** | KTM Duke 200 | Madhapur | `17.4483, 78.3915` | BOOKED |
| **104** | Yamaha MT-15 | Kondapur | `17.4699, 78.3578` | AVAILABLE |
| **105** | Honda Activa 6G | Somajiguda | `17.4265, 78.4588` | UNDER_MAINTENANCE |
| **106** | TVS iQube (Electric) | Kukatpally | `17.4948, 78.3996` | AVAILABLE |
| **107** | Suzuki Access 125 | Tank Bund | `17.4239, 78.4738` | AVAILABLE |
| **108** | Yamaha FZ-S (KYC Test) | Hitech City | `17.4435, 78.3772` | NOT_AVAILABLE (RC Pending) |
| **109** | Honda Shine 125 | Gachibowli | `17.4401, 78.3489` | AVAILABLE |
| **110** | KTM RC 390 | Secunderabad | `17.4399, 78.4983` | AVAILABLE |
| **111** | Ather 450X (Electric) | Ameerpet | `17.4375, 78.4482` | AVAILABLE |
| **112** | Royal Enfield Meteor 350 | Begumpet | `17.4447, 78.4664` | AVAILABLE |
| **113** | Bajaj Pulsar NS200 | Dilsukhnagar | `17.3688, 78.5247` | AVAILABLE |
| **114** | BMW G310 GS | Shamshabad (Airport) | `17.2403, 78.4294` | AVAILABLE |

---

## 9. 🛠️ Troubleshooting

- **Error: `Unknown database 'bike_rental'`**:
  Make sure MySQL is running and execute `CREATE DATABASE bike_rental;` before running the seed script if it was not auto-created.
- **Error: `Access denied for user 'root'@'localhost'`**:
  Check your password. Run `mysql -u root -p` and test authentication manually.
- **Port Conflict**:
  MySQL runs by default on port `3306`. If your MySQL installation uses an alternative port (e.g. `3307`), specify `-P 3307` in your command line and update `application-local.properties`.
- **Foreign Key Restraints Error**:
  The script automatically wraps execution with `SET FOREIGN_KEY_CHECKS = 0;` and `SET FOREIGN_KEY_CHECKS = 1;`. Ensure your user has global/session privilege to set this variable.

---

## 🔗 Quick Navigation
- 🏠 [Root Project README](../README.md)
- ⚙️ [Backend Documentation](../bike-rental-backend/README.md)
- 🎨 [Frontend Documentation](../bike-rental-frontend/README.md)
- 📚 [Documentation Hub](../docs/README.md)
