package com.vertex.projects.model.portal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DesignComment entity for design collaboration and discussions
 */
@Entity
@Table(name = "design_comments", indexes = {
    @Index(name = "idx_design_id", columnList = "design_id"),
    @Index(name = "idx_created_by", columnList = "created_by")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "design_id", nullable = false)
    private Long designId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "parent_comment_id")
    private Long parentCommentId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

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
