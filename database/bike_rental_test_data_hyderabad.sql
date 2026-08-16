-- ============================================================
-- SMART BIKE RENTAL SYSTEM
-- TEAM TEST DATABASE / SEED DATA
-- Location: Hyderabad, Telangana, India
-- Database: bike_rental
--
-- PURPOSE:
--   Shared development/testing dataset for the complete Bike Rental
--   application. This file matches the existing 13-table schema.
--
-- IMPORTANT:
--   - DEVELOPMENT / TESTING ONLY.
--   - This script resets the application data in all 13 tables.
--   - Do NOT run this against production data.
--   - Passwords below are BCrypt hashes compatible with the project.
--   - Image/document URLs are public HTTPS placeholder images rather
--     than local filesystem paths, so frontend/API testing does not
--     depend on files existing on each teammate's computer.
--
-- TEST LOGINS:
--   ADMIN:
--     admin@bikerental.test / Admin@123
--
--   OWNERS:
--     ravi.owner@bikerental.test / Owner@123
--     priya.owner@bikerental.test / Owner@123
--
--   CUSTOMERS:
--     arjun.customer@bikerental.test / Customer@123
--     neha.customer@bikerental.test / Customer@123
--     vikram.customer@bikerental.test / Customer@123
--     pending.customer@bikerental.test / Customer@123
--
-- PUBLIC IMAGE SOURCE:
--   https://images.unsplash.com/
--   Images are used only as external test/demo assets.
-- ============================================================

CREATE DATABASE IF NOT EXISTS bike_rental;
USE bike_rental;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 0. RESET ALL APPLICATION DATA
-- ============================================================

TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE notifications;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE otp_verifications;
TRUNCATE TABLE bike_images;
TRUNCATE TABLE bike_document_verification;
TRUNCATE TABLE driving_license_verification;
TRUNCATE TABLE aadhaar_verification;
TRUNCATE TABLE bikes;
TRUNCATE TABLE owners;
TRUNCATE TABLE users;

-- ============================================================
-- 1. USERS
-- BCrypt hashes:
--   Admin@123    -> $2a$10$KZjlj...
--   Owner@123    -> $2a$10$wPGrn...
--   Customer@123 -> $2a$10$avqas...
-- ============================================================

INSERT INTO users
(id, created_at, updated_at, account_non_expired, account_non_locked,
 credentials_non_expired, email, email_verified, enabled,
 first_name, last_name, password, phone_number, phone_verified,
 profile_image, role)
VALUES
(1,'2026-08-01 09:00:00','2026-08-16 09:00:00',1,1,1,
 'admin@bikerental.test',1,1,'System','Administrator',
 '$2a$10$KZjljLbjdJ/iG3e7O9Uw9uu9pNrHyNkVCC8Aahlnff4Ht2dDsWK8K',
 '9000000001',1,
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
 'ADMIN'),

(2,'2026-08-02 09:00:00','2026-08-16 09:00:00',1,1,1,
 'ravi.owner@bikerental.test',1,1,'Ravi','Kumar',
 '$2a$10$wPGrnXIUxpr4qY/Q9S/.DOn6FbhqgS4mkt4xqgtXhLcrhvWOuynXu',
 '9000000002',1,
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
 'OWNER'),

(3,'2026-08-03 09:00:00','2026-08-16 09:00:00',1,1,1,
 'priya.owner@bikerental.test',1,1,'Priya','Reddy',
 '$2a$10$wPGrnXIUxpr4qY/Q9S/.DOn6FbhqgS4mkt4xqgtXhLcrhvWOuynXu',
 '9000000003',1,
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
 'OWNER'),

(4,'2026-08-04 09:00:00','2026-08-16 09:00:00',1,1,1,
 'arjun.customer@bikerental.test',1,1,'Arjun','Sharma',
 '$2a$10$avqasKI9.hxkvAp5Qpw3UOE6ggPaiK3iqW4tqRojXcSt5w/bPKALO',
 '9000000004',1,
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
 'CUSTOMER'),

(5,'2026-08-05 09:00:00','2026-08-16 09:00:00',1,1,1,
 'neha.customer@bikerental.test',1,1,'Neha','Rao',
 '$2a$10$avqasKI9.hxkvAp5Qpw3UOE6ggPaiK3iqW4tqRojXcSt5w/bPKALO',
 '9000000005',1,
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'CUSTOMER'),

