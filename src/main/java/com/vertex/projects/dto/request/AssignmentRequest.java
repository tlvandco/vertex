package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for assignment requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role is required")
    private String role;

    private String status;
}
