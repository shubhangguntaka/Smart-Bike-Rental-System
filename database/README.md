# Smart Bike Rental System — Shared Test Database

This folder contains the shared MySQL test dataset for the **Smart Bike Rental System with Live GPS Tracking, Google Maps & Secure Verification**.

The dataset is designed so every teammate can create the same local `bike_rental` database state and test the frontend/backend consistently.

## Files

- `bike_rental_test_data_hyderabad.sql` — complete reset + seed script.
- `README_BIKE_RENTAL_TEST_DATABASE.md` — this setup guide.

## 1. What this SQL file does

The SQL script:

1. Creates the `bike_rental` database if it does not exist.
2. Selects `bike_rental`.
3. Temporarily disables foreign-key checks.
4. Clears the existing application data from all 13 project tables.
5. Inserts shared test users.
6. Inserts owners.
7. Inserts 14 Hyderabad test bikes.
8. Inserts external HTTPS bike image URLs.
9. Inserts Aadhaar verification test states.
10. Inserts driving-license verification test states.
11. Inserts bike-document/RC verification test states.
12. Inserts bookings covering all booking statuses.
13. Inserts payment records covering success/pending/failed/refunded states.
14. Inserts reviews.
15. Inserts notifications.
16. Inserts OTP test records.
17. Inserts refresh-token test records.
18. Re-enables foreign-key checks.
19. Runs validation queries and prints the resulting counts.

## 2. Important warning

### Development/testing only

This is a **destructive seed script**.

It contains:

```sql
TRUNCATE TABLE ...
```

Therefore, running it will remove existing data from the 13 application tables before inserting the shared test data.

**Never run this against production or any database containing data that must be preserved.**

Before running it, make sure:

```sql
USE bike_rental;
```

points to your local development database.

## 3. Existing database schema

The project currently uses these 13 tables:

```text
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
```

The seed data is intended for the existing schema. It does not create or alter the table structure.

If a teammate has not created the schema yet, they must first run the project's schema/DDL SQL that creates these 13 tables.

## 4. Prerequisites

Install:

- MySQL Server
- MySQL client / MySQL Command Line Client

Recommended:

```text
MySQL 8.x
```

The backend should be configured to connect to:

```text
Database: bike_rental
Host: localhost
Port: 3306
```

The exact username/password depends on each teammate's local MySQL installation.

## 5. Import from MySQL Command Line

### Option A — directly from Windows CMD

```cmd
mysql -u root -p < bike_rental_test_data_hyderabad.sql
```

Enter the local MySQL root password when prompted.

Because the script itself contains:

```sql
CREATE DATABASE IF NOT EXISTS bike_rental;
USE bike_rental;
```

you do not need to specify the database in the command.

### Option B — after entering MySQL

Start:

```cmd
mysql -u root -p
```

Then:

```sql
SOURCE C:/path/to/bike_rental_test_data_hyderabad.sql;
```

Example:

```sql
SOURCE C:/Users/Shubhang/Downloads/bike_rental_test_data_hyderabad.sql;
```

Use forward slashes in the `SOURCE` path to avoid Windows escaping problems.

## 6. Verify the import

At the end of the script, a validation query prints counts.

Expected result:

```text
users                         7
owners                        2
bikes                        14
bike_images                  19
aadhaar_verification           6
driving_license_verification   4
bike_document_verification   14
bookings                       8
payments                       8
reviews                        3
notifications                 10
otp_verifications              4
refresh_tokens                 5
```

You can manually verify:

```sql
USE bike_rental;

SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bikes;
SELECT COUNT(*) FROM bookings;
SELECT COUNT(*) FROM payments;
```

To view available bikes:

```sql
SELECT
    bike_id,
    bike_name,
    brand,
    model,
    bike_status,
    rc_verified,
    rental_price,
    rental_type,
    location
FROM bikes
WHERE bike_status = 'AVAILABLE'
  AND rc_verified = 1
ORDER BY bike_id;
```

## 7. Shared test accounts

### Admin

```text
Email:    admin@bikerental.test
Password: Admin@123
Role:     ADMIN
```

### Owners

```text
Email:    ravi.owner@bikerental.test
Password: Owner@123
Role:     OWNER
```

```text
Email:    priya.owner@bikerental.test
Password: Owner@123
Role:     OWNER
```

### Customers

