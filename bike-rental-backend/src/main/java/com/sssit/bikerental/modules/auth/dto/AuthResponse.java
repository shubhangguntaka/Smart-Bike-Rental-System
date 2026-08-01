package com.sssit.bikerental.modules.auth.dto;

import com.sssit.bikerental.common.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private Role role;

    private String token;

    private String tokenType;

    private Boolean emailVerified;

}