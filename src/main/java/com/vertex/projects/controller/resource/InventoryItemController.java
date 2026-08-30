package com.vertex.projects.controller.resource;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.InventoryItemRequest;
import com.vertex.projects.dto.response.InventoryItemResponse;
import com.vertex.projects.service.resource.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Inventory Item management
 * Provides endpoints for materials and equipment tracking
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/v2/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    /**
     * Create a new inventory item
     * POST /api/v2/inventory
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createInventoryItem(
            @Valid @RequestBody InventoryItemRequest request) {
        log.info("POST /api/v2/inventory - Creating inventory item");
        InventoryItemResponse response = inventoryItemService.createInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "Inventory item created successfully"));
    }

    /**
     * Get inventory item by ID
     * GET /api/v2/inventory/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getInventoryItemById(@PathVariable Long id) {
        log.info("GET /api/v2/inventory/{} - Fetching inventory item", id);
        InventoryItemResponse response = inventoryItemService.getInventoryItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory item retrieved successfully"));
    }

    /**
     * Get all inventory for a project
     * GET /api/v2/inventory?projectId={projectId}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getInventoryByProject(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/inventory - Fetching inventory for project: {}", projectId);
        List<InventoryItemResponse> response = inventoryItemService.getInventoryByProjectId(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory items retrieved successfully"));
    }

    /**
     * Get inventory by category
     * GET /api/v2/inventory/category?category={category}
     */
    @GetMapping("/category")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getInventoryByCategory(
            @RequestParam String category) {
        log.info("GET /api/v2/inventory/category - Fetching inventory for category: {}", category);
        List<InventoryItemResponse> response = inventoryItemService.getInventoryByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory items retrieved successfully"));
    }

    /**
     * Get low stock items
     * GET /api/v2/inventory/low-stock?projectId={projectId}
     */
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getLowStockItems(
            @RequestParam Long projectId) {
        log.info("GET /api/v2/inventory/low-stock - Fetching low stock items");
        List<InventoryItemResponse> response = inventoryItemService.getLowStockItems(projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Low stock items retrieved successfully"));
    }

    /**
     * Update inventory item
     * PUT /api/v2/inventory/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> updateInventoryItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request) {
        log.info("PUT /api/v2/inventory/{} - Updating inventory item", id);
        InventoryItemResponse response = inventoryItemService.updateInventoryItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory item updated successfully"));
    }

    /**
     * Allocate inventory to a task
     * POST /api/v2/inventory/{id}/allocate
     */
    @PostMapping("/{id}/allocate")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> allocateInventory(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        log.info("POST /api/v2/inventory/{}/allocate - Allocating {} units", id, quantity);
        InventoryItemResponse response = inventoryItemService.allocateInventory(id, quantity);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory allocated successfully"));
    }

    /**
     * Delete inventory item
     * DELETE /api/v2/inventory/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteInventoryItem(@PathVariable Long id) {
        log.info("DELETE /api/v2/inventory/{} - Deleting inventory item", id);
        inventoryItemService.deleteInventoryItem(id);
        return ResponseEntity.ok(ApiResponse.success(true, "Inventory item deleted successfully"));
    }
}
