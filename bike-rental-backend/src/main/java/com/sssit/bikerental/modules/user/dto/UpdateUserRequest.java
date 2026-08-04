package com.sssit.bikerental.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String phoneNumber;

    private Boolean enabled;

}