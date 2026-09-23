package com.sssit.bikerental.modules.auth.dto;

import com.sssit.bikerental.common.enums.OtpPurpose;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendOtpRequest {

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;

    private OtpPurpose purpose;

}
