package com.vertex.projects.repository.core;

import com.vertex.projects.model.core.ProjectTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for ProjectTimeline entity
 */
@Repository
public interface ProjectTimelineRepository extends JpaRepository<ProjectTimeline, Long> {
    List<ProjectTimeline> findByProjectId(Long projectId);
    List<ProjectTimeline> findByProjectIdAndStatus(Long projectId, ProjectTimeline.MilestoneStatus status);
}
