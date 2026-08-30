package com.vertex.projects.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamPerformanceResponse {
    private int memberCount;
    private int completedChangeOrders;
    private int openChangeOrders;
}
