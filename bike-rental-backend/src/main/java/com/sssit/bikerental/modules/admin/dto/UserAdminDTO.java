package com.sssit.bikerental.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDTO {

    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private Boolean enabled;
    private String status;
    private String profileImage;
}