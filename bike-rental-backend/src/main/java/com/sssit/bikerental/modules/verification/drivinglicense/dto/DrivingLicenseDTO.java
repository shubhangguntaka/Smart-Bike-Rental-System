package com.sssit.bikerental.modules.verification.drivinglicense.dto;

import org.springframework.web.multipart.MultipartFile;

public class DrivingLicenseDTO {

    private MultipartFile file;

    public DrivingLicenseDTO() {
    }

    public DrivingLicenseDTO(MultipartFile file) {
        this.file = file;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}