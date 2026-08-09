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
            // Check if pickup_date exists by trying to query it, then copy values to start_time and return_time
            jdbcTemplate.update(
                "UPDATE bookings SET start_time = pickup_date WHERE start_time IS NULL AND pickup_date IS NOT NULL"
            );
            jdbcTemplate.update(
                "UPDATE bookings SET return_time = return_date WHERE return_time IS NULL AND return_date IS NOT NULL"
            );
            log.info("Database migration completed successfully.");
        } catch (Exception e) {
            log.debug("Database migration skipped or columns not present yet: {}", e.getMessage());
        }
    }
}
