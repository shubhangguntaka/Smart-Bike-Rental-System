package com.sssit.bikerental.modules.user.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String role;

    private Boolean enabled;

    private String profileImage;

}