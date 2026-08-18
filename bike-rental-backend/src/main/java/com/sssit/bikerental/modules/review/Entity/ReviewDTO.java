package com.sssit.bikerental.modules.review.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReviewDTO {

    private Long reviewId;

    private Long bookingId;

    private Long bikeId;

    private Long customerId;

    private Integer rating;

    private String reviewMessage;
}