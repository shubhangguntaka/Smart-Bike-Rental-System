package com.sssit.bikerental.modules.verification.admin.dto;

import java.time.LocalDateTime;

public class VerificationHistoryDTO {

    private Long id;
    private Long documentReviewId;
    private String action;
    private String reason;
    private String performedBy;
    private LocalDateTime performedAt;

    public VerificationHistoryDTO() {
    }

    public VerificationHistoryDTO(Long id, Long documentReviewId, String action, String reason, String performedBy, LocalDateTime performedAt) {
        this.id = id;
        this.documentReviewId = documentReviewId;
        this.action = action;
        this.reason = reason;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentReviewId() {
        return documentReviewId;
    }

    public void setDocumentReviewId(Long documentReviewId) {
        this.documentReviewId = documentReviewId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }
}
