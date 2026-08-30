package com.vertex.projects.controller.analytics;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.analytics.DashboardResponse;
import com.vertex.projects.dto.analytics.FinancialSummaryResponse;
import com.vertex.projects.dto.analytics.TeamPerformanceResponse;
import com.vertex.projects.model.analytics.ProjectMetrics;
import com.vertex.projects.model.core.Project;
import com.vertex.projects.repository.core.ProjectRepository;
import com.vertex.projects.repository.financial.InvoiceRepository;
import com.vertex.projects.repository.ChangeOrderRepository;
import com.vertex.projects.repository.notification.NotificationRepository;
import com.vertex.projects.service.analytics.ProjectMetricsService;
import com.vertex.projects.service.team.TeamService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v2/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final ProjectMetricsService projectMetricsService;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final TeamService teamService;
    private final ProjectRepository projectRepository;
    private final ChangeOrderRepository changeOrderRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        List<ProjectMetrics> atRisk = projectMetricsService.getAtRiskProjects();
        List<ProjectMetrics> critical = projectMetricsService.getCriticalProjects();

        long totalInvoices = invoiceRepository.count();
        BigDecimal totalInvoiced = invoiceRepository.findAll().stream()
                .map(i -> i.getAmount() == null ? BigDecimal.ZERO : i.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUnread = notificationRepository.countByIsReadFalse();

        DashboardResponse resp = DashboardResponse.builder()
                .projectsAtRisk(atRisk.size())
                .projectsCritical(critical.size())
                .totalInvoices(totalInvoices)
                .totalInvoiced(totalInvoiced)
                .recentUnreadNotifications(totalUnread)
                .build();

        return ResponseEntity.ok(ApiResponse.success(resp, "Dashboard data"));
    }

    @GetMapping("/projects/summary")
    public ResponseEntity<ApiResponse<ProjectMetrics>> getProjectSummary(@RequestParam Long projectId) {
        return projectMetricsService.getLatestMetrics(projectId)
                .map(m -> ResponseEntity.ok(ApiResponse.success(m, "Project metrics")))
                .orElse(ResponseEntity.ok(ApiResponse.success(null, "No metrics found")));
    }

    @GetMapping("/financial/summary")
    public ResponseEntity<ApiResponse<FinancialSummaryResponse>> getFinancialSummary() {
        long totalInvoices = invoiceRepository.count();
        BigDecimal totalInvoiced = invoiceRepository.findAll().stream()
                .map(i -> i.getAmount() == null ? BigDecimal.ZERO : i.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        FinancialSummaryResponse resp = FinancialSummaryResponse.builder()
                .totalInvoices(totalInvoices)
                .totalInvoiced(totalInvoiced)
                .build();

        return ResponseEntity.ok(ApiResponse.success(resp, "Financial summary"));
    }

    @GetMapping("/team/performance")
    public ResponseEntity<ApiResponse<TeamPerformanceResponse>> getTeamPerformance(@RequestParam Long teamId) {
        int memberCount = teamService.listMembers(teamId).size();

        // Collect project IDs for projects managed by team members (approximation)
        List<Long> projectIds = new ArrayList<>();
        teamService.listMembers(teamId).forEach(m -> {
            List<Project> projects = projectRepository.findByProjectManagerId(m.getUserId());
            projects.forEach(p -> projectIds.add(p.getId()));
        });

        int completed = 0;
        int open = 0;
        for (Long pid : projectIds) {
            completed += changeOrderRepository.findApprovedByProjectId(pid).size();
            open += changeOrderRepository.findPendingByProjectId(pid).size();
        }

        TeamPerformanceResponse resp = TeamPerformanceResponse.builder()
                .memberCount(memberCount)
                .completedChangeOrders(completed)
                .openChangeOrders(open)
                .build();

        return ResponseEntity.ok(ApiResponse.success(resp, "Team performance"));
    }
}
