package com.vertex.projects.model.core;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ProjectTimeline entity for tracking project milestones and progress
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "project_timelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "planned_date")
    private LocalDateTime plannedDate;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MilestoneStatus status = MilestoneStatus.PLANNED;

    @Column(name = "progress")
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
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

    public enum MilestoneStatus {
        PLANNED, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED
    }
}
