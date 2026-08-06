package com.sssit.bikerental.modules.bike.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.enums.RentalType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "bikes",
        indexes = {
                @Index(name = "idx_bikes_owner_id", columnList = "owner_id"),
                @Index(name = "idx_bikes_status", columnList = "bike_status"),
                @Index(name = "idx_bikes_location", columnList = "location")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bikeId;

    /** Owning user id (FK logical link to users.id) */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 120)
    private String bikeName;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(nullable = false, length = 80)
    private String model;

    @Column(nullable = false, unique = true, length = 32)
    private String registrationNumber;

    @Column(nullable = false, length = 40)
    private String fuelType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rentalPrice;

    @Column(nullable = false, length = 120)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "bike_status", nullable = false, length = 32)
    private BikeStatus bikeStatus;

    @Column(nullable = false, unique = true, length = 32)
    private String rcNumber;

    @Column(nullable = false)
    private Boolean rcVerified;

    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "bike_images", joinColumns = @JoinColumn(name = "bike_id"))
    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    @Builder.Default
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @Column(length = 1000)
    private String description;

    @Column(length = 40)
    private String engineCapacity;

    @Column(length = 40)
    private String mileage;

    @Column(length = 40)
    private String transmission;

    private Integer seatingCapacity;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "rental_type", length = 20)
    private RentalType rentalType;

    @Column(precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    private LocalTime availableStartTime;

    private LocalTime availableEndTime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (bikeStatus == null) {
            bikeStatus = BikeStatus.AVAILABLE;
        }
        if (rcVerified == null) {
            rcVerified = false;
        }
        normalizeIdentityFields();
    }

    @PreUpdate
    public void onUpdate() {
        LocalDateTime now = LocalDateTime.now();
        updatedAt = now;
        if (createdAt == null) {
            createdAt = now;
        }
        normalizeIdentityFields();
    }

    private void normalizeIdentityFields() {
        if (registrationNumber != null) {
            registrationNumber = registrationNumber.replaceAll("\\s+", "").toUpperCase();
        }
        if (rcNumber != null) {
            rcNumber = rcNumber.replaceAll("\\s+", "").toUpperCase();
        }
    }
}
