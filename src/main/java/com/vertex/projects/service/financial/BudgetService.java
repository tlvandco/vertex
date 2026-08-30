package com.vertex.projects.service.financial;

import com.vertex.projects.dto.request.BudgetRequest;
import com.vertex.projects.dto.response.BudgetResponse;
import com.vertex.projects.exception.ResourceNotFoundException;
import com.vertex.projects.model.financial.Budget;
import com.vertex.projects.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Budget management
 * Handles budget creation, updates, and financial tracking
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    /**
     * Create a new budget
     */
    public BudgetResponse createBudget(BudgetRequest request) {
        log.info("Creating budget for project: {}", request.getProjectId());

        Budget budget = Budget.builder()
                .projectId(request.getProjectId())
                .name(request.getName())
                .description(request.getDescription())
                .totalBudget(request.getTotalBudget())
                .spentAmount(request.getSpentAmount() != null ? request.getSpentAmount() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        budget = budgetRepository.save(budget);
        log.info("Budget created with ID: {}", budget.getId());

        return mapToResponse(budget);
    }

    /**
     * Get budget by ID
     */
    public BudgetResponse getBudgetById(Long id) {
        log.info("Fetching budget with ID: {}", id);

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        return mapToResponse(budget);
    }

    /**
     * Get all budgets for a project
     */
    public List<BudgetResponse> getBudgetsByProjectId(Long projectId) {
        log.info("Fetching budgets for project: {}", projectId);

        List<Budget> budgets = budgetRepository.findByProjectId(projectId);
        return budgets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update budget
     */
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        log.info("Updating budget with ID: {}", id);

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        budget.setName(request.getName());
        budget.setDescription(request.getDescription());
        budget.setTotalBudget(request.getTotalBudget());
        budget.setSpentAmount(request.getSpentAmount());
        budget.setCurrency(request.getCurrency());
        budget.setStatus(request.getStatus());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());

        budget = budgetRepository.save(budget);
        log.info("Budget updated with ID: {}", id);

        return mapToResponse(budget);
    }

    /**
     * Delete budget
     */
    public void deleteBudget(Long id) {
        log.info("Deleting budget with ID: {}", id);

        if (!budgetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Budget not found with ID: " + id);
        }

        budgetRepository.deleteById(id);
        log.info("Budget deleted with ID: {}", id);
    }

    /**
     * Get budget variance analysis
     */
    public BudgetResponse getBudgetVariance(Long id) {
        return getBudgetById(id);
    }

    /**
     * Get active budgets for a project
     */
    public List<BudgetResponse> getActiveBudgets(Long projectId) {
        log.info("Fetching active budgets for project: {}", projectId);

        List<Budget> budgets = budgetRepository.findActiveByProjectId(projectId);
        return budgets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Budget entity to response DTO
     */
    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .projectId(budget.getProjectId())
                .name(budget.getName())
                .description(budget.getDescription())
                .totalBudget(budget.getTotalBudget())
                .spentAmount(budget.getSpentAmount())
                .remainingBudget(budget.getRemainingBudget())
                .utilizationPercentage(budget.getUtilizationPercentage())
                .currency(budget.getCurrency())
                .status(budget.getStatus())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .createdBy(budget.getCreatedBy())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
