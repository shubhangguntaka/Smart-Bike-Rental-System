package com.sssit.bikerental.modules.verification.bikedocument.dto;

import org.springframework.web.multipart.MultipartFile;

public class BikeDocumentDTO {

    private MultipartFile file;

    public BikeDocumentDTO() {
    }

    public BikeDocumentDTO(MultipartFile file) {
        this.file = file;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}
