package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for design feedback requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignFeedbackRequest {

    @NotNull(message = "Design ID is required")
    private Long designId;

    @NotNull(message = "Feedback creator ID is required")
    private Long createdBy;

    @NotBlank(message = "Feedback text is required")
    @Size(min = 10, max = 2000, message = "Feedback must be between 10 and 2000 characters")
    private String feedbackText;

    @NotBlank(message = "Feedback type is required")
    private String feedbackType;

    private String attachmentUrl;
}
