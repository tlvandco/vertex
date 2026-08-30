package com.vertex.projects.model.financial;

import com.vertex.projects.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Expense entity representing a project expense
 * Tracks individual expenses with approval workflow
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    @Column(name = "status", length = 50)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "submitted_by", nullable = false)
    private Long submittedBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
