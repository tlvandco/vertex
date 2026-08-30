package com.vertex.projects.service.core;

import com.vertex.projects.model.core.ProjectTimeline;
import com.vertex.projects.repository.core.ProjectTimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for ProjectTimeline management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectTimelineService {

    private final ProjectTimelineRepository projectTimelineRepository;

    /**
     * Create timeline milestone
     */
    public ProjectTimeline createMilestone(ProjectTimeline timeline) {
        log.info("Creating new milestone for project: {}", timeline.getProjectId());
        return projectTimelineRepository.save(timeline);
    }

    /**
     * Get timeline by ID
     */
    public Optional<ProjectTimeline> getMilestoneById(Long id) {
        log.debug("Fetching milestone with ID: {}", id);
        return projectTimelineRepository.findById(id);
    }

    /**
     * Get all timelines for a project
     */
    public List<ProjectTimeline> getProjectTimeline(Long projectId) {
        log.debug("Fetching timeline for project: {}", projectId);
        return projectTimelineRepository.findByProjectId(projectId);
    }

    /**
     * Get timelines by status
     */
    public List<ProjectTimeline> getTimelineByStatus(Long projectId, ProjectTimeline.MilestoneStatus status) {
        log.debug("Fetching timelines for project {} with status: {}", projectId, status);
        return projectTimelineRepository.findByProjectIdAndStatus(projectId, status);
    }

    /**
     * Update timeline
     */
    public ProjectTimeline updateTimeline(Long id, ProjectTimeline updates) {
        log.info("Updating timeline with ID: {}", id);
        return projectTimelineRepository.findById(id).map(timeline -> {
            if (updates.getTitle() != null) timeline.setTitle(updates.getTitle());
            if (updates.getDescription() != null) timeline.setDescription(updates.getDescription());
            if (updates.getStatus() != null) timeline.setStatus(updates.getStatus());
            if (updates.getProgress() != null) timeline.setProgress(updates.getProgress());
            if (updates.getCompletionDate() != null) timeline.setCompletionDate(updates.getCompletionDate());
            return projectTimelineRepository.save(timeline);
        }).orElseThrow(() -> new RuntimeException("Timeline not found"));
    }

    /**
     * Delete timeline
     */
    public void deleteTimeline(Long id) {
        log.info("Deleting timeline with ID: {}", id);
        projectTimelineRepository.deleteById(id);
    }
}
