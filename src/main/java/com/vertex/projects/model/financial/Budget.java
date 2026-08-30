package com.vertex.projects.model.financial;

import com.vertex.projects.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Budget entity representing a project budget
 * Tracks the overall budget allocation and spending for a project
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalBudget;

    @Column(name = "spent_amount", precision = 15, scale = 2)
    private BigDecimal spentAmount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_by")
    private Long createdBy;

    /**
     * Calculate remaining budget
     */
    public BigDecimal getRemainingBudget() {
        if (spentAmount == null) {
            return totalBudget;
        }
        return totalBudget.subtract(spentAmount);
    }

    /**
     * Calculate budget utilization percentage
     */
    public Double getUtilizationPercentage() {
        if (totalBudget == null || spentAmount == null) {
            return 0.0;
        }
        return (spentAmount.doubleValue() / totalBudget.doubleValue()) * 100;
    }
}
