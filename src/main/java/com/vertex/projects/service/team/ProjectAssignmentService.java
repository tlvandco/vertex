package com.vertex.projects.service.team;

import com.vertex.projects.model.team.ProjectAssignment;
import com.vertex.projects.repository.team.ProjectAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for ProjectAssignment management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository projectAssignmentRepository;

    /**
     * Assign user to project
     */
    public ProjectAssignment createAssignment(ProjectAssignment assignment) {
        log.info("Assigning user {} to project {} with role {}", 
            assignment.getUserId(), assignment.getProjectId(), assignment.getRole());
        return projectAssignmentRepository.save(assignment);
    }

    /**
     * Get assignment by ID
     */
    public Optional<ProjectAssignment> getAssignmentById(Long id) {
        log.debug("Fetching assignment with ID: {}", id);
        return projectAssignmentRepository.findById(id);
    }

    /**
     * Get all assignments for a project
     */
    public List<ProjectAssignment> getProjectAssignments(Long projectId) {
        log.debug("Fetching assignments for project: {}", projectId);
        return projectAssignmentRepository.findByProjectId(projectId);
    }

    /**
     * Get all assignments for a user
     */
    public List<ProjectAssignment> getUserAssignments(Long userId) {
        log.debug("Fetching assignments for user: {}", userId);
        return projectAssignmentRepository.findByUserId(userId);
    }

    /**
     * Get active assignments for a user
     */
    public List<ProjectAssignment> getActiveUserAssignments(Long userId) {
        log.debug("Fetching active assignments for user: {}", userId);
        return projectAssignmentRepository.findByUserIdAndStatus(userId, ProjectAssignment.AssignmentStatus.ACTIVE);
    }

    /**
     * Update assignment
     */
    public ProjectAssignment updateAssignment(Long id, ProjectAssignment updates) {
        log.info("Updating assignment with ID: {}", id);
        return projectAssignmentRepository.findById(id).map(assignment -> {
            if (updates.getRole() != null) assignment.setRole(updates.getRole());
            if (updates.getStatus() != null) assignment.setStatus(updates.getStatus());
            return projectAssignmentRepository.save(assignment);
        }).orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    /**
     * Delete assignment
     */
    public void deleteAssignment(Long id) {
        log.info("Deleting assignment with ID: {}", id);
        projectAssignmentRepository.deleteById(id);
    }

    /**
     * Mark assignment as completed
     */
    public ProjectAssignment completeAssignment(Long id) {
        log.info("Marking assignment {} as completed", id);
        return projectAssignmentRepository.findById(id).map(assignment -> {
            assignment.setStatus(ProjectAssignment.AssignmentStatus.COMPLETED);
            return projectAssignmentRepository.save(assignment);
        }).orElseThrow(() -> new RuntimeException("Assignment not found"));
    }
}
