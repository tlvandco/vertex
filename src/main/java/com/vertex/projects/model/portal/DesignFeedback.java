package com.vertex.projects.model.portal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DesignFeedback entity for design review and feedback
 */
@Entity
@Table(name = "design_feedback", indexes = {
    @Index(name = "idx_design_id", columnList = "design_id"),
    @Index(name = "idx_created_by", columnList = "created_by")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "design_id", nullable = false)
    private Long designId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "feedback_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FeedbackType feedbackType = FeedbackType.COMMENT;

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false;

    @Column(name = "attachment_url")
    private String attachmentUrl;

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

    public enum FeedbackType {
        COMMENT,
        SUGGESTION,
        ISSUE,
        APPROVAL,
        REVISION_REQUEST
    }
}
