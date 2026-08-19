package com.sssit.bikerental.modules.verification.admin.repository;

import com.sssit.bikerental.modules.verification.admin.entity.VerificationAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationAuditRepository extends JpaRepository<VerificationAudit, Long> {

    List<VerificationAudit> findByDocumentReviewIdOrderByPerformedAtDesc(Long documentReviewId);
}
