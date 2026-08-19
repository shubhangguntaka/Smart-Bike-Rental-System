package com.sssit.bikerental.modules.verification.admin.dto;

public class ReviewDecisionRequest {

    private String reason;
    private String reviewer;

    public ReviewDecisionRequest() {
    }

    public ReviewDecisionRequest(String reason, String reviewer) {
        this.reason = reason;
        this.reviewer = reviewer;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getReviewer() {
        return reviewer;
    }

    public void setReviewer(String reviewer) {
        this.reviewer = reviewer;
    }
}
