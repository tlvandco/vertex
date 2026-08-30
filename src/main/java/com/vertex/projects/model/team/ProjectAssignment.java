package com.vertex.projects.model.team;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ProjectAssignment entity for assigning users to projects with specific roles
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "project_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private AssignmentRole role;

    @Column(name = "assigned_date")
    private LocalDateTime assignedDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (assignedDate == null) {
            assignedDate = LocalDateTime.now();
        }
    }

    public enum AssignmentRole {
        PROJECT_MANAGER, DESIGNER, CONSULTANT, REVIEWER, ADMIN
    }

    public enum AssignmentStatus {
        ACTIVE, COMPLETED, CANCELLED, PAUSED
    }
}
