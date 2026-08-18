package com.sssit.bikerental.modules.notification.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sssit.bikerental.exception.NotificationNotFoundException;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Create Notification
    @Override
    public Notification sendNotification(Notification notification) {

        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    // Get All Notifications
    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get Notification By Id
    @Override
    public Notification getNotificationById(Long notificationId) {

        return notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                       new NotificationNotFoundException(
        "Notification not found with id: " + notificationId));
    }

    // Get Notifications By User (Latest -> Oldest)
    @Override
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get Unread Notifications (Latest -> Oldest)
    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Mark Notification As Read
    @Override
    public Notification markAsRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                       new NotificationNotFoundException(
        "Notification not found with id: " + notificationId));

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    // Delete Notification
    @Override
    public void deleteNotification(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                       new NotificationNotFoundException(
        "Notification not found with id: " + notificationId));

        notificationRepository.delete(notification);
    }
    @Override
    public Long getUnreadCount(Long userId) {

        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    @Override
    public Notification bookingConfirmed(Long userId) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Booking Confirmed");
        notification.setMessage("Your booking has been confirmed successfully.");
        notification.setNotificationType("BOOKING");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification bookingCancelled(Long userId) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Booking Cancelled");
        notification.setMessage("Your booking has been cancelled.");
        notification.setNotificationType("BOOKING");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
public Notification bookingApproved(Long userId) {

    Notification notification = new Notification();
    notification.setUserId(userId);
    notification.setTitle("Booking Approved");
    notification.setMessage("Your booking has been approved by the bike owner. Please confirm your booking to continue.");
    notification.setNotificationType("BOOKING");
    notification.setIsRead(false);
    notification.setCreatedAt(LocalDateTime.now());

    return notificationRepository.save(notification);
}

@Override
public Notification bookingRejected(Long userId) {

    Notification notification = new Notification();
    notification.setUserId(userId);
    notification.setTitle("Booking Rejected");
    notification.setMessage("Your booking request has been rejected by the bike owner.");
    notification.setNotificationType("BOOKING");
    notification.setIsRead(false);
    notification.setCreatedAt(LocalDateTime.now());

    return notificationRepository.save(notification);
}

    @Override
    public Notification paymentSuccessful(Long userId) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Payment Successful");
        notification.setMessage("Your payment has been completed successfully.");
        notification.setNotificationType("PAYMENT");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification rideCompleted(Long userId) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Ride Completed");
        notification.setMessage("Your ride has been completed successfully.");
        notification.setNotificationType("RIDE");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification verificationSuccessful(Long userId) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Verification Successful");
        notification.setMessage("Your verification has been completed successfully.");
        notification.setNotificationType("VERIFICATION");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification bikeRcApproved(Long ownerId) {

        Notification notification = new Notification();
        notification.setUserId(ownerId);
        notification.setTitle("Bike RC Approved");
        notification.setMessage("Your bike RC has been approved.");
        notification.setNotificationType("BIKE_RC");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    @Override
    public Notification bikeRcRejected(Long ownerId) {

        Notification notification = new Notification();
        notification.setUserId(ownerId);
        notification.setTitle("Bike RC Rejected");
        notification.setMessage("Your bike RC has been rejected. Please upload valid documents.");
        notification.setNotificationType("BIKE_RC");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }
}