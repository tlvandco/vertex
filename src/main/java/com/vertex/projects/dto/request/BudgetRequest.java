package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating/updating budget
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Budget name is required")
    @Size(min = 3, max = 255, message = "Budget name must be between 3 and 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "0.01", message = "Total budget must be greater than 0")
    private BigDecimal totalBudget;

    @DecimalMin(value = "0.00", message = "Spent amount cannot be negative")
    private BigDecimal spentAmount;

    @Size(max = 3, message = "Currency code must be 3 characters")
    private String currency;

    @Pattern(regexp = "^(DRAFT|ACTIVE|CLOSED|ARCHIVED)$", message = "Invalid status")
    private String status;

    @PastOrPresent(message = "Start date cannot be in the future")
    private LocalDate startDate;

    private LocalDate endDate;
}
