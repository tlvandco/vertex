package com.vertex.projects.controller.core;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.core.ProjectTimeline;
import com.vertex.projects.service.core.ProjectTimelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for Project Timeline Management
 */
@RestController
@RequestMapping("/api/v2/timelines")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProjectTimelineController {

    private final ProjectTimelineService projectTimelineService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectTimeline>> createMilestone(@Valid @RequestBody ProjectTimeline timeline) {
        log.info("Creating new milestone for project: {}", timeline.getProjectId());
        ProjectTimeline created = projectTimelineService.createMilestone(timeline);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Milestone created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectTimeline>> getMilestone(@PathVariable Long id) {
        log.info("Fetching milestone with ID: {}", id);
        return projectTimelineService.getMilestoneById(id)
            .map(timeline -> ResponseEntity.ok(ApiResponse.success(timeline, "Milestone retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<ProjectTimeline>>> getProjectTimeline(@PathVariable Long projectId) {
        log.info("Fetching timeline for project: {}", projectId);
        List<ProjectTimeline> timelines = projectTimelineService.getProjectTimeline(projectId);
        return ResponseEntity.ok(ApiResponse.success(timelines, "Timeline retrieved successfully"));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<ApiResponse<List<ProjectTimeline>>> getTimelineByStatus(@PathVariable Long projectId,
                                                                                  @PathVariable ProjectTimeline.MilestoneStatus status) {
        log.info("Fetching timelines for project {} with status: {}", projectId, status);
        List<ProjectTimeline> timelines = projectTimelineService.getTimelineByStatus(projectId, status);
        return ResponseEntity.ok(ApiResponse.success(timelines, "Timelines retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectTimeline>> updateTimeline(@PathVariable Long id, 
                                                                       @Valid @RequestBody ProjectTimeline updates) {
        log.info("Updating timeline with ID: {}", id);
        ProjectTimeline updated = projectTimelineService.updateTimeline(id, updates);
        return ResponseEntity.ok(ApiResponse.success(updated, "Timeline updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteTimeline(@PathVariable Long id) {
        log.info("Deleting timeline with ID: {}", id);
        projectTimelineService.deleteTimeline(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Timeline deleted successfully"));
    }
}
