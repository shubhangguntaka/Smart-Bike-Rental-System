package com.sssit.bikerental.modules.payment.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.modules.payment.dto.BankAccountDTO;
import com.sssit.bikerental.modules.payment.entity.BankAccount;
import com.sssit.bikerental.modules.payment.repository.BankAccountRepository;
import com.sssit.bikerental.modules.payment.service.BankAccountService;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    @Override
    public BankAccountDTO getBankAccountByUserId(Long userId) {
        BankAccount account = bankAccountRepository.findByUserId(userId)
                .orElseGet(() -> getOrCreateDefaultOwnerBankAccount(userId));
        return toDTO(account);
    }

    @Override
    @Transactional
    public BankAccountDTO saveOrUpdateBankAccount(Long userId, BankAccountDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        BankAccount account = bankAccountRepository.findByUserId(userId)
                .orElse(null);

        if (account == null) {
            account = BankAccount.builder()
                    .userId(userId)
                    .userRole(user.getRole() != null ? user.getRole() : Role.OWNER)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        account.setBankName(dto.getBankName() != null ? dto.getBankName().trim() : "HDFC Bank Ltd");
        account.setAccountHolderName(dto.getAccountHolderName() != null && !dto.getAccountHolderName().trim().isEmpty() 
                ? dto.getAccountHolderName().trim() 
                : user.getFullName());
        account.setAccountNumber(dto.getAccountNumber() != null ? dto.getAccountNumber().trim() : "");
        account.setIfscCode(dto.getIfscCode() != null ? dto.getIfscCode().trim().toUpperCase() : "");
        account.setUpiId(dto.getUpiId() != null ? dto.getUpiId().trim() : "");
        account.setBranchName(dto.getBranchName() != null ? dto.getBranchName().trim() : "");
        if (dto.getPayoutFrequency() != null) {
            account.setPayoutFrequency(dto.getPayoutFrequency().toLowerCase());
        }
        if (dto.getMinPayoutThreshold() != null) {
            account.setMinPayoutThreshold(dto.getMinPayoutThreshold());
        }
        account.setIsPrimary(true);
        account.setIsVerified(true);
        account.setUpdatedAt(LocalDateTime.now());

        BankAccount saved = bankAccountRepository.save(account);
        log.info("Saved banking details for userId: {}, bank: {}", userId, saved.getBankName());
        return toDTO(saved);
    }

    @Override
    public BankAccountDTO getAdminBankAccount() {
        BankAccount account = getOrCreateDefaultAdminBankAccount();
        return toDTO(account);
    }

    @Override
    @Transactional
    public BankAccountDTO saveOrUpdateAdminBankAccount(Long adminId, BankAccountDTO dto) {
        return saveOrUpdateBankAccount(adminId, dto);
    }

    @Override
    @Transactional
    public BankAccount getOrCreateDefaultOwnerBankAccount(Long ownerId) {
        return bankAccountRepository.findByUserId(ownerId)
                .orElseGet(() -> {
                    User user = userRepository.findById(ownerId).orElse(null);
                    String holderName = user != null ? user.getFullName() : "Owner Partner";

                    BankAccount defaultAccount = BankAccount.builder()
                            .userId(ownerId)
                            .userRole(Role.OWNER)
                            .bankName("HDFC Bank Ltd")
                            .accountHolderName(holderName)
                            .accountNumber("50100492817291")
                            .ifscCode("HDFC0001234")
                            .upiId(user != null && user.getEmail() != null ? user.getEmail().split("@")[0] + "@okhdfcbank" : "owner@okhdfcbank")
                            .payoutFrequency("instant")
                            .minPayoutThreshold(500.0)
                            .isPrimary(true)
                            .isVerified(true)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return bankAccountRepository.save(defaultAccount);
                });
    }

    @Override
    @Transactional
    public BankAccount getOrCreateDefaultAdminBankAccount() {
        return bankAccountRepository.findFirstByUserRoleAndIsPrimaryTrue(Role.ADMIN)
                .orElseGet(() -> {
                    User adminUser = userRepository.findByRole(Role.ADMIN).stream().findFirst().orElse(null);
                    Long adminId = adminUser != null ? adminUser.getId() : 1L;
                    String holderName = adminUser != null ? adminUser.getFullName() : "SmartBike Platform Admin";

                    BankAccount defaultAccount = BankAccount.builder()
                            .userId(adminId)
                            .userRole(Role.ADMIN)
                            .bankName("ICICI Bank Ltd")
                            .accountHolderName(holderName)
                            .accountNumber("000405012345")
                            .ifscCode("ICIC0000004")
                            .upiId("smartbike.platform@icici")
                            .payoutFrequency("daily")
                            .minPayoutThreshold(100.0)
                            .isPrimary(true)
                            .isVerified(true)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return bankAccountRepository.save(defaultAccount);
                });
    }

    private BankAccountDTO toDTO(BankAccount account) {
        if (account == null) {
            return null;
        }
        return BankAccountDTO.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .userRole(account.getUserRole() != null ? account.getUserRole().name() : "OWNER")
                .bankName(account.getBankName())
                .accountHolderName(account.getAccountHolderName())
                .accountNumber(account.getAccountNumber())
                .maskedAccountNumber(BankAccountDTO.maskAccount(account.getAccountNumber()))
                .ifscCode(account.getIfscCode())
                .upiId(account.getUpiId())
                .branchName(account.getBranchName())
                .payoutFrequency(account.getPayoutFrequency())
                .minPayoutThreshold(account.getMinPayoutThreshold())
                .isPrimary(account.getIsPrimary())
                .isVerified(account.getIsVerified())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
