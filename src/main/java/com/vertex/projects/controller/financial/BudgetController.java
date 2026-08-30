package com.vertex.projects.controller.financial;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.BudgetRequest;
import com.vertex.projects.dto.response.BudgetResponse;
import com.vertex.projects.service.financial.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Budget management
 * Provides endpoints for budget CRUD operations
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/v2/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Create a new budget
     * POST /api/v2/budgets
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(@Valid @RequestBody BudgetRequest request) {
        log.info("POST /api/v2/budgets - Creating budget");
        BudgetResponse response = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "Budget created successfully"));
    }

    /**
     * Get budget by ID
     * GET /api/v2/budgets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(@PathVariable Long id) {
        log.info("GET /api/v2/budgets/{} - Fetching budget", id);
        BudgetResponse response = budgetService.getBudgetById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Budget retrieved successfully"));
    }

    /**
     * Get all budgets for a project
     * GET /api/v2/budgets?projectId={projectId}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetsByProject(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/budgets - Fetching budgets for project: {}", projectId);
        List<BudgetResponse> response = budgetService.getBudgetsByProjectId(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Budgets retrieved successfully"));
    }

    /**
     * Get active budgets for a project
     * GET /api/v2/budgets/active?projectId={projectId}
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getActiveBudgets(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/budgets/active - Fetching active budgets for project: {}", projectId);
        List<BudgetResponse> response = budgetService.getActiveBudgets(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Active budgets retrieved successfully"));
    }

    /**
     * Update budget
     * PUT /api/v2/budgets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        log.info("PUT /api/v2/budgets/{} - Updating budget", id);
        BudgetResponse response = budgetService.updateBudget(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Budget updated successfully"));
    }

    /**
     * Delete budget
     * DELETE /api/v2/budgets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteBudget(@PathVariable Long id) {
        log.info("DELETE /api/v2/budgets/{} - Deleting budget", id);
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(ApiResponse.success(true, "Budget deleted successfully"));
    }

    /**
     * Get budget variance analysis
     * GET /api/v2/budgets/{id}/variance
     */
    @GetMapping("/{id}/variance")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetVariance(@PathVariable Long id) {
        log.info("GET /api/v2/budgets/{}/variance - Fetching variance analysis", id);
        BudgetResponse response = budgetService.getBudgetVariance(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Budget variance retrieved successfully"));
    }
}
