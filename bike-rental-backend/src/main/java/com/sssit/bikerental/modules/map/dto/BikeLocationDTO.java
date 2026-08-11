package com.sssit.bikerental.modules.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BikeLocationDTO {

    private Long bikeId;

    private Double latitude;

    private Double longitude;
}