```text
Email:    arjun.customer@bikerental.test
Password: Customer@123
Role:     CUSTOMER
```

```text
Email:    neha.customer@bikerental.test
Password: Customer@123
Role:     CUSTOMER
``` 

```text
Email:    vikram.customer@bikerental.test
Password: Customer@123
Role:     CUSTOMER
```

```text
Email:    pending.customer@bikerental.test
Password: Customer@123
Role:     CUSTOMER
```

## 8. Recommended testing sequence

### Admin

Login with:

```text
admin@bikerental.test
Admin@123
```

Test:

- Admin login
- Dashboard
- User management
- Owner verification
- Customer verification
- Aadhaar verification
- Driving-license verification
- Bike/RC verification
- Booking management
- Payment status
- Notifications

### Owner — Ravi

Login:

```text
ravi.owner@bikerental.test
Owner@123
```

Ravi owns bikes:

```text
101
102
103
104
109
110
113
```

Use this account to test:

- Owner dashboard
- Bike listing
- Bike details
- Booking requests
- Booking approval/rejection
- Bike document verification
- Notifications
- Owner-related statistics

### Owner — Priya

Login:

```text
priya.owner@bikerental.test
Owner@123
```

Priya owns bikes:

```text
105
106
107
108
111
112
114
```

This account is particularly useful for testing:

- Maintenance bike
- Electric bike
- RC-pending bike
- Owner verification-related screens

### Customer — Arjun

Login:

```text
arjun.customer@bikerental.test
Customer@123
```

Arjun has multiple booking states:

```text
501 → COMPLETED
503 → ACTIVE
508 → CANCELLED
```

Use this account to test:

- Customer dashboard
- Active rental
- Booking history
- Completed booking
- Cancelled booking
- Reviews
- Notifications
- Payment history

### Customer — Neha

```text
neha.customer@bikerental.test
Customer@123
```

Useful for:

- Confirmed booking
- Successful payment
- Customer verification
- Upcoming rental

### Customer — Vikram

```text
vikram.customer@bikerental.test
Customer@123
```

Useful for:

- Pending Aadhaar
- Pending driving license
- Verification-required booking
- Pending payment

### Customer — Kiran

```text
pending.customer@bikerental.test
Customer@123
```

Useful for:

- Rejected Aadhaar
- Rejected driving license
- Rejected booking
- Failed payment

## 9. Bike test states

The dataset intentionally includes different bike states.

```text
101  Classic 350              AVAILABLE
102  Activa 125               AVAILABLE
103  Duke 200                 BOOKED
104  MT-15                    AVAILABLE
105  Activa 6G                UNDER_MAINTENANCE
106  TVS iQube                AVAILABLE
107  Access 125               AVAILABLE
108  FZ-S Verification Test   NOT_AVAILABLE
109  Shine 125                AVAILABLE
110  Hitech City Sport        AVAILABLE
111  Gachibowli Commuter      AVAILABLE
112  Secunderabad Cruiser     AVAILABLE
113  Ameerpet Easy Ride       AVAILABLE
114  Airport Premium          AVAILABLE
```

This allows the frontend to test filters and conditional UI.

## 10. Hyderabad location data

All bike locations are in Hyderabad, Telangana, India.

Example locations:

```text
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
```

Latitude/longitude values are included in the `bikes` table for map and geolocation testing.

Example:

```text
Banjara Hills:
17.4156, 78.4347

Madhapur:
17.4483, 78.3915

Gachibowli:
17.4401, 78.3489
```

## 11. Image URLs

The seed uses external HTTPS image URLs instead of paths such as:

```text
/uploads/bikes/classic350.jpg
```

This is intentional.

Each teammate can therefore use the same database without needing the same image files on their local machine.

Bike images use:

```text
https://images.unsplash.com/
```

Test document images use generated placeholder URLs such as:

```text
https://dummyimage.com/
```

These are **test/demo assets**, not real identity or vehicle documents.

If the frontend/backend expects images to be served by your own backend instead of accepting remote URLs, the application may need to explicitly support remote image URLs.

## 12. Verification test cases

### Aadhaar

The dataset includes:

```text
Ravi   → VERIFIED
Priya  → VERIFIED
Arjun  → VERIFIED
Neha   → VERIFIED
Vikram → PENDING
Kiran  → REJECTED
```

### Driving License

