package com.vertex.projects.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for Budget
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private BigDecimal totalBudget;
    private BigDecimal spentAmount;
    private BigDecimal remainingBudget;
    private Double utilizationPercentage;
    private String currency;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
