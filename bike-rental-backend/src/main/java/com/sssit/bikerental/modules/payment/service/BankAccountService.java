package com.sssit.bikerental.modules.payment.service;

import com.sssit.bikerental.modules.payment.dto.BankAccountDTO;
import com.sssit.bikerental.modules.payment.entity.BankAccount;

public interface BankAccountService {

    BankAccountDTO getBankAccountByUserId(Long userId);

    BankAccountDTO saveOrUpdateBankAccount(Long userId, BankAccountDTO dto);

    BankAccountDTO getAdminBankAccount();

    BankAccountDTO saveOrUpdateAdminBankAccount(Long adminId, BankAccountDTO dto);

    BankAccount getOrCreateDefaultOwnerBankAccount(Long ownerId);

    BankAccount getOrCreateDefaultAdminBankAccount();
}
