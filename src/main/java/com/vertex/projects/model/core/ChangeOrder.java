package com.vertex.projects.model.core;

import com.vertex.projects.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * ChangeOrder entity representing a project change request
 * Tracks modifications to project scope, budget, and timeline
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "change_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeOrder extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", length = 50)
    private String status; // DRAFT, SUBMITTED, APPROVED, REJECTED, IMPLEMENTED

    @Column(name = "impact_on_timeline")
    private Integer impactOnTimeline; // In days

    @Column(name = "impact_on_budget", precision = 15, scale = 2)
    private BigDecimal impactOnBudget;

    @Column(name = "impact_on_scope", columnDefinition = "TEXT")
    private String impactOnScope;

    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_date")
    private String approvalDate;

    @Column(name = "priority", length = 50)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
}
