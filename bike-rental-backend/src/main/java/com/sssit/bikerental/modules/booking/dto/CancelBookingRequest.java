package com.sssit.bikerental.modules.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {

    @NotBlank(message = "Cancellation reason is required")
    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    private String reason;
}
