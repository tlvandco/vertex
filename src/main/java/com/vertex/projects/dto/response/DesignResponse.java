package com.vertex.projects.dto.response;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO for design responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignResponse {

    private Long id;

    private Long projectId;

    private Long designerId;

    private String title;

    private String description;

    private String fileUrl;

    private String thumbnailUrl;

    private String designType;

    private String status;

    private Integer versionNumber;

    private String approvalStatus;

    private Long approvedBy;

    private String approvalNotes;

    private String tags;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime approvedAt;

    private Boolean isActive;
}
