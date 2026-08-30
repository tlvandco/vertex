package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for design requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Designer ID is required")
    private Long designerId;

    @NotBlank(message = "Design title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Design type is required")
    private String designType;

    private String fileUrl;

    private String thumbnailUrl;

    private String tags;
}
