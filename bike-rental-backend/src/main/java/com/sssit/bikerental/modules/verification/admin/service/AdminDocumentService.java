package com.sssit.bikerental.modules.verification.admin.service;

import com.sssit.bikerental.modules.verification.admin.dto.*;
import org.springframework.http.MediaType;

import java.util.List;

public interface AdminDocumentService {

    List<AdminVerificationDTO> getAllVerifications(String roleFilter, String documentTypeFilter, String statusFilter, String search);

    AdminVerificationDTO getVerificationById(Long id);

    AdminVerificationDTO approveVerification(Long id, ReviewDecisionRequest request, String reviewerName);

    AdminVerificationDTO rejectVerification(Long id, ReviewDecisionRequest request, String reviewerName);

    AdminVerificationDTO requestReupload(Long id, ReviewDecisionRequest request, String reviewerName);

    List<VerificationHistoryDTO> getVerificationHistory(Long id);

    void sendEmail(Long id, AdminEmailRequest request, String senderName);

    byte[] getDocumentImage(Long id);

    MediaType getDocumentImageContentType(Long id);
}
