package com.vertex.projects.model.notification;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * NotificationPreference entity for user notification settings
 */
@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "enable_email_notifications")
    @Builder.Default
    private Boolean enableEmailNotifications = true;

    @Column(name = "enable_push_notifications")
    @Builder.Default
    private Boolean enablePushNotifications = true;

    @Column(name = "enable_in_app_notifications")
    @Builder.Default
    private Boolean enableInAppNotifications = true;

    @Column(name = "notify_on_project_changes")
    @Builder.Default
    private Boolean notifyOnProjectChanges = true;

    @Column(name = "notify_on_assignments")
    @Builder.Default
    private Boolean notifyOnAssignments = true;

    @Column(name = "notify_on_design_feedback")
    @Builder.Default
    private Boolean notifyOnDesignFeedback = true;

    @Column(name = "notify_on_budget_alerts")
    @Builder.Default
    private Boolean notifyOnBudgetAlerts = true;

    @Column(name = "notify_on_timeline_alerts")
    @Builder.Default
    private Boolean notifyOnTimelineAlerts = true;

    @Column(name = "quiet_hours_start")
    private String quietHoursStart;

    @Column(name = "quiet_hours_end")
    private String quietHoursEnd;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
