package com.sssit.bikerental.modules.notification.entity;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Create Notification
    @PostMapping
    public Notification sendNotification(@RequestBody Notification notification) {
        return notificationService.sendNotification(notification);
    }

    // Get All Notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // Get Notification By Id
    @GetMapping("/{notificationId}")
    public Notification getNotificationById(@PathVariable Long notificationId) {
        return notificationService.getNotificationById(notificationId);
    }

    private void validateUserOwnership(Long userId) {
        com.sssit.bikerental.modules.user.User currentUser = com.sssit.bikerental.common.security.SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != com.sssit.bikerental.common.enums.Role.ADMIN && !currentUser.getId().equals(userId)) {
            throw new com.sssit.bikerental.common.exception.ResourceOwnershipException("Access denied: You can only access your own notifications");
        }
    }

    // Get Notifications By User Id
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {
        validateUserOwnership(userId);
        return notificationService.getNotificationsByUser(userId);
    }

    // Get Unread Notifications
    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        validateUserOwnership(userId);
        return notificationService.getUnreadNotifications(userId);
    }

    // Mark Notification As Read
   @PutMapping("/read/{notificationId}")
public Notification markAsRead(@PathVariable Long notificationId) {

    Notification notification =
            notificationService.getNotificationById(notificationId);

    validateUserOwnership(notification.getUserId());

    return notificationService.markAsRead(notificationId);
}
    // Delete Notification
   @DeleteMapping("/{notificationId}")
public String deleteNotification(@PathVariable Long notificationId) {

    Notification notification =
            notificationService.getNotificationById(notificationId);

    validateUserOwnership(notification.getUserId());

    notificationService.deleteNotification(notificationId);

    return "Notification deleted successfully.";
}
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        validateUserOwnership(userId);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
    @PostMapping("/booking-confirmed/{userId}")
    public ResponseEntity<Notification> bookingConfirmed(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.bookingConfirmed(userId));
    }

    @PostMapping("/booking-cancelled/{userId}")
    public ResponseEntity<Notification> bookingCancelled(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.bookingCancelled(userId));
    }

    @PostMapping("/payment-success/{userId}")
    public ResponseEntity<Notification> paymentSuccessful(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.paymentSuccessful(userId));
    }

    @PostMapping("/ride-completed/{userId}")
    public ResponseEntity<Notification> rideCompleted(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.rideCompleted(userId));
    }

    @PostMapping("/verification-success/{userId}")
    public ResponseEntity<Notification> verificationSuccessful(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.verificationSuccessful(userId));
    }

    @PostMapping("/bike-rc-approved/{ownerId}")
    public ResponseEntity<Notification> bikeRcApproved(@PathVariable Long ownerId) {
        return ResponseEntity.ok(notificationService.bikeRcApproved(ownerId));
    }

    @PostMapping("/bike-rc-rejected/{ownerId}")
    public ResponseEntity<Notification> bikeRcRejected(@PathVariable Long ownerId) {
        return ResponseEntity.ok(notificationService.bikeRcRejected(ownerId));
    }
}
