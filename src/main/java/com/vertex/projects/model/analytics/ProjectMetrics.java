package com.vertex.projects.model.analytics;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ProjectMetrics entity for tracking project key performance indicators
 */
@Entity
@Table(name = "project_metrics", indexes = {
    @Index(name = "idx_project_id", columnList = "project_id"),
    @Index(name = "idx_date", columnList = "recorded_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "total_tasks")
    @Builder.Default
    private Integer totalTasks = 0;

    @Column(name = "completed_tasks")
    @Builder.Default
    private Integer completedTasks = 0;

    @Column(name = "in_progress_tasks")
    @Builder.Default
    private Integer inProgressTasks = 0;

    @Column(name = "budget_allocated", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budgetAllocated = BigDecimal.ZERO;

    @Column(name = "budget_spent", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budgetSpent = BigDecimal.ZERO;

    @Column(name = "budget_remaining", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budgetRemaining = BigDecimal.ZERO;

    @Column(name = "progress_percentage")
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Column(name = "health_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HealthStatus healthStatus = HealthStatus.HEALTHY;

    @Column(name = "is_on_schedule")
    @Builder.Default
    private Boolean isOnSchedule = true;

    @Column(name = "is_on_budget")
    @Builder.Default
    private Boolean isOnBudget = true;

    @Column(name = "team_size")
    @Builder.Default
    private Integer teamSize = 0;

    @Column(name = "recorded_date", nullable = false)
    private LocalDateTime recordedDate;

    @PrePersist
    protected void onCreate() {
        if (recordedDate == null) {
            recordedDate = LocalDateTime.now();
        }
    }

    public enum HealthStatus {
        HEALTHY,
        AT_RISK,
        CRITICAL
    }
}
