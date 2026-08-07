package com.sssit.bikerental.modules.notification.entity;

import java.util.List;

public interface NotificationService {

    Notification sendNotification(Notification notification);

    List<Notification> getAllNotifications();

    Notification getNotificationById(Long notificationId);

    List<Notification> getNotificationsByUser(Long userId);

    List<Notification> getUnreadNotifications(Long userId);

    Notification markAsRead(Long notificationId);

    void deleteNotification(Long notificationId);
    
    Long getUnreadCount(Long userId);
    Notification bookingConfirmed(Long userId);

    Notification bookingCancelled(Long userId);

    Notification paymentSuccessful(Long userId);

    Notification rideCompleted(Long userId);

    Notification verificationSuccessful(Long userId);

    Notification bikeRcApproved(Long ownerId);

    Notification bikeRcRejected(Long ownerId);
}