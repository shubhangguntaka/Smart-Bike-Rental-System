package com.sssit.bikerental.modules.payment.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountDTO {

    private Long id;
    private Long userId;
    private String userRole;
    private String bankName;
    private String accountHolderName;
    private String accountNumber;
    private String maskedAccountNumber;
    private String ifscCode;
    private String upiId;
    private String branchName;
    private String payoutFrequency;
    private Double minPayoutThreshold;
    private Boolean isPrimary;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static String maskAccount(String accNum) {
        if (accNum == null || accNum.length() <= 4) {
            return accNum != null ? accNum : "";
        }
        return "•••• •••• " + accNum.substring(accNum.length() - 4);
    }
}
