package com.vertex.projects.model.portal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Design entity for Design Portal in VERTEX
 * Represents design submissions and versions
 */
@Entity
@Table(name = "designs", indexes = {
    @Index(name = "idx_project_id", columnList = "project_id"),
    @Index(name = "idx_designer_id", columnList = "designer_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "designer_id", nullable = false)
    private Long designerId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "design_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DesignType designType = DesignType.CONCEPT;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DesignStatus status = DesignStatus.DRAFT;

    @Column(name = "version_number")
    @Builder.Default
    private Integer versionNumber = 1;

    @Column(name = "approval_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DesignType {
        CONCEPT,
        FLOOR_PLAN,
        THREE_D_VISUALIZATION,
        MATERIAL_BOARD,
        COLOR_PALETTE,
        DETAILED_DESIGN,
        FINAL_PRESENTATION
    }


    public enum DesignStatus {
        DRAFT,
        IN_PROGRESS,
        SUBMITTED,
        UNDER_REVIEW,
        REVISION_REQUESTED,
        APPROVED,
        REJECTED
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        NEEDS_REVISION
    }
}