(6,'2026-08-06 09:00:00','2026-08-16 09:00:00',1,1,1,
 'vikram.customer@bikerental.test',1,1,'Vikram','Patel',
 '$2a$10$avqasKI9.hxkvAp5Qpw3UOE6ggPaiK3iqW4tqRojXcSt5w/bPKALO',
 '9000000006',1,
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
 'CUSTOMER'),

(7,'2026-08-07 09:00:00','2026-08-16 09:00:00',1,1,1,
 'pending.customer@bikerental.test',1,1,'Kiran','Das',
 '$2a$10$avqasKI9.hxkvAp5Qpw3UOE6ggPaiK3iqW4tqRojXcSt5w/bPKALO',
 '9000000007',1,
 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400',
 'CUSTOMER');

-- ============================================================
-- 2. OWNERS
-- ============================================================

INSERT INTO owners (owner_id) VALUES
(2),(3);

-- ============================================================
-- 3. BIKES
-- All registration_number and rc_number values are UNIQUE.
-- All locations are Hyderabad, Telangana, India.
-- ============================================================

INSERT INTO bikes
(bike_id, available_date, available_end_time, available_start_time,
 bike_name, bike_status, brand, created_at, description,
 engine_capacity, fuel_type, hourly_rate, image_url,
 latitude, location, longitude, mileage, model, owner_id,
 rc_number, rc_verified, registration_number, rental_price,
 rental_type, seating_capacity, transmission, updated_at)
