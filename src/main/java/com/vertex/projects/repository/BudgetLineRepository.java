package com.vertex.projects.repository;

import com.vertex.projects.model.financial.BudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for BudgetLine entity
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Repository
public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {

    /**
     * Find all budget lines for a specific budget
     */
    List<BudgetLine> findByBudgetId(Long budgetId);

    /**
     * Find budget lines by category
     */
    @Query("SELECT bl FROM BudgetLine bl WHERE bl.budgetId = :budgetId AND bl.category = :category")
    List<BudgetLine> findByBudgetIdAndCategory(@Param("budgetId") Long budgetId, @Param("category") String category);
}
