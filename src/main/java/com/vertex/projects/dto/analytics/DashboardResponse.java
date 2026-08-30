package com.vertex.projects.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private int projectsAtRisk;
    private int projectsCritical;
    private long totalInvoices;
    private BigDecimal totalInvoiced;
    private long recentUnreadNotifications;
}
