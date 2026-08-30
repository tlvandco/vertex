package com.vertex.projects.service.notification;

import com.vertex.projects.model.notification.NotificationPreference;
import com.vertex.projects.repository.notification.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Optional;

/**
 * Service for managing notification preferences
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    /**
     * Get preference for user (create default if not exists)
     */
    public NotificationPreference getUserPreference(Long userId) {
        Optional<NotificationPreference> preference = preferenceRepository.findByUserId(userId);
        
        if (preference.isEmpty()) {
            NotificationPreference newPref = NotificationPreference.builder()
                .userId(userId)
                .enableEmailNotifications(true)
                .enablePushNotifications(true)
                .enableInAppNotifications(true)
                .notifyOnProjectChanges(true)
                .notifyOnAssignments(true)
                .notifyOnDesignFeedback(true)
                .notifyOnBudgetAlerts(true)
                .notifyOnTimelineAlerts(true)
                .build();
            return preferenceRepository.save(newPref);
        }
        
        return preference.get();
    }

    /**
     * Update user preferences
     */
    public NotificationPreference updatePreference(NotificationPreference preference) {
        log.info("Updating notification preferences for user: {}", preference.getUserId());
        return preferenceRepository.save(preference);
    }

    /**
     * Enable all notifications for user
     */
    public NotificationPreference enableAllNotifications(Long userId) {
        NotificationPreference pref = getUserPreference(userId);
        pref.setEnableEmailNotifications(true);
        pref.setEnablePushNotifications(true);
        pref.setEnableInAppNotifications(true);
        return preferenceRepository.save(pref);
    }

    /**
     * Disable all notifications for user
     */
    public NotificationPreference disableAllNotifications(Long userId) {
        NotificationPreference pref = getUserPreference(userId);
        pref.setEnableEmailNotifications(false);
        pref.setEnablePushNotifications(false);
        pref.setEnableInAppNotifications(false);
        return preferenceRepository.save(pref);
    }

    /**
     * Check if user has specific notification enabled
     */
    public boolean isNotificationEnabled(Long userId, String notificationType) {
        NotificationPreference pref = getUserPreference(userId);
        
        return switch(notificationType) {
            case "PROJECT_CHANGES" -> pref.getNotifyOnProjectChanges();
            case "ASSIGNMENTS" -> pref.getNotifyOnAssignments();
            case "DESIGN_FEEDBACK" -> pref.getNotifyOnDesignFeedback();
            case "BUDGET_ALERTS" -> pref.getNotifyOnBudgetAlerts();
            case "TIMELINE_ALERTS" -> pref.getNotifyOnTimelineAlerts();
            default -> true;
        };
    }

    /**
     * Set quiet hours
     */
    public NotificationPreference setQuietHours(Long userId, String startTime, String endTime) {
        NotificationPreference pref = getUserPreference(userId);
        pref.setQuietHoursStart(startTime);
        pref.setQuietHoursEnd(endTime);
        return preferenceRepository.save(pref);
    }
}
