package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating/updating timelines/milestones
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Milestone title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @FutureOrPresent(message = "Planned date must be today or in the future")
    private LocalDate plannedDate;

    private LocalDate completionDate;

    @DecimalMin(value = "0.0", message = "Progress must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Progress must be between 0 and 100")
    private Integer progress;

    private String status;
}
