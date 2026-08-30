package com.vertex.projects.controller.notification;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.notification.NotificationPreference;
import com.vertex.projects.service.notification.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Notification Preferences
 */
@RestController
@RequestMapping("/api/v2/notification-preferences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<NotificationPreference>> getUserPreference(@PathVariable Long userId) {
        log.debug("Fetching notification preferences for user: {}", userId);
        NotificationPreference pref = preferenceService.getUserPreference(userId);
        return ResponseEntity.ok(ApiResponse.success(pref, "Preferences retrieved successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<NotificationPreference>> updatePreference(@RequestBody NotificationPreference preference) {
        log.info("Updating notification preferences for user: {}", preference.getUserId());
        NotificationPreference updated = preferenceService.updatePreference(preference);
        return ResponseEntity.ok(ApiResponse.success(updated, "Preferences updated successfully"));
    }

    @PutMapping("/user/{userId}/enable-all")
    public ResponseEntity<ApiResponse<NotificationPreference>> enableAll(@PathVariable Long userId) {
        log.info("Enabling all notifications for user: {}", userId);
        NotificationPreference pref = preferenceService.enableAllNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(pref, "All notifications enabled"));
    }

    @PutMapping("/user/{userId}/disable-all")
    public ResponseEntity<ApiResponse<NotificationPreference>> disableAll(@PathVariable Long userId) {
        log.info("Disabling all notifications for user: {}", userId);
        NotificationPreference pref = preferenceService.disableAllNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(pref, "All notifications disabled"));
    }

    @PostMapping("/user/{userId}/quiet-hours")
    public ResponseEntity<ApiResponse<NotificationPreference>> setQuietHours(
            @PathVariable Long userId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        log.info("Setting quiet hours for user: {} from {} to {}", userId, startTime, endTime);
        NotificationPreference pref = preferenceService.setQuietHours(userId, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(pref, "Quiet hours set successfully"));
    }
}
