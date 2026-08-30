package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for team requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRequest {

    @NotBlank(message = "Team name is required")
    @Size(min = 3, max = 100, message = "Team name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Team lead ID is required")
    private Long leaderId;
}
