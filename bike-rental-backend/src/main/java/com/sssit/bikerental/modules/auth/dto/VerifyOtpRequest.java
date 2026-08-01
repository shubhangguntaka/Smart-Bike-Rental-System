package com.sssit.bikerental.modules.auth.dto;

import com.sssit.bikerental.common.enums.OtpPurpose;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(
        regexp = "^\\d{6}$",
        message = "OTP must be exactly 6 digits"
    )
    private String otp;

    @NotNull(message = "OTP purpose is required")
    private OtpPurpose purpose;

}