package com.sssit.bikerental.modules.notification.entity;

import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    // Entity -> DTO
    public NotificationDTO toDTO(Notification notification) {

        if (notification == null) {
            return null;
        }

        NotificationDTO dto = new NotificationDTO();

        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUserId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setNotificationType(notification.getNotificationType());
        dto.setIsRead(notification.getIsRead());

        return dto;
    }

    // DTO -> Entity
    public Notification toEntity(NotificationDTO dto) {

        if (dto == null) {
            return null;
        }

        Notification notification = new Notification();

        notification.setNotificationId(dto.getNotificationId());
        notification.setUserId(dto.getUserId());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setNotificationType(dto.getNotificationType());
        notification.setIsRead(dto.getIsRead());

        return notification;
    }
}
