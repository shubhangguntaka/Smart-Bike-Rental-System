package com.sssit.bikerental.modules.bike.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;

@Repository
public interface BikeRepository extends JpaRepository<Bike, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bike b WHERE b.bikeId = :bikeId")
    Optional<Bike> findByIdForUpdate(@Param("bikeId") Long bikeId);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndBikeStatus(Long ownerId, BikeStatus bikeStatus);

    default long countByOwnerIdAndStatus(Long ownerId, String status) {
        try {
            BikeStatus bs = BikeStatus.valueOf(status.toUpperCase());
            return countByOwnerIdAndBikeStatus(ownerId, bs);
        } catch (Exception e) {
            return 0L;
        }
    }

    List<Bike> findByOwnerId(Long ownerId);

    List<Bike> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Bike> findByRegistrationNumber(String registrationNumber);

    Optional<Bike> findByRcNumber(String rcNumber);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByRcNumber(String rcNumber);

    boolean existsByRegistrationNumberAndBikeIdNot(String registrationNumber, Long bikeId);

    boolean existsByRcNumberAndBikeIdNot(String rcNumber, Long bikeId);

    List<Bike> findByBikeStatus(BikeStatus bikeStatus);

    List<Bike> findByLocationIgnoreCase(String location);

    List<Bike> findByBrandIgnoreCase(String brand);

    @Query("""
            SELECT b FROM Bike b
            WHERE (:location IS NULL OR :location = '' OR LOWER(b.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:brand IS NULL OR :brand = '' OR LOWER(b.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
              AND (:category IS NULL OR :category = '' OR LOWER(b.fuelType) LIKE LOWER(CONCAT('%', :category, '%')) OR LOWER(b.brand) LIKE LOWER(CONCAT('%', :category, '%')) OR LOWER(b.model) LIKE LOWER(CONCAT('%', :category, '%')))
              AND (:status IS NULL OR b.bikeStatus = :status)
              AND (:minPrice IS NULL OR (b.hourlyRate IS NOT NULL AND b.hourlyRate >= :minPrice) OR (b.rentalPrice IS NOT NULL AND b.rentalPrice >= :minPrice))
              AND (:maxPrice IS NULL OR (b.hourlyRate IS NOT NULL AND b.hourlyRate <= :maxPrice) OR (b.rentalPrice IS NOT NULL AND b.rentalPrice <= :maxPrice))
            ORDER BY b.createdAt DESC
            """)
    List<Bike> search(
            @Param("location") String location,
            @Param("brand") String brand,
            @Param("category") String category,
            @Param("status") BikeStatus status,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice);
}
