package com.vertex.projects.service.core;

import com.vertex.projects.model.core.Project;
import com.vertex.projects.repository.core.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for Project management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;

    /**
     * Create a new project
     */
    public Project createProject(Project project) {
        log.info("Creating new project: {}", project.getName());
        return projectRepository.save(project);
    }

    /**
     * Get project by ID
     */
    public Optional<Project> getProjectById(Long id) {
        log.debug("Fetching project with ID: {}", id);
        return projectRepository.findByIdAndActive(id, true);
    }

    /**
     * Get all active projects
     */
    public List<Project> getAllProjects() {
        log.debug("Fetching all active projects");
        return projectRepository.findAll();
    }

    /**
     * Get projects by client
     */
    public List<Project> getProjectsByClient(Long clientId) {
        log.debug("Fetching projects for client: {}", clientId);
        return projectRepository.findByClientId(clientId);
    }

    /**
     * Get projects by project manager
     */
    public List<Project> getProjectsByManager(Long managerId) {
        log.debug("Fetching projects for manager: {}", managerId);
        return projectRepository.findByProjectManagerId(managerId);
    }

    /**
     * Get projects by status
     */
    public List<Project> getProjectsByStatus(Project.ProjectStatus status) {
        log.debug("Fetching projects with status: {}", status);
        return projectRepository.findByActiveAndStatus(true, status);
    }

    /**
     * Update project
     */
    public Project updateProject(Long id, Project projectUpdates) {
        log.info("Updating project with ID: {}", id);
        return projectRepository.findById(id).map(project -> {
            if (projectUpdates.getName() != null) project.setName(projectUpdates.getName());
            if (projectUpdates.getDescription() != null) project.setDescription(projectUpdates.getDescription());
            if (projectUpdates.getStatus() != null) project.setStatus(projectUpdates.getStatus());
            if (projectUpdates.getBudget() != null) project.setBudget(projectUpdates.getBudget());
            if (projectUpdates.getProgress() != null) project.setProgress(projectUpdates.getProgress());
            return projectRepository.save(project);
        }).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    /**
     * Delete project (soft delete)
     */
    public void deleteProject(Long id) {
        log.info("Deleting project with ID: {}", id);
        projectRepository.findById(id).ifPresent(project -> {
            project.setActive(false);
            projectRepository.save(project);
        });
    }

    /**
     * Update project status
     */
    public Project updateProjectStatus(Long id, Project.ProjectStatus status) {
        log.info("Updating project {} status to: {}", id, status);
        return projectRepository.findById(id).map(project -> {
            project.setStatus(status);
            return projectRepository.save(project);
        }).orElseThrow(() -> new RuntimeException("Project not found"));
    }
}
