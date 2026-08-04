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

    // Used for the customerId-free DL<->Aadhaar name match: pull every
    // APPROVED Aadhaar so the Driving License name can be checked
    // against all of them, without needing a customerId to narrow the
    // lookup down to one specific record first.
    List<AadhaarVerification> findByStatus(String status);

}