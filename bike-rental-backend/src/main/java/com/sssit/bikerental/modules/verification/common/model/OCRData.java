package com.sssit.bikerental.modules.verification.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OCRData {

    private String aadhaarNumber;

    private String name;

    private String dob;

    private String gender;

    private String address;

    private String rawText;

}