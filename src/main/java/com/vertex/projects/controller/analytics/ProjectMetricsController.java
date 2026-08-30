package com.vertex.projects.controller.analytics;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.analytics.ProjectMetrics;
import com.vertex.projects.service.analytics.ProjectMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for Project Metrics
 */
@RestController
@RequestMapping("/api/v2/project-metrics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProjectMetricsController {

    private final ProjectMetricsService metricsService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectMetrics>> recordMetrics(@RequestBody ProjectMetrics metrics) {
        log.info("Recording metrics for project: {}", metrics.getProjectId());
        ProjectMetrics recorded = metricsService.recordMetrics(metrics);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(recorded, "Metrics recorded successfully"));
    }

    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<ApiResponse<ProjectMetrics>> getLatestMetrics(@PathVariable Long projectId) {
        return metricsService.getLatestMetrics(projectId)
            .map(metrics -> ResponseEntity.ok(ApiResponse.success(metrics, "Latest metrics retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}/history")
    public ResponseEntity<ApiResponse<List<ProjectMetrics>>> getMetricsHistory(@PathVariable Long projectId) {
        List<ProjectMetrics> history = metricsService.getMetricsHistory(projectId);
        return ResponseEntity.ok(ApiResponse.success(history, "Metrics history retrieved successfully"));
    }

    @GetMapping("/project/{projectId}/date-range")
    public ResponseEntity<ApiResponse<List<ProjectMetrics>>> getMetricsForDateRange(
            @PathVariable Long projectId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        List<ProjectMetrics> metrics = metricsService.getMetricsForDateRange(projectId, start, end);
        return ResponseEntity.ok(ApiResponse.success(metrics, "Metrics retrieved successfully"));
    }

    @GetMapping("/at-risk")
    public ResponseEntity<ApiResponse<List<ProjectMetrics>>> getAtRiskProjects() {
        List<ProjectMetrics> projects = metricsService.getAtRiskProjects();
        return ResponseEntity.ok(ApiResponse.success(projects, "At-risk projects retrieved successfully"));
    }

    @GetMapping("/critical")
    public ResponseEntity<ApiResponse<List<ProjectMetrics>>> getCriticalProjects() {
        List<ProjectMetrics> projects = metricsService.getCriticalProjects();
        return ResponseEntity.ok(ApiResponse.success(projects, "Critical projects retrieved successfully"));
    }
}

