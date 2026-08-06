package com.sssit.bikerental.modules.bike.repository;

import com.sssit.bikerental.modules.bike.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BikeRepository extends JpaRepository<Bike, Long> {
    long countByOwnerId(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, String status);
}