```text
Arjun  → VERIFIED
Neha   → VERIFIED
Vikram → PENDING
Kiran  → REJECTED
```

### Bike RC

Most bikes are:

```text
VERIFIED
```

Bike `108` is deliberately:

```text
PENDING
```

and:

```text
rc_verified = 0
bike_status = NOT_AVAILABLE
```

This is useful for testing verification restrictions.

## 13. Booking test states

The seed intentionally covers every booking enum currently used by the schema:

```text
PENDING
VERIFICATION_REQUIRED
APPROVED
CONFIRMED
ACTIVE
REJECTED
CANCELLED
COMPLETED
```

This allows the team to test:

- Booking cards
- Status badges
- Admin filters
- Owner approval flows
- Customer history
- Active ride screens
- Cancellation UI
- Completed ride UI

## 14. Payment test states

The dataset includes:

```text
SUCCESS
PENDING
FAILED
REFUNDED
```

This allows payment UI and backend status handling to be tested without making real payments.

## 15. OTP test data

Example OTP records are included for:

```text
EMAIL_VERIFICATION
PHONE_VERIFICATION
FORGOT_PASSWORD
```

These are test records only.

Do not use these OTPs for any real authentication flow.

## 16. Important image/document note

The URLs in this SQL are intended for **frontend rendering and API testing**.

They are not real:

- Aadhaar cards
- Driving licences
- RC certificates
- User identity documents

The document identifiers are deliberately prefixed with:

```text
TEST-
```

Do not replace them with real personal documents in a shared repository.

## 17. Backend configuration

Each teammate should configure their backend environment for their own local MySQL instance.

Typical values are:

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bike_rental
DB_USERNAME=root
DB_PASSWORD=<your-local-mysql-password>
```

Use the project's existing Spring Boot configuration format if it differs.

Do not commit personal database passwords to Git.

## 18. Recommended Git repository structure

A good location in the backend repository is:

```text
bike-rental-backend/
├── src/
├── pom.xml
├── README.md
└── database/
    ├── bike_rental_schema.sql
    ├── bike_rental_test_data_hyderabad.sql
    └── README_BIKE_RENTAL_TEST_DATABASE.md
```

If the schema is already managed by JPA/Hibernate, keep the seed SQL as a development/testing utility rather than replacing the application's schema management.

## 19. Troubleshooting

### `Table doesn't exist`

The schema has not been created yet.

Run the project's schema/DDL setup first.

### `Unknown column`

The teammate's database schema is different from the shared project schema.

Check:

```sql
SHOW TABLES;
```

and:

```sql
DESCRIBE bikes;
DESCRIBE users;
DESCRIBE bookings;
```

The seed file is based on the project's current 13-table schema.

### `Duplicate entry`

The seed file resets the test tables before inserting data.

If a duplicate error still occurs, check whether all `TRUNCATE` statements executed successfully and whether foreign-key checks were disabled during the reset.

### Images do not appear

Test the URL directly in a browser.

If the URL opens but the application blocks it, check:

- frontend image domain configuration
- backend CORS/security configuration
- browser mixed-content restrictions
- Next.js `remotePatterns`/image configuration if applicable

### Login says incorrect email/password

Make sure the user records were successfully imported.

Run:

```sql
SELECT id,email,role,enabled,email_verified
FROM users
ORDER BY id;
```

Then use the exact credentials in this README.

Do not replace the BCrypt hashes with plaintext passwords.

## 20. Final verification command

Run:

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

Expected:

```text
users = 7
owners = 2
bikes = 14
bike_images = 19
aadhaar = 6
licenses = 4
bike_documents = 14
bookings = 8
payments = 8
reviews = 3
notifications = 10
otps = 4
refresh_tokens = 5
```

## 21. Team workflow

Every teammate should:

1. Clone/pull the latest project code.
2. Create their local MySQL database/schema.
3. Run the shared test-data SQL.
4. Confirm the expected row counts.
5. Configure their backend `.env`/`application.properties`.
6. Start the backend.
7. Start the frontend.
8. Test using the shared accounts.
9. Report application bugs separately from database setup issues.
10. Do not modify the shared SQL casually; changes to test data should be coordinated with the team.

---

**Dataset purpose:** consistent local development and integration testing for the Smart Bike Rental System.

**Location:** Hyderabad, Telangana, India.

**Environment:** Development / Testing only.
