package com.sssit.bikerental.modules.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.modules.payment.entity.BankAccount;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByUserId(Long userId);

    Optional<BankAccount> findByUserIdAndIsPrimaryTrue(Long userId);

    List<BankAccount> findByUserRole(Role userRole);

    Optional<BankAccount> findFirstByUserRoleAndIsPrimaryTrue(Role userRole);
}
