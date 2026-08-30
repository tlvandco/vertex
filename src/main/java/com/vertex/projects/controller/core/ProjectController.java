package com.vertex.projects.controller.core;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.core.Project;
import com.vertex.projects.service.core.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for Project Management
 */
@RestController
@RequestMapping("/api/v2/projects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@Valid @RequestBody Project project) {
        log.info("Creating new project: {}", project.getName());
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdProject, "Project created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProject(@PathVariable Long id) {
        log.info("Fetching project with ID: {}", id);
        return projectService.getProjectById(id)
            .map(project -> ResponseEntity.ok(ApiResponse.success(project, "Project retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        log.info("Fetching all projects");
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(ApiResponse.success(projects, "Projects retrieved successfully"));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<Project>>> getProjectsByClient(@PathVariable Long clientId) {
        log.info("Fetching projects for client: {}", clientId);
        List<Project> projects = projectService.getProjectsByClient(clientId);
        return ResponseEntity.ok(ApiResponse.success(projects, "Client projects retrieved successfully"));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<ApiResponse<List<Project>>> getProjectsByManager(@PathVariable Long managerId) {
        log.info("Fetching projects for manager: {}", managerId);
        List<Project> projects = projectService.getProjectsByManager(managerId);
        return ResponseEntity.ok(ApiResponse.success(projects, "Manager projects retrieved successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Project>>> getProjectsByStatus(@PathVariable Project.ProjectStatus status) {
        log.info("Fetching projects with status: {}", status);
        List<Project> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(projects, "Projects retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> updateProject(@PathVariable Long id, @Valid @RequestBody Project projectUpdates) {
        log.info("Updating project with ID: {}", id);
        Project updatedProject = projectService.updateProject(id, projectUpdates);
        return ResponseEntity.ok(ApiResponse.success(updatedProject, "Project updated successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Project>> updateProjectStatus(@PathVariable Long id, 
                                                                    @RequestParam Project.ProjectStatus status) {
        log.info("Updating project {} status to: {}", id, status);
        Project updatedProject = projectService.updateProjectStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updatedProject, "Project status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProject(@PathVariable Long id) {
        log.info("Deleting project with ID: {}", id);
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }
}
