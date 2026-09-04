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
            jdbcTemplate.execute("ALTER TABLE rides MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'");
            log.info("Rides table status column migration completed successfully.");
        } catch (Exception e) {
            log.debug("Could not alter rides status column: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED'");
            log.info("Payments table payment_status column migration completed successfully.");
        } catch (Exception e) {
            log.debug("Could not alter payments payment_status column: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN amount DECIMAL(12,2) NULL DEFAULT NULL");
            log.info("Payments table amount column migration completed successfully.");
        } catch (Exception e) {
            log.debug("Could not alter payments amount column: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN payment_date DATETIME NULL DEFAULT NULL");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) NULL DEFAULT NULL");
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN payment_status VARCHAR(50) NULL DEFAULT 'NOT_STARTED'");
            log.info("Bookings table payment_status column migration completed successfully.");
        } catch (Exception e) {
            log.debug("Could not alter bookings payment_status column: {}", e.getMessage());
        }
    }
}
