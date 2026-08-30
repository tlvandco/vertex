package com.vertex.projects.controller.financial;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.ExpenseRequest;
import com.vertex.projects.dto.response.ExpenseResponse;
import com.vertex.projects.service.financial.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Expense management
 * Provides endpoints for expense tracking and approval
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/v2/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Create a new expense
     * POST /api/v2/expenses
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        log.info("POST /api/v2/expenses - Creating expense");
        ExpenseResponse response = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Expense created successfully"));
    }

    /**
     * Get expense by ID
     * GET /api/v2/expenses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(@PathVariable Long id) {
        log.info("GET /api/v2/expenses/{} - Fetching expense", id);
        ExpenseResponse response = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense retrieved successfully"));
    }

    /**
     * Get all expenses for a project
     * GET /api/v2/expenses?projectId={projectId}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByProject(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/expenses - Fetching expenses for project: {}", projectId);
        List<ExpenseResponse> response = expenseService.getExpensesByProjectId(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Expenses retrieved successfully"));
    }

    /**
     * Get expenses by status
     * GET /api/v2/expenses/status?projectId={projectId}&status={status}
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByStatus(
            @RequestParam Long projectId,
            @RequestParam String status) {
        log.info("GET /api/v2/expenses/status - Fetching expenses with status: {}", status);
        List<ExpenseResponse> response = expenseService.getExpensesByStatus(projectId, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Expenses retrieved successfully"));
    }

    /**
     * Update expense
     * PUT /api/v2/expenses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        log.info("PUT /api/v2/expenses/{} - Updating expense", id);
        ExpenseResponse response = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense updated successfully"));
    }

    /**
     * Approve expense
     * POST /api/v2/expenses/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ExpenseResponse>> approveExpense(
            @PathVariable Long id,
            @RequestParam Long approvedBy) {
        log.info("POST /api/v2/expenses/{}/approve - Approving expense", id);
        ExpenseResponse response = expenseService.approveExpense(id, approvedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense approved successfully"));
    }

    /**
     * Reject expense
     * POST /api/v2/expenses/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ExpenseResponse>> rejectExpense(@PathVariable Long id) {
        log.info("POST /api/v2/expenses/{}/reject - Rejecting expense", id);
        ExpenseResponse response = expenseService.rejectExpense(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Expense rejected successfully"));
    }

    /**
     * Delete expense
     * DELETE /api/v2/expenses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteExpense(@PathVariable Long id) {
        log.info("DELETE /api/v2/expenses/{} - Deleting expense", id);
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success(true, "Expense deleted successfully"));
    }
}
