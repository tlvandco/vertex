package com.vertex.projects.repository;

import com.vertex.projects.model.financial.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Expense entity
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find all expenses for a project
     */
    List<Expense> findByProjectId(Long projectId);

    /**
     * Find expenses by project and status
     */
    @Query("SELECT e FROM Expense e WHERE e.projectId = :projectId AND e.status = :status")
    List<Expense> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") String status);

    /**
     * Find expenses by submitted user
     */
    List<Expense> findBySubmittedBy(Long userId);

    /**
     * Find expenses within date range
     */
    @Query("SELECT e FROM Expense e WHERE e.projectId = :projectId AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByProjectIdAndDateRange(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
