package com.sssit.bikerental.modules.admin.repository;

import com.sssit.bikerental.modules.admin.entity.AdminActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityRepository extends JpaRepository<AdminActivity, Long> {

    List<AdminActivity> findAllByOrderByTimestampDesc();
}
