package com.vertex.projects.dto.design;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DesignRequestDto {
    @NotBlank
    private String title;

    private String description;

    private Long createdBy;
}
