package com.vertex.projects.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for ChangeOrder
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeOrderResponse {

    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String status;
    private Integer impactOnTimeline;
    private BigDecimal impactOnBudget;
    private String impactOnScope;
    private String justification;
    private String priority;
    private Long createdBy;
    private Long approvedBy;
    private String approvalDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
