package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating/updating expense
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long categoryId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @Size(max = 3, message = "Currency code must be 3 characters")
    private String currency;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @PastOrPresent(message = "Expense date cannot be in the future")
    private LocalDate expenseDate;

    private Long categoryName;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
