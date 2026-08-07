package com.sssit.bikerental.modules.notification.entity;

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

public class NotificationDTO {
	

    private Long notificationId;

    private Long userId;

    private String title;

    private String message;

    private String notificationType;

    private Boolean isRead;
}