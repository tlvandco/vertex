package com.vertex.projects.model.portal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DesignVersion entity for design version control and history
 */
@Entity
@Table(name = "design_versions", indexes = {
    @Index(name = "idx_design_id", columnList = "design_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "design_id", nullable = false)
    private Long designId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
