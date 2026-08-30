package com.vertex.projects.service.financial;

import com.vertex.projects.dto.request.ExpenseRequest;
import com.vertex.projects.dto.response.ExpenseResponse;
import com.vertex.projects.exception.ResourceNotFoundException;
import com.vertex.projects.model.financial.Expense;
import com.vertex.projects.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Expense management
 * Handles expense tracking and approval workflows
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    /**
     * Create a new expense
     */
    public ExpenseResponse createExpense(ExpenseRequest request) {
        log.info("Creating expense for project: {}", request.getProjectId());

        Expense expense = Expense.builder()
                .projectId(request.getProjectId())
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .status("PENDING")
                .notes(request.getNotes())
                .build();

        expense = expenseRepository.save(expense);
        log.info("Expense created with ID: {}", expense.getId());

        return mapToResponse(expense);
    }

    /**
     * Get expense by ID
     */
    public ExpenseResponse getExpenseById(Long id) {
        log.info("Fetching expense with ID: {}", id);

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        return mapToResponse(expense);
    }

    /**
     * Get all expenses for a project
     */
    public List<ExpenseResponse> getExpensesByProjectId(Long projectId) {
        log.info("Fetching expenses for project: {}", projectId);

        List<Expense> expenses = expenseRepository.findByProjectId(projectId);
        return expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get expenses by status
     */
    public List<ExpenseResponse> getExpensesByStatus(Long projectId, String status) {
        log.info("Fetching expenses for project: {} with status: {}", projectId, status);

        List<Expense> expenses = expenseRepository.findByProjectIdAndStatus(projectId, status);
        return expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update expense
     */
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        log.info("Updating expense with ID: {}", id);

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());

        expense = expenseRepository.save(expense);
        log.info("Expense updated with ID: {}", id);

        return mapToResponse(expense);
    }

    /**
     * Approve expense
     */
    public ExpenseResponse approveExpense(Long id, Long approvedBy) {
        log.info("Approving expense with ID: {} by user: {}", id, approvedBy);

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        expense.setStatus("APPROVED");
        expense.setApprovedBy(approvedBy);

        expense = expenseRepository.save(expense);
        log.info("Expense approved with ID: {}", id);

        return mapToResponse(expense);
    }

    /**
     * Reject expense
     */
    public ExpenseResponse rejectExpense(Long id) {
        log.info("Rejecting expense with ID: {}", id);

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + id));

        expense.setStatus("REJECTED");

        expense = expenseRepository.save(expense);
        log.info("Expense rejected with ID: {}", id);

        return mapToResponse(expense);
    }

    /**
     * Delete expense
     */
    public void deleteExpense(Long id) {
        log.info("Deleting expense with ID: {}", id);

        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with ID: " + id);
        }

        expenseRepository.deleteById(id);
        log.info("Expense deleted with ID: {}", id);
    }

    /**
     * Map Expense entity to response DTO
     */
    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .projectId(expense.getProjectId())
                .categoryId(expense.getCategoryId())
                .amount(expense.getAmount())
                .currency(expense.getCurrency())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .status(expense.getStatus())
                .submittedBy(expense.getSubmittedBy())
                .approvedBy(expense.getApprovedBy())
                .notes(expense.getNotes())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
