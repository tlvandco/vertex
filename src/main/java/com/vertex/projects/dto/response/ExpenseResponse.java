package com.vertex.projects.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for Expense
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private Long id;
    private Long projectId;
    private Long categoryId;
    private BigDecimal amount;
    private String currency;
    private String description;
    private LocalDate expenseDate;
    private String status;
    private Long submittedBy;
    private Long approvedBy;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
