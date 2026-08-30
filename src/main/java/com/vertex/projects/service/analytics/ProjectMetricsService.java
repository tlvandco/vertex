package com.vertex.projects.service.analytics;

import com.vertex.projects.model.analytics.ProjectMetrics;
import com.vertex.projects.repository.analytics.ProjectMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for Project Metrics tracking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMetricsService {

    private final ProjectMetricsRepository metricsRepository;

    /**
     * Record project metrics
     */
    public ProjectMetrics recordMetrics(ProjectMetrics metrics) {
        log.info("Recording metrics for project: {}", metrics.getProjectId());
        return metricsRepository.save(metrics);
    }

    /**
     * Get latest metrics for project
     */
    public Optional<ProjectMetrics> getLatestMetrics(Long projectId) {
        ProjectMetrics metrics = metricsRepository.findFirstByProjectIdOrderByRecordedDateDesc(projectId);
        return Optional.ofNullable(metrics);
    }

    /**
     * Get metrics history for project
     */
    public List<ProjectMetrics> getMetricsHistory(Long projectId) {
        return metricsRepository.findByProjectIdOrderByRecordedDateDesc(projectId);
    }

    /**
     * Get metrics for date range
     */
    public List<ProjectMetrics> getMetricsForDateRange(Long projectId, LocalDateTime start, LocalDateTime end) {
        return metricsRepository.findByProjectIdAndRecordedDateBetween(projectId, start, end);
    }

    /**
     * Get at-risk projects
     */
    public List<ProjectMetrics> getAtRiskProjects() {
        return metricsRepository.findByHealthStatus(ProjectMetrics.HealthStatus.AT_RISK);
    }

    /**
     * Get critical projects
     */
    public List<ProjectMetrics> getCriticalProjects() {
        return metricsRepository.findByHealthStatus(ProjectMetrics.HealthStatus.CRITICAL);
    }
}
