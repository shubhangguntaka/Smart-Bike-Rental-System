package com.sssit.bikerental.modules.verification.admin.repository;

import com.sssit.bikerental.modules.verification.admin.entity.DocumentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DocumentReviewRepository extends JpaRepository<DocumentReview, Long> {

    Optional<DocumentReview> findByDocumentTypeAndDocumentId(String documentType, Long documentId);

    List<DocumentReview> findByAdminStatus(String adminStatus);

    List<DocumentReview> findByUserId(Long userId);
}
