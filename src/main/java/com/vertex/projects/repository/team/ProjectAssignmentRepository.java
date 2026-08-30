package com.vertex.projects.repository.team;

import com.vertex.projects.model.team.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for ProjectAssignment entity
 */
@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {
    List<ProjectAssignment> findByProjectId(Long projectId);
    List<ProjectAssignment> findByUserId(Long userId);
    List<ProjectAssignment> findByProjectIdAndStatus(Long projectId, ProjectAssignment.AssignmentStatus status);
    List<ProjectAssignment> findByUserIdAndStatus(Long userId, ProjectAssignment.AssignmentStatus status);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
}
