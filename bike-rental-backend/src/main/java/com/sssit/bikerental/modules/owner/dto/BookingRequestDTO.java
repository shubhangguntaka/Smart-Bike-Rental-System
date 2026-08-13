package com.sssit.bikerental.modules.owner.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {
    private Long bookingId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String bikeName;
    private String pickupDate;
    private String returnDate;
    private BigDecimal rentalAmount;
    private String bookingStatus;
    private String updatedAt;
    private String createdAt;
}
