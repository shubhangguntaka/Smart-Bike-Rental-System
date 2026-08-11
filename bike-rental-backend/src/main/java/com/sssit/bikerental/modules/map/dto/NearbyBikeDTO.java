package com.sssit.bikerental.modules.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyBikeDTO {

    private Long bikeId;

    private String bikeName;

    private String brand;

    private Double rentalPrice;

    private Double latitude;

    private Double longitude;

    private Double distance;

    private String imageUrl;

    private Boolean available;
}