package com.vertex.projects.model.analytics;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UserActivity entity for tracking user engagement and actions
 */
@Entity
@Table(name = "user_activity", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_timestamp", columnList = "activity_timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "activity_type")
    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "activity_timestamp", nullable = false)
    private LocalDateTime activityTimestamp;

    @PrePersist
    protected void onCreate() {
        if (activityTimestamp == null) {
            activityTimestamp = LocalDateTime.now();
        }
    }

    public enum ActivityType {
        PROJECT_CREATED,
        PROJECT_UPDATED,
        PROJECT_DELETED,
        DESIGN_UPLOADED,
        DESIGN_APPROVED,
        COMMENT_ADDED,
        FEEDBACK_SUBMITTED,
        USER_LOGGED_IN,
        USER_LOGGED_OUT,
        FILE_DOWNLOADED,
        REPORT_GENERATED
    }
}
