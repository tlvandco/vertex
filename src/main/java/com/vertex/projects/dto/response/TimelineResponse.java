package com.vertex.projects.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for timeline/milestone responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineResponse {

    private Long id;

    private Long projectId;

    private String title;

    private String description;

    private LocalDate plannedDate;

    private LocalDate completionDate;

    private String status;

    private Integer progress;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
