package com.sssit.bikerental.modules.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.modules.auth.entity.OtpVerification;
import com.sssit.bikerental.modules.user.User;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

	/**
	 * Get latest OTP for a user and purpose.
	 */
	Optional<OtpVerification> findTopByUserAndPurposeOrderByCreatedAtDesc(User user, OtpPurpose purpose);

	/**
	 * Find OTP by user, OTP value and purpose.
	 */
	Optional<OtpVerification> findByUserAndOtpAndPurpose(User user, String otp, OtpPurpose purpose);

	/**
	 * Delete all OTPs of a user for a specific purpose.
	 */
	void deleteByUserAndPurpose(User user, OtpPurpose purpose);

	/**
	 * Delete all OTPs belonging to a user.
	 */
	void deleteByUser(User user);
}