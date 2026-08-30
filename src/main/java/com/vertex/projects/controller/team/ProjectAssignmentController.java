package com.vertex.projects.controller.team;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.team.ProjectAssignment;
import com.vertex.projects.service.team.ProjectAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for Project Assignment Management
 */
@RestController
@RequestMapping("/api/v2/assignments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProjectAssignmentController {

    private final ProjectAssignmentService projectAssignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectAssignment>> createAssignment(@Valid @RequestBody ProjectAssignment assignment) {
        log.info("Creating assignment for user {} to project {}", assignment.getUserId(), assignment.getProjectId());
        ProjectAssignment created = projectAssignmentService.createAssignment(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Assignment created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectAssignment>> getAssignment(@PathVariable Long id) {
        log.info("Fetching assignment with ID: {}", id);
        return projectAssignmentService.getAssignmentById(id)
            .map(assignment -> ResponseEntity.ok(ApiResponse.success(assignment, "Assignment retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<ProjectAssignment>>> getProjectAssignments(@PathVariable Long projectId) {
        log.info("Fetching assignments for project: {}", projectId);
        List<ProjectAssignment> assignments = projectAssignmentService.getProjectAssignments(projectId);
        return ResponseEntity.ok(ApiResponse.success(assignments, "Project assignments retrieved successfully"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ProjectAssignment>>> getUserAssignments(@PathVariable Long userId) {
        log.info("Fetching assignments for user: {}", userId);
        List<ProjectAssignment> assignments = projectAssignmentService.getUserAssignments(userId);
        return ResponseEntity.ok(ApiResponse.success(assignments, "User assignments retrieved successfully"));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<ProjectAssignment>>> getActiveUserAssignments(@PathVariable Long userId) {
        log.info("Fetching active assignments for user: {}", userId);
        List<ProjectAssignment> assignments = projectAssignmentService.getActiveUserAssignments(userId);
        return ResponseEntity.ok(ApiResponse.success(assignments, "Active assignments retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectAssignment>> updateAssignment(@PathVariable Long id,
                                                                          @Valid @RequestBody ProjectAssignment updates) {
        log.info("Updating assignment with ID: {}", id);
        ProjectAssignment updated = projectAssignmentService.updateAssignment(id, updates);
        return ResponseEntity.ok(ApiResponse.success(updated, "Assignment updated successfully"));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ProjectAssignment>> completeAssignment(@PathVariable Long id) {
        log.info("Marking assignment {} as completed", id);
        ProjectAssignment updated = projectAssignmentService.completeAssignment(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Assignment marked as completed"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteAssignment(@PathVariable Long id) {
        log.info("Deleting assignment with ID: {}", id);
        projectAssignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Assignment deleted successfully"));
    }
}
