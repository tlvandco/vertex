package com.vertex.projects.repository;

import com.vertex.projects.model.financial.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Budget entity
 * Provides database operations for budget management
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets for a specific project
     */
    List<Budget> findByProjectId(Long projectId);

    /**
     * Find active budgets for a project
     */
    @Query("SELECT b FROM Budget b WHERE b.projectId = :projectId AND b.status = 'ACTIVE'")
    List<Budget> findActiveByProjectId(@Param("projectId") Long projectId);

    /**
     * Find budget by project and name
     */
    Optional<Budget> findByProjectIdAndName(Long projectId, String name);
}
