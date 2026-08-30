package com.vertex.projects.repository.core;

import com.vertex.projects.model.core.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Project entity
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    List<Project> findByProjectManagerId(Long projectManagerId);
    List<Project> findByStatus(Project.ProjectStatus status);
    List<Project> findByProjectType(Project.ProjectType projectType);
    Optional<Project> findByIdAndActive(Long id, Boolean active);
    List<Project> findByActiveAndStatus(Boolean active, Project.ProjectStatus status);
    List<Project> findByActive(Boolean active);
}