VALUES
(101,'2026-08-16','22:00:00','06:00:00',
 'Classic 350','AVAILABLE','Royal Enfield','2026-08-01 09:00:00',
 'Premium cruiser for Hyderabad city and weekend rides.',
 '349cc','PETROL',45.00,
 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200',
 17.4156,'Banjara Hills, Hyderabad, Telangana, India',78.4347,'35 km/l',
 'Classic 350',2,'RC-TS09-1001',1,'TS09AB1001',
 999.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(102,'2026-08-16','22:00:00','06:00:00',
 'Activa 125','AVAILABLE','Honda','2026-08-02 09:00:00',
 'Comfortable scooter for daily Hyderabad commuting.',
 '124cc','PETROL',35.00,
 'https://images.unsplash.com/photo-1558980664-10ea7e8c7a4c?w=1200',
 17.4095,'Jubilee Hills, Hyderabad, Telangana, India',78.4147,'45 km/l',
 'Activa 125',2,'RC-TS09-1002',1,'TS09AB1002',
 699.00,'BOTH',2,'AUTOMATIC','2026-08-16 09:00:00'),

(103,'2026-08-16','22:00:00','06:00:00',
 'Duke 200','BOOKED','KTM','2026-08-03 09:00:00',
 'Sport motorcycle for experienced riders.',
 '199cc','PETROL',50.00,
 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=1200',
 17.4483,'Madhapur, Hyderabad, Telangana, India',78.3915,'35 km/l',
 'Duke 200',2,'RC-TS10-1001',1,'TS10CD1001',
 899.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(104,'2026-08-16','22:00:00','06:00:00',
 'MT-15','AVAILABLE','Yamaha','2026-08-04 09:00:00',
 'Lightweight premium street motorcycle.',
 '155cc','PETROL',48.00,
 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200',
 17.4370,'Kondapur, Hyderabad, Telangana, India',78.3910,'48 km/l',
 'MT-15',2,'RC-TS10-1002',1,'TS10CD1002',
 799.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(105,'2026-08-16','22:00:00','06:00:00',
 'Activa 6G','UNDER_MAINTENANCE','Honda','2026-08-05 09:00:00',
 'Scooter currently under maintenance for testing.',
 '109cc','PETROL',25.00,
 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200',
 17.4610,'Kondapur, Hyderabad, Telangana, India',78.3740,'48 km/l',
 'Activa 6G',3,'RC-TS10-1003',1,'TS10CD1003',
 449.00,'BOTH',2,'AUTOMATIC','2026-08-16 09:00:00'),

(106,'2026-08-16','22:00:00','06:00:00',
 'TVS iQube','AVAILABLE','TVS','2026-08-06 09:00:00',
 'Electric scooter for urban Hyderabad travel.',
 'Electric','ELECTRIC',30.00,
 'https://images.unsplash.com/photo-1596450666273-7e8c2e3e9c2a?w=1200',
 17.4483,'Madhapur, Hyderabad, Telangana, India',78.3915,'100 km/charge',
 'iQube',3,'RC-TS10-1004',1,'TS10CD1004',
 699.00,'BOTH',2,'AUTOMATIC','2026-08-16 09:00:00'),

(107,'2026-08-16','22:00:00','06:00:00',
 'Access 125','AVAILABLE','Suzuki','2026-08-07 09:00:00',
 'Convenient scooter for city and airport routes.',
 '124cc','PETROL',28.00,
 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=1200',
 17.4186,'Somajiguda, Hyderabad, Telangana, India',78.4563,'45 km/l',
 'Access 125',3,'RC-TS09-1003',1,'TS09AB1003',
 479.00,'BOTH',2,'AUTOMATIC','2026-08-16 09:00:00'),

(108,'2026-08-16','22:00:00','06:00:00',
 'FZ-S Verification Test','NOT_AVAILABLE','Yamaha','2026-08-08 09:00:00',
 'Bike deliberately kept unavailable until RC verification.',
 '149cc','PETROL',32.00,
 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=1200',
 17.4948,'Kukatpally, Hyderabad, Telangana, India',78.3996,'45 km/l',
 'FZ-S',3,'RC-TS11-1001',0,'TS11EF1001',
 649.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(109,'2026-08-16','22:00:00','06:00:00',
 'Shine 125','AVAILABLE','Honda','2026-08-09 09:00:00',
 'Fuel-efficient commuter for Tank Bund and city routes.',
 '125cc','PETROL',30.00,
 'https://images.unsplash.com/photo-1529422643029-d4585747aaf2?w=1200',
 17.4239,'Tank Bund, Hyderabad, Telangana, India',78.4738,'55 km/l',
 'Shine 125',2,'RC-TS09-1004',1,'TS09GH1001',
 549.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(110,'2026-08-16','23:00:00','06:00:00',
 'Hitech City Sport','AVAILABLE','Yamaha','2026-08-10 09:00:00',
 'Sporty bike near Hitech City.',
 '155cc','PETROL',55.00,
 'https://images.unsplash.com/photo-1558980394-0c1c0f5e6f2f?w=1200',
 17.4435,'Hitech City, Hyderabad, Telangana, India',78.3772,'48 km/l',
 'MT-15',2,'RC-TS09-1005',1,'TS09GH1002',
 899.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(111,'2026-08-16','22:00:00','06:00:00',
 'Gachibowli Commuter','AVAILABLE','Honda','2026-08-11 09:00:00',
 'Fuel-efficient commuter for office travel.',
 '125cc','PETROL',32.00,
 'https://images.unsplash.com/photo-1558980664-10ea7e8c7a4c?w=1200',
 17.4401,'Gachibowli, Hyderabad, Telangana, India',78.3489,'50 km/l',
 'SP 125',3,'RC-TS10-1005',1,'TS10GH1001',
 549.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00'),

(112,'2026-08-16','22:00:00','06:00:00',
 'Secunderabad Cruiser','AVAILABLE','Royal Enfield','2026-08-12 09:00:00',
 'Classic cruiser for city and weekend rides.',
 '349cc','PETROL',42.00,
 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200',
 17.4399,'Secunderabad, Hyderabad, Telangana, India',78.4983,'35 km/l',
 'Classic 350',3,'RC-TS10-1006',1,'TS10GH1002',
 999.00,'DAILY',2,'MANUAL','2026-08-16 09:00:00'),

(113,'2026-08-16','21:00:00','07:00:00',
 'Ameerpet Easy Ride','AVAILABLE','TVS','2026-08-13 09:00:00',
 'Affordable automatic scooter for short trips.',
 '110cc','PETROL',25.00,
 'https://images.unsplash.com/photo-1558980664-10ea7e8c7a4c?w=1200',
 17.4375,'Ameerpet, Hyderabad, Telangana, India',78.4483,'50 km/l',
 'Jupiter',2,'RC-TS09-1006',1,'TS09GH1003',
 449.00,'HOURLY',2,'AUTOMATIC','2026-08-16 09:00:00'),

(114,'2026-08-16','23:00:00','05:00:00',
 'Airport Premium','AVAILABLE','KTM','2026-08-14 09:00:00',
 'Premium motorcycle for longer Hyderabad rides.',
 '250cc','PETROL',60.00,
 'https://images.unsplash.com/photo-1558980394-0c1c0f5e6f2f?w=1200',
 17.2403,'Rajiv Gandhi International Airport, Hyderabad, Telangana, India',78.4294,
 '32 km/l','Duke 250',3,'RC-TS10-1007',1,'TS10GH1004',
 1099.00,'BOTH',2,'MANUAL','2026-08-16 09:00:00');

-- ============================================================
-- 4. BIKE IMAGES
-- External HTTPS URLs. These are supplementary image records.
-- ============================================================

INSERT INTO bike_images (bike_id,image_url) VALUES
(101,'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200'),
(101,'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=1200'),
(102,'https://images.unsplash.com/photo-1558980664-10ea7e8c7a4c?w=1200'),
(102,'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=1200'),
(103,'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=1200'),
(103,'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200'),
(104,'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200'),
(104,'https://images.unsplash.com/photo-1558980394-0c1c0f5e6f2f?w=1200'),
(105,'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200'),
(106,'https://images.unsplash.com/photo-1596450666273-7e8c2e3e9c2a?w=1200'),
(107,'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=1200'),
(108,'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=1200'),
(109,'https://images.unsplash.com/photo-1529422643029-d4585747aaf2?w=1200'),
(109,'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200'),
(110,'https://images.unsplash.com/photo-1558980394-0c1c0f5e6f2f?w=1200'),
(111,'https://images.unsplash.com/photo-1558980664-10ea7e8c7a4c?w=1200'),
(112,'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200'),
(113,'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=1200'),
(114,'https://images.unsplash.com/photo-1558980394-0c1c0f5e6f2f?w=1200');

-- ============================================================
-- 5. AADHAAR VERIFICATION TEST STATES
-- VERIFIED, PENDING, REJECTED
-- Test identifiers only; NOT real Aadhaar numbers.
-- ============================================================

INSERT INTO aadhaar_verification
(id,aadhaar_number,customer_id,customer_name,document_path,
 extracted_text,name_source,note,rejection_reason,stamp_color,
 stamp_icon,stamp_label,status,uploaded_at,uploaded_file,
 verified_at,verified_by,verified_for_bike_owner,verified_for_user)
VALUES
(201,'TEST-AADHAAR-RAVI',2,'Ravi Kumar',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Ravi',
 'RAVI KUMAR | TEST-AADHAAR-RAVI','OCR','Owner verified.',
 NULL,'GREEN','CHECK','VERIFIED','VERIFIED',
 '2026-08-01 10:00:00',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Ravi',
 '2026-08-01 10:10:00','admin',1,0),

(202,'TEST-AADHAAR-PRIYA',3,'Priya Reddy',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Priya',
 'PRIYA REDDY | TEST-AADHAAR-PRIYA','OCR','Owner verified.',
 NULL,'GREEN','CHECK','VERIFIED','VERIFIED',
 '2026-08-02 10:00:00',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Priya',
 '2026-08-02 10:10:00','admin',1,0),

(203,'TEST-AADHAAR-ARJUN',4,'Arjun Sharma',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Arjun',
 'ARJUN SHARMA | TEST-AADHAAR-ARJUN','OCR','Customer verified.',
 NULL,'GREEN','CHECK','VERIFIED','VERIFIED',
 '2026-08-03 10:00:00',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Arjun',
 '2026-08-03 10:10:00','admin',0,1),

(204,'TEST-AADHAAR-NEHA',5,'Neha Rao',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Neha',
 'NEHA RAO | TEST-AADHAAR-NEHA','OCR','Customer verified.',
 NULL,'GREEN','CHECK','VERIFIED','VERIFIED',
 '2026-08-04 10:00:00',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+Aadhaar+Neha',
 '2026-08-04 10:10:00','admin',0,1),

(205,'TEST-AADHAAR-VIKRAM',6,'Vikram Patel',
 'https://dummyimage.com/1200x800/fef3c7/111827&text=TEST+Aadhaar+Vikram',
 'VIKRAM PATEL | TEST-AADHAAR-VIKRAM','OCR','Verification pending.',
 NULL,'YELLOW','CLOCK','PENDING','PENDING',
 '2026-08-05 10:00:00',
 'https://dummyimage.com/1200x800/fef3c7/111827&text=TEST+Aadhaar+Vikram',
 NULL,NULL,0,1),

(206,'TEST-AADHAAR-KIRAN',7,'Kiran Das',
 'https://dummyimage.com/1200x800/fee2e2/111827&text=TEST+Aadhaar+Kiran',
 'KIRAN DAS | TEST-AADHAAR-KIRAN','OCR','Rejected test record.',
 'Name mismatch.','RED','X','REJECTED','REJECTED',
 '2026-08-06 10:00:00',
 'https://dummyimage.com/1200x800/fee2e2/111827&text=TEST+Aadhaar+Kiran',
 NULL,'admin',0,1);

-- ============================================================
-- 6. DRIVING LICENSE VERIFICATION
-- ============================================================

INSERT INTO driving_license_verification
(id,address,customer_id,customer_name,dob,document_path,issue_date,
 license_number,ocr_text,remarks,stamp_color,stamp_icon,stamp_label,
 status,valid_till,verified_at,verified_by)
VALUES
(301,'Banjara Hills, Hyderabad, Telangana, India',4,'Arjun Sharma',
 '2002-04-15',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+DL+Arjun',
 '2022-06-10','TEST-DL-ARJUN',
 'ARJUN SHARMA | TEST-DL-ARJUN','License verified.',
 'GREEN','CHECK','VERIFIED','VERIFIED','2042-06-09',
 '2026-08-03 10:20:00','admin'),

(302,'Madhapur, Hyderabad, Telangana, India',5,'Neha Rao',
 '2001-09-21',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+DL+Neha',
 '2021-08-11','TEST-DL-NEHA',
 'NEHA RAO | TEST-DL-NEHA','License verified.',
 'GREEN','CHECK','VERIFIED','VERIFIED','2041-08-10',
 '2026-08-04 10:20:00','admin'),

(303,'Kondapur, Hyderabad, Telangana, India',6,'Vikram Patel',
 '2000-02-10',
 'https://dummyimage.com/1200x800/fef3c7/111827&text=TEST+DL+Vikram',
 '2020-03-20','TEST-DL-VIKRAM',
 'VIKRAM PATEL | TEST-DL-VIKRAM','Verification pending.',
 'YELLOW','CLOCK','PENDING','PENDING','2040-03-19',
 NULL,NULL),

(304,'Hyderabad, Telangana, India',7,'Kiran Das',
 '2003-12-01',
 'https://dummyimage.com/1200x800/fee2e2/111827&text=TEST+DL+Kiran',
 '2023-01-05','TEST-DL-KIRAN',
 'KIRAN DAS | TEST-DL-KIRAN','Rejected test record.',
 'RED','X','REJECTED','REJECTED','2043-01-04',
 NULL,'admin');

-- ============================================================
-- 7. BIKE DOCUMENT VERIFICATION
-- ============================================================

INSERT INTO bike_document_verification
(id,address,bike_id,chassis_number,document_path,engine_number,
fitness_valid_upto,insurance_valid_upto,maker_name,model,ocr_text,
owner_id,owner_name,pucc_valid_upto,registration_date,
registration_number,remarks,stamp_color,stamp_icon,stamp_label,
status,vehicle_class,verified_at,verified_by)
VALUES
(401,'Banjara Hills, Hyderabad, Telangana, India',101,'CHASSIS-101',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+101',
 'ENGINE-101','2027-08-01','2027-07-31','Royal Enfield','Classic 350',
 'CLASSIC 350 | TS09AB1001',2,'Ravi Kumar','2027-07-31','2024-08-01',
 'TS09AB1001','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-01 11:00:00','admin'),

(402,'Jubilee Hills, Hyderabad, Telangana, India',102,'CHASSIS-102',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+102',
 'ENGINE-102','2027-08-02','2027-08-01','Honda','Activa 125',
 'ACTIVA 125 | TS09AB1002',2,'Ravi Kumar','2027-08-01','2024-08-02',
 'TS09AB1002','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'SCOOTER','2026-08-02 11:00:00','admin'),

(403,'Madhapur, Hyderabad, Telangana, India',103,'CHASSIS-103',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+103',
 'ENGINE-103','2027-08-03','2027-08-02','KTM','Duke 200',
 'DUKE 200 | TS10CD1001',2,'Ravi Kumar','2027-08-02','2024-08-03',
 'TS10CD1001','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-03 11:00:00','admin'),

(404,'Kondapur, Hyderabad, Telangana, India',104,'CHASSIS-104',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+104',
 'ENGINE-104','2027-08-04','2027-08-03','Yamaha','MT-15',
 'MT-15 | TS10CD1002',2,'Ravi Kumar','2027-08-03','2024-08-04',
 'TS10CD1002','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-04 11:00:00','admin'),

(405,'Kondapur, Hyderabad, Telangana, India',105,'CHASSIS-105',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+105',
 'ENGINE-105','2027-08-05','2027-08-04','Honda','Activa 6G',
 'ACTIVA 6G | TS10CD1003',3,'Priya Reddy','2027-08-04','2024-08-05',
 'TS10CD1003','Under maintenance.','GREEN','CHECK','VERIFIED','VERIFIED',
 'SCOOTER','2026-08-05 11:00:00','admin'),

(406,'Madhapur, Hyderabad, Telangana, India',106,'CHASSIS-106',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+106',
 'ENGINE-106','2027-08-06','2027-08-05','TVS','iQube',
 'IQUBE | TS10CD1004',3,'Priya Reddy','2027-08-05','2024-08-06',
 'TS10CD1004','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'SCOOTER','2026-08-06 11:00:00','admin'),

(407,'Somajiguda, Hyderabad, Telangana, India',107,'CHASSIS-107',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+107',
 'ENGINE-107','2027-08-07','2027-08-06','Suzuki','Access 125',
 'ACCESS 125 | TS09AB1003',3,'Priya Reddy','2027-08-06','2024-08-07',
 'TS09AB1003','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'SCOOTER','2026-08-07 11:00:00','admin'),

(408,'Kukatpally, Hyderabad, Telangana, India',108,'CHASSIS-108',
 'https://dummyimage.com/1200x800/fef3c7/111827&text=TEST+RC+108',
 'ENGINE-108','2027-08-08','2027-08-07','Yamaha','FZ-S',
 'FZ-S | TS11EF1001',3,'Priya Reddy','2027-08-07','2025-08-08',
 'TS11EF1001','RC verification pending.','YELLOW','CLOCK','PENDING',
 'PENDING','MOTORCYCLE',NULL,NULL),

(409,'Tank Bund, Hyderabad, Telangana, India',109,'CHASSIS-109',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+109',
 'ENGINE-109','2027-08-09','2027-08-08','Honda','Shine 125',
 'SHINE 125 | TS09GH1001',2,'Ravi Kumar','2027-08-08','2024-08-09',
 'TS09GH1001','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-09 11:00:00','admin'),

(410,'Hitech City, Hyderabad, Telangana, India',110,'CHASSIS-110',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+110',
 'ENGINE-110','2027-08-10','2027-08-09','Yamaha','MT-15',
 'MT-15 | TS09GH1002',2,'Ravi Kumar','2027-08-09','2024-08-10',
 'TS09GH1002','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-10 11:00:00','admin'),

(411,'Gachibowli, Hyderabad, Telangana, India',111,'CHASSIS-111',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+111',
 'ENGINE-111','2027-08-11','2027-08-10','Honda','SP 125',
 'SP 125 | TS10GH1001',3,'Priya Reddy','2027-08-10','2024-08-11',
 'TS10GH1001','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-11 11:00:00','admin'),

(412,'Secunderabad, Hyderabad, Telangana, India',112,'CHASSIS-112',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+112',
 'ENGINE-112','2027-08-12','2027-08-11','Royal Enfield','Classic 350',
 'CLASSIC 350 | TS10GH1002',3,'Priya Reddy','2027-08-11','2024-08-12',
 'TS10GH1002','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-12 11:00:00','admin'),

(413,'Ameerpet, Hyderabad, Telangana, India',113,'CHASSIS-113',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+113',
 'ENGINE-113','2027-08-13','2027-08-12','TVS','Jupiter',
 'JUPITER | TS09GH1003',2,'Ravi Kumar','2027-08-12','2024-08-13',
 'TS09GH1003','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'SCOOTER','2026-08-13 11:00:00','admin'),

(414,'Rajiv Gandhi International Airport, Hyderabad, Telangana, India',114,'CHASSIS-114',
 'https://dummyimage.com/1200x800/e5e7eb/111827&text=TEST+RC+114',
 'ENGINE-114','2027-08-14','2027-08-13','KTM','Duke 250',
 'DUKE 250 | TS10GH1004',3,'Priya Reddy','2027-08-13','2024-08-14',
 'TS10GH1004','RC verified.','GREEN','CHECK','VERIFIED','VERIFIED',
 'MOTORCYCLE','2026-08-14 11:00:00','admin');

-- ============================================================
-- 8. BOOKINGS
-- Covers every booking status supported by the schema.
-- ============================================================

INSERT INTO bookings
(id,created_at,updated_at,actual_pickup_time,actual_return_time,
 bike_id,status,customer_id,payment_status,pickup_date,qr_code,
 rental_amount,return_date,return_time,start_time)
VALUES
(501,'2026-08-01 09:00:00','2026-08-08 18:00:00',
 '2026-08-05 10:05:00','2026-08-07 09:50:00',
 101,'COMPLETED',4,'SUCCESS','2026-08-05 10:00:00',
 'QR-501',1998.00,'2026-08-07 10:00:00',
 '2026-08-07 09:50:00','2026-08-05 10:05:00'),

(502,'2026-08-10 09:00:00','2026-08-10 09:30:00',
 NULL,NULL,102,'CONFIRMED',5,'SUCCESS','2026-08-20 09:00:00',
 'QR-502',1398.00,'2026-08-22 09:00:00',NULL,NULL),

(503,'2026-08-15 09:00:00','2026-08-16 10:05:00',
 '2026-08-16 10:05:00',NULL,103,'ACTIVE',4,'SUCCESS',
 '2026-08-16 10:00:00','QR-503',1798.00,
 '2026-08-18 10:00:00',NULL,'2026-08-16 10:05:00'),

(504,'2026-08-15 11:00:00','2026-08-15 11:00:00',
 NULL,NULL,104,'PENDING',5,'PENDING',
 '2026-08-25 09:00:00',NULL,1598.00,
 '2026-08-27 09:00:00',NULL,NULL),

(505,'2026-08-15 12:00:00','2026-08-15 12:00:00',
 NULL,NULL,105,'VERIFICATION_REQUIRED',6,'PENDING',
 '2026-08-26 09:00:00',NULL,898.00,
 '2026-08-27 09:00:00',NULL,NULL),

(506,'2026-08-15 13:00:00','2026-08-15 13:00:00',
 NULL,NULL,106,'APPROVED',6,'PENDING',
 '2026-08-28 09:00:00','QR-506',1398.00,
 '2026-08-30 09:00:00',NULL,NULL),

(507,'2026-08-15 14:00:00','2026-08-15 14:00:00',
 NULL,NULL,107,'REJECTED',7,'FAILED',
 '2026-08-29 09:00:00',NULL,958.00,
 '2026-08-31 09:00:00',NULL,NULL),

(508,'2026-08-15 15:00:00','2026-08-15 15:00:00',
 NULL,NULL,109,'CANCELLED',4,'REFUNDED',
 '2026-08-30 09:00:00','QR-508',699.00,
 '2026-08-31 09:00:00',NULL,NULL);

-- ============================================================
-- 9. PAYMENTS
-- Covers SUCCESS, PENDING, FAILED, REFUNDED.
-- ============================================================

INSERT INTO payments
(id,created_at,updated_at,amount,booking_id,payment_date,status)
VALUES
(601,'2026-08-01 09:30:00','2026-08-01 09:30:00',
 1998.00,501,'2026-08-01 09:30:00','SUCCESS'),

(602,'2026-08-10 09:30:00','2026-08-10 09:30:00',
 1398.00,502,'2026-08-10 09:30:00','SUCCESS'),

(603,'2026-08-15 10:00:00','2026-08-15 10:00:00',
 1798.00,503,'2026-08-15 10:00:00','SUCCESS'),

(604,'2026-08-15 11:05:00','2026-08-15 11:05:00',
 1598.00,504,'2026-08-15 11:05:00','PENDING'),

(605,'2026-08-15 12:05:00','2026-08-15 12:05:00',
 898.00,505,'2026-08-15 12:05:00','PENDING'),

(606,'2026-08-15 13:05:00','2026-08-15 13:05:00',
 1398.00,506,'2026-08-15 13:05:00','PENDING'),

(607,'2026-08-15 14:05:00','2026-08-15 14:05:00',
 958.00,507,'2026-08-15 14:05:00','FAILED'),

(608,'2026-08-15 15:05:00','2026-08-15 15:05:00',
 699.00,508,'2026-08-15 15:05:00','REFUNDED');

-- ============================================================
-- 10. REVIEWS
-- Correct 8-column schema.
-- ============================================================

INSERT INTO reviews
(review_id,bike_id,booking_id,created_at,customer_id,rating,
 review_date,review_message)
VALUES
(701,101,501,'2026-08-07 11:00:00',4,5,
 '2026-08-07','Excellent bike, clean and comfortable.'),

(702,102,502,'2026-08-22 12:00:00',5,4,
 '2026-08-22','Good scooter and easy pickup.'),

(703,103,503,'2026-08-18 12:00:00',4,5,
 '2026-08-18','Excellent performance and condition.');

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================

INSERT INTO notifications
(notification_id,created_at,is_read,message,notification_type,title,user_id)
VALUES
(801,'2026-08-01 09:31:00',1,
 'Payment for booking #501 was successful.',
 'PAYMENT_SUCCESS','Payment Successful',4),

(802,'2026-08-10 09:31:00',1,
 'Booking #502 has been confirmed.',
 'BOOKING_CONFIRMED','Booking Confirmed',5),

(803,'2026-08-16 10:06:00',0,
 'Your ride for booking #503 is active.',
 'RIDE_STARTED','Ride Started',4),

(804,'2026-08-15 11:01:00',0,
 'Booking #504 is waiting for approval.',
 'BOOKING_REQUEST','Booking Request Pending',5),

(805,'2026-08-15 12:01:00',0,
 'Complete verification before booking.',
 'VERIFICATION_REQUIRED','Verification Required',6),

(806,'2026-08-15 13:01:00',0,
 'Booking #506 has been approved.',
 'BOOKING_APPROVED','Booking Approved',6),

(807,'2026-08-15 14:01:00',1,
 'Booking #507 was rejected.',
 'BOOKING_REJECTED','Booking Rejected',7),

(808,'2026-08-15 15:06:00',0,
 'Refund for booking #508 was initiated.',
 'PAYMENT_REFUNDED','Refund Initiated',4),

(809,'2026-08-01 11:01:00',1,
 'RC for Classic 350 was verified.',
 'BIKE_DOCUMENT_VERIFIED','Bike RC Verified',2),

(810,'2026-08-08 11:01:00',0,
 'Bike #108 requires RC verification.',
 'BIKE_DOCUMENT_PENDING','RC Verification Pending',3);

-- ============================================================
-- 12. OTP VERIFICATIONS
-- ============================================================

INSERT INTO otp_verifications
(id,created_at,updated_at,expiry_time,otp,purpose,verified,user_id)
VALUES
(901,'2026-08-15 09:00:00','2026-08-15 09:01:00',
 '2026-08-15 09:05:00','482913','EMAIL_VERIFICATION',1,4),

(902,'2026-08-15 10:00:00','2026-08-15 10:00:00',
 '2026-08-15 10:05:00','731624','PHONE_VERIFICATION',0,5),

(903,'2026-08-14 08:00:00','2026-08-14 08:00:00',
 '2026-08-14 08:05:00','165802','FORGOT_PASSWORD',0,6),

(904,'2026-08-16 09:00:00','2026-08-16 09:00:00',
 '2026-08-16 09:05:00','905417','EMAIL_VERIFICATION',1,7);

-- ============================================================
-- 13. REFRESH TOKENS
-- ============================================================

INSERT INTO refresh_tokens
(id,created_at,expiry_date,revoked,token,user_id)
VALUES
(1001,'2026-08-15 08:00:00','2026-09-15 08:00:00',
 0,'TEST_REFRESH_ADMIN_1001',1),

(1002,'2026-08-15 08:10:00','2026-09-15 08:10:00',
 0,'TEST_REFRESH_RAVI_1002',2),

(1003,'2026-08-15 08:20:00','2026-09-15 08:20:00',
 0,'TEST_REFRESH_PRIYA_1003',3),

(1004,'2026-08-15 08:30:00','2026-09-15 08:30:00',
 1,'TEST_REFRESH_REVOKED_1004',4),

(1005,'2026-07-01 08:30:00','2026-08-01 08:30:00',
 0,'TEST_REFRESH_EXPIRED_1005',5);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 14. VALIDATION
-- ============================================================

SELECT 'users' AS table_name, COUNT(*) AS rows_count FROM users
UNION ALL SELECT 'owners', COUNT(*) FROM owners
UNION ALL SELECT 'bikes', COUNT(*) FROM bikes
UNION ALL SELECT 'bike_images', COUNT(*) FROM bike_images
UNION ALL SELECT 'aadhaar_verification', COUNT(*) FROM aadhaar_verification
UNION ALL SELECT 'driving_license_verification', COUNT(*) FROM driving_license_verification
UNION ALL SELECT 'bike_document_verification', COUNT(*) FROM bike_document_verification
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'otp_verifications', COUNT(*) FROM otp_verifications
UNION ALL SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;

SELECT bike_id,bike_name,brand,model,bike_status,
       rc_verified,rental_price,rental_type,location,
       latitude,longitude,image_url
FROM bikes
ORDER BY bike_id;

SELECT bike_id,registration_number,status
FROM bike_document_verification
ORDER BY bike_id;

SELECT status,COUNT(*) AS total
FROM bookings
GROUP BY status
ORDER BY status;

SELECT status,COUNT(*) AS total
FROM payments
GROUP BY status
ORDER BY status;

-- ============================================================
-- EXPECTED COUNTS
-- users                        7
-- owners                       2
-- bikes                       14
-- bike_images                 19
-- aadhaar_verification         6
-- driving_license_verification 4
-- bike_document_verification 14
-- bookings                     8
-- payments                     8
-- reviews                      3
-- notifications               10
-- otp_verifications            4
-- refresh_tokens               5
-- ============================================================
-- END
-- ============================================================
