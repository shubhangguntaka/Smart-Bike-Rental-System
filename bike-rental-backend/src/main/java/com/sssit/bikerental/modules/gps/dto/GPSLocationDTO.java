package com.sssit.bikerental.modules.gps.dto;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GPSLocationDTO {

    private Long rideId;

    @NotNull(message = "Latitude is required")
    @DecimalMin(
            value = "-90.0",
            message = "Latitude must be between -90 and 90"
    )
    @DecimalMax(
            value = "90.0",
            message = "Latitude must be between -90 and 90"
    )
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(
            value = "-180.0",
            message = "Longitude must be between -180 and 180"
    )
    @DecimalMax(
            value = "180.0",
            message = "Longitude must be between -180 and 180"
    )
    private Double longitude;

    @JsonDeserialize(using = FlexibleTimestampDeserializer.class)
    private LocalDateTime timestamp;

    @PositiveOrZero(message = "Accuracy cannot be negative")
    private Double accuracy;

    public static class FlexibleTimestampDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String text = p.getText();
            if (text == null || text.trim().isEmpty()) {
                return LocalDateTime.now();
            }
            try {
                // Try ISO_ZONED_DATE_TIME (e.g. 2026-08-22T14:26:00.000Z or +05:30)
                return ZonedDateTime.parse(text).withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
            } catch (Exception e1) {
                try {
                    // Try ISO_DATE_TIME / Instant
                    return LocalDateTime.ofInstant(Instant.parse(text), ZoneId.systemDefault());
                } catch (Exception e2) {
                    try {
                        // Try ISO_LOCAL_DATE_TIME (e.g. 2026-08-22T14:26:00)
                        return LocalDateTime.parse(text, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    } catch (Exception e3) {
                        try {
                            // Try epoch millis
                            long epoch = Long.parseLong(text);
                            return LocalDateTime.ofInstant(Instant.ofEpochMilli(epoch), ZoneId.systemDefault());
                        } catch (Exception e4) {
                            return LocalDateTime.now();
                        }
                    }
                }
            }
        }
    }
}