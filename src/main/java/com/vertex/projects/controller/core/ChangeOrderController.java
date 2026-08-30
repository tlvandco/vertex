package com.vertex.projects.controller.core;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.ChangeOrderRequest;
import com.vertex.projects.dto.response.ChangeOrderResponse;
import com.vertex.projects.service.core.ChangeOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Change Order management
 * Provides endpoints for project modifications and approvals
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/v2/change-orders")
@RequiredArgsConstructor
@Slf4j
public class ChangeOrderController {

    private final ChangeOrderService changeOrderService;

    /**
     * Create a new change order
     * POST /api/v2/change-orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChangeOrderResponse>> createChangeOrder(
            @Valid @RequestBody ChangeOrderRequest request) {
        log.info("POST /api/v2/change-orders - Creating change order");
        ChangeOrderResponse response = changeOrderService.createChangeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Change order created successfully"));
    }

    /**
     * Get change order by ID
     * GET /api/v2/change-orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChangeOrderResponse>> getChangeOrderById(@PathVariable Long id) {
        log.info("GET /api/v2/change-orders/{} - Fetching change order", id);
        ChangeOrderResponse response = changeOrderService.getChangeOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Change order retrieved successfully"));
    }

    /**
     * Get all change orders for a project
     * GET /api/v2/change-orders?projectId={projectId}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChangeOrderResponse>>> getChangeOrdersByProject(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/change-orders - Fetching change orders for project: {}", projectId);
        List<ChangeOrderResponse> response = changeOrderService.getChangeOrdersByProjectId(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Change orders retrieved successfully"));
    }

    /**
     * Get pending change orders
     * GET /api/v2/change-orders/pending?projectId={projectId}
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ChangeOrderResponse>>> getPendingChangeOrders(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/change-orders/pending - Fetching pending change orders");
        List<ChangeOrderResponse> response = changeOrderService.getPendingChangeOrders(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Pending change orders retrieved successfully"));
    }

    /**
     * Submit change order for approval
     * POST /api/v2/change-orders/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<ChangeOrderResponse>> submitForApproval(@PathVariable Long id) {
        log.info("POST /api/v2/change-orders/{}/submit - Submitting change order", id);
        ChangeOrderResponse response = changeOrderService.submitForApproval(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Change order submitted for approval"));
    }

    /**
     * Approve change order
     * POST /api/v2/change-orders/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ChangeOrderResponse>> approveChangeOrder(
            @PathVariable Long id,
            @RequestParam Long approvedBy) {
        log.info("POST /api/v2/change-orders/{}/approve - Approving change order", id);
        ChangeOrderResponse response = changeOrderService.approveChangeOrder(id, approvedBy);
        return ResponseEntity.ok(ApiResponse.success(response, "Change order approved successfully"));
    }

    /**
     * Reject change order
     * POST /api/v2/change-orders/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ChangeOrderResponse>> rejectChangeOrder(@PathVariable Long id) {
        log.info("POST /api/v2/change-orders/{}/reject - Rejecting change order", id);
        ChangeOrderResponse response = changeOrderService.rejectChangeOrder(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Change order rejected successfully"));
    }

    /**
     * Delete change order
     * DELETE /api/v2/change-orders/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteChangeOrder(@PathVariable Long id) {
        log.info("DELETE /api/v2/change-orders/{} - Deleting change order", id);
        changeOrderService.deleteChangeOrder(id);
        return ResponseEntity.ok(ApiResponse.success(true, "Change order deleted successfully"));
    }
}
