package com.vertex.projects.controller.notification;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.notification.Notification;
import com.vertex.projects.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Notification Management
 */
@RestController
@RequestMapping("/api/v2/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(@RequestBody Notification notification) {
        log.info("Creating new notification for user: {}", notification.getUserId());
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Notification created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Notification>> getNotification(@PathVariable Long id) {
        log.debug("Fetching notification: {}", id);
        return notificationService.getNotificationById(id)
            .map(notification -> ResponseEntity.ok(ApiResponse.success(notification, "Notification retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Notification>>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.debug("Fetching notifications for user: {}", userId);
        Page<Notification> notifications = notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(@PathVariable Long userId) {
        log.debug("Fetching unread notifications for user: {}", userId);
        List<Notification> unread = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(unread, "Unread notifications retrieved successfully"));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved successfully"));
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<ApiResponse<List<Notification>>> getRecentNotifications(@PathVariable Long userId) {
        log.debug("Fetching recent notifications for user: {}", userId);
        List<Notification> recent = notificationService.getRecentNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(recent, "Recent notifications retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        log.info("Marking notification as read: {}", id);
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(@PathVariable Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Long id) {
        log.info("Deleting notification: {}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("", "Notification deleted successfully"));
    }

    @PostMapping("/cleanup-expired")
    public ResponseEntity<ApiResponse<String>> cleanupExpired() {
        log.info("Cleaning up expired notifications");
        notificationService.cleanupExpiredNotifications();
        return ResponseEntity.ok(ApiResponse.success("", "Expired notifications cleaned up"));
    }
}
