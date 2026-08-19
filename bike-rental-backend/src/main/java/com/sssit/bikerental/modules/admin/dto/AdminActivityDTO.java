package com.sssit.bikerental.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityDTO {

    private Long id;
    private String action;
    private String performedBy;
    private LocalDateTime timestamp;
    private String details;
    private String status;
    private String targetType;
    private Long targetId;
}
