package com.vertex.projects.repository;

import com.vertex.projects.model.core.ChangeOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChangeOrder entity
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Repository
public interface ChangeOrderRepository extends JpaRepository<ChangeOrder, Long> {

    /**
     * Find all change orders for a project
     */
    List<ChangeOrder> findByProjectId(Long projectId);

    /**
     * Find pending change orders
     */
    @Query("SELECT co FROM ChangeOrder co WHERE co.projectId = :projectId AND co.status IN ('DRAFT', 'SUBMITTED')")
    List<ChangeOrder> findPendingByProjectId(@Param("projectId") Long projectId);

    /**
     * Find approved change orders
     */
    @Query("SELECT co FROM ChangeOrder co WHERE co.projectId = :projectId AND co.status = 'APPROVED'")
    List<ChangeOrder> findApprovedByProjectId(@Param("projectId") Long projectId);

    /**
     * Find by status
     */
    List<ChangeOrder> findByStatus(String status);
}
