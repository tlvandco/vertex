package com.vertex.projects.service.notification;

import com.vertex.projects.model.notification.Notification;
import com.vertex.projects.model.notification.NotificationPreference;
import com.vertex.projects.repository.notification.NotificationPreferenceRepository;
import com.vertex.projects.repository.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    /**
     * Create a new notification
     */
    public Notification createNotification(Notification notification) {
        log.info("Creating notification for user: {}", notification.getUserId());
        return notificationRepository.save(notification);
    }

    /**
     * Get notification by ID
     */
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Get all notifications for a user with pagination
     */
    public Page<Notification> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserId(userId, pageable);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        log.debug("Fetching unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    /**
     * Get unread notifications with pagination
     */
    public Page<Notification> getUnreadNotificationsPaged(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdAndIsReadFalse(userId, pageable);
    }

    /**
     * Count unread notifications
     */
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    /**
     * Mark notification as read
     */
    public Notification markAsRead(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            Notification n = notification.get();
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            return notificationRepository.save(n);
        }
        return null;
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    /**
     * Delete notification
     */
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification: {}", notificationId);
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Clean up expired notifications
     */
    public void cleanupExpiredNotifications() {
        log.info("Cleaning up expired notifications");
        notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
    }

    /**
     * Get recent notifications for user (limit 10)
     */
    public List<Notification> getRecentNotifications(Long userId) {
        return notificationRepository.findRecentNotifications(userId);
    }

    /**
     * Get notifications for related entity
     */
    public List<Notification> getNotificationsForEntity(String entityType, Long entityId) {
        return notificationRepository.findByRelatedEntityTypeAndRelatedEntityId(entityType, entityId);
    }

    /**
     * Send notification to user
     */
    public Notification sendNotification(Long userId, String title, String message, 
                                       Notification.NotificationType type,
                                       Notification.NotificationPriority priority,
                                       String actionUrl) {
        Notification notification = Notification.builder()
            .userId(userId)
            .title(title)
            .message(message)
            .type(type)
            .priority(priority)
            .actionUrl(actionUrl)
            .isRead(false)
            .build();
        return createNotification(notification);
    }

    /**
     * Broadcast notification to multiple users
     */
    public void broadcastNotification(List<Long> userIds, String title, String message, 
                                     Notification.NotificationType type,
                                     Notification.NotificationPriority priority) {
        userIds.forEach(userId -> 
            sendNotification(userId, title, message, type, priority, null)
        );
    }
}
