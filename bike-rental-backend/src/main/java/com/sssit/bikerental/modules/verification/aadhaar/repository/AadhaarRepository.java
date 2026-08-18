package com.sssit.bikerental.modules.verification.aadhaar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;

@Repository
public interface AadhaarRepository extends JpaRepository<AadhaarVerification, Long> {

    Optional<AadhaarVerification> findByAadhaarNumber(String aadhaarNumber);

    boolean existsByAadhaarNumber(String aadhaarNumber);

    Optional<AadhaarVerification> findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(
            Long customerId, String status);

    Optional<AadhaarVerification> findFirstByCustomerIdAndStatusAndVerifiedForUserTrueOrderByVerifiedAtDesc(
            Long customerId, String status);

    Optional<AadhaarVerification> findFirstByCustomerIdAndStatusAndVerifiedForBikeOwnerTrueOrderByVerifiedAtDesc(
            Long customerId, String status);

    List<AadhaarVerification> findByStatus(String status);
}