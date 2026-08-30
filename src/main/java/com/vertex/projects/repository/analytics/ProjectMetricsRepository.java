package com.vertex.projects.repository.analytics;

import com.vertex.projects.model.analytics.ProjectMetrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for ProjectMetrics entity
 */
@Repository
public interface ProjectMetricsRepository extends JpaRepository<ProjectMetrics, Long> {

    List<ProjectMetrics> findByProjectIdOrderByRecordedDateDesc(Long projectId);

    List<ProjectMetrics> findByProjectIdAndRecordedDateBetween(Long projectId, LocalDateTime start, LocalDateTime end);

    ProjectMetrics findFirstByProjectIdOrderByRecordedDateDesc(Long projectId);

    List<ProjectMetrics> findByHealthStatus(ProjectMetrics.HealthStatus healthStatus);
}
