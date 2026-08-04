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

    private String token;

    private String accessToken;

    private String refreshToken;

    private String tokenType;

    private Long userId;

    private String name;

    private String email;

    private Role role;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private Boolean emailVerified;

}