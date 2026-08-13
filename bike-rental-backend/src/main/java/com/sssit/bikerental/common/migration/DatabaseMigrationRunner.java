package com.sssit.bikerental.common.migration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if database schema migration is needed for bookings table...");
        try {
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN pickup_date DATETIME NULL");
        } catch (Exception e) {
            log.debug("Could not alter pickup_date column: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN return_date DATETIME NULL");
        } catch (Exception e) {
            log.debug("Could not alter return_date column: {}", e.getMessage());
        }
        try {
            jdbcTemplate.update(
                "UPDATE bookings SET start_time = pickup_date WHERE start_time IS NULL AND pickup_date IS NOT NULL"
            );
            jdbcTemplate.update(
                "UPDATE bookings SET return_time = return_date WHERE return_time IS NULL AND return_date IS NOT NULL"
            );
            jdbcTemplate.update(
                "UPDATE bookings SET pickup_date = start_time WHERE pickup_date IS NULL AND start_time IS NOT NULL"
            );
            jdbcTemplate.update(
                "UPDATE bookings SET return_date = return_time WHERE return_date IS NULL AND return_time IS NOT NULL"
            );
            log.info("Database migration completed successfully.");
        } catch (Exception e) {
            log.debug("Database migration skipped: {}", e.getMessage());
        }

        String[] legacyCols = {"name", "price_per_hour", "price", "type", "category", "status", "rate"};
        for (String col : legacyCols) {
            try {
                jdbcTemplate.execute("ALTER TABLE bikes MODIFY COLUMN " + col + " VARCHAR(255) NULL");
            } catch (Exception ignored) {}
        }

        try {
            Long ownerId = 1L;
            try {
                Long foundOwnerId = jdbcTemplate.queryForObject(
                    "SELECT id FROM users WHERE email = 'daramkalyan2004@gmail.com' LIMIT 1", Long.class);
                if (foundOwnerId != null) {
                    ownerId = foundOwnerId;
                }
            } catch (Exception ignored) {}

            jdbcTemplate.update(
                "INSERT IGNORE INTO bikes (owner_id, name, bike_name, brand, model, registration_number, rc_number, fuel_type, location, rental_price, hourly_rate, price_per_hour, bike_status, rc_verified, image_url, available_start_time, available_end_time, created_at, updated_at) " +
                "VALUES (?, 'Yamaha R15 V4', 'Yamaha R15 V4', 'Yamaha', 'R15 V4', 'TS09AB9999', 'TS09AB9999', 'PETROL', 'Hyderabad', 496.00, 62.00, 62.00, 'AVAILABLE', 1, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', '09:00:00', '21:00:00', NOW(), NOW())", ownerId
            );

            jdbcTemplate.update(
                "INSERT IGNORE INTO bikes (owner_id, name, bike_name, brand, model, registration_number, rc_number, fuel_type, location, rental_price, hourly_rate, price_per_hour, bike_status, rc_verified, image_url, available_start_time, available_end_time, created_at, updated_at) " +
                "VALUES (?, 'TVS', 'TVS', 'TVS', 'Radeon', 'TS09FK1234', 'TS09FK1234', 'PETROL', 'Hyderabad', 480.00, 60.00, 60.00, 'AVAILABLE', 1, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', '09:00:00', '21:00:00', NOW(), NOW())", ownerId
            );

            jdbcTemplate.update(
                "INSERT INTO bikes (owner_id, name, bike_name, brand, model, registration_number, rc_number, fuel_type, location, rental_price, hourly_rate, price_per_hour, bike_status, rc_verified, image_url, available_start_time, available_end_time, created_at, updated_at) " +
                "VALUES (?, 'KTM Duke 390', 'KTM Duke 390', 'KTM', 'Duke 390', 'TS02EY4494', 'TS02EY4494', 'PETROL', 'Hyderabad', 608.00, 76.00, 76.00, 'AVAILABLE', 1, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', '09:00:00', '21:00:00', NOW(), NOW()) " +
                "ON DUPLICATE KEY UPDATE name = 'KTM Duke 390', bike_name = 'KTM Duke 390', hourly_rate = 76.00, price_per_hour = 76.00, rental_price = 608.00, available_start_time = '09:00:00', available_end_time = '21:00:00'", ownerId
            );
            log.info("Owner fleet seed migration completed successfully.");
        } catch (Exception e) {
            log.error("Fleet seed migration error: {}", e.getMessage(), e);
        }
    }
}
