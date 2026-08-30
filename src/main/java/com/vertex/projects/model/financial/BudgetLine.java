package com.vertex.projects.model.financial;

import com.vertex.projects.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * BudgetLine entity representing a line item in a budget
 * Each budget can have multiple budget lines for different categories
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "budget_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetLine extends BaseEntity {

    @Column(name = "budget_id", nullable = false)
    private Long budgetId;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "budgeted_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal budgetedAmount;

    @Column(name = "spent_amount", precision = 15, scale = 2)
    private BigDecimal spentAmount;

    /**
     * Calculate remaining amount for this line
     */
    public BigDecimal getRemainingAmount() {
        if (spentAmount == null) {
            return budgetedAmount;
        }
        return budgetedAmount.subtract(spentAmount);
    }

    /**
     * Calculate variance percentage
     */
    public Double getVariancePercentage() {
        if (budgetedAmount == null || spentAmount == null) {
            return 0.0;
        }
        return ((spentAmount.doubleValue() - budgetedAmount.doubleValue()) / budgetedAmount.doubleValue()) * 100;
    }
}
