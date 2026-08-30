package com.vertex.projects.service.resource;

import com.vertex.projects.dto.request.InventoryItemRequest;
import com.vertex.projects.dto.response.InventoryItemResponse;
import com.vertex.projects.exception.ResourceNotFoundException;
import com.vertex.projects.model.resource.InventoryItem;
import com.vertex.projects.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Inventory Item management
 * Handles materials, equipment, and assets tracking
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    /**
     * Create a new inventory item
     */
    public InventoryItemResponse createInventoryItem(InventoryItemRequest request) {
        log.info("Creating inventory item: {}", request.getName());

        InventoryItem item = InventoryItem.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .quantityOnHand(request.getQuantityOnHand())
                .reorderLevel(request.getReorderLevel())
                .locationId(request.getLocationId())
                .projectId(request.getProjectId())
                .unit(request.getUnit() != null ? request.getUnit() : "PIECE")
                .status(request.getStatus() != null ? request.getStatus() : "AVAILABLE")
                .build();

        item = inventoryItemRepository.save(item);
        log.info("Inventory item created with ID: {}", item.getId());

        return mapToResponse(item);
    }

    /**
     * Get inventory item by ID
     */
    public InventoryItemResponse getInventoryItemById(Long id) {
        log.info("Fetching inventory item with ID: {}", id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));

        return mapToResponse(item);
    }

    /**
     * Get all inventory items for a project
     */
    public List<InventoryItemResponse> getInventoryByProjectId(Long projectId) {
        log.info("Fetching inventory items for project: {}", projectId);

        List<InventoryItem> items = inventoryItemRepository.findByProjectId(projectId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get inventory items by category
     */
    public List<InventoryItemResponse> getInventoryByCategory(String category) {
        log.info("Fetching inventory items for category: {}", category);

        List<InventoryItem> items = inventoryItemRepository.findByCategory(category);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get low stock items
     */
    public List<InventoryItemResponse> getLowStockItems(Long projectId) {
        log.info("Fetching low stock items for project: {}", projectId);

        List<InventoryItem> items = inventoryItemRepository.findLowStockItems(projectId);
        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update inventory item
     */
    public InventoryItemResponse updateInventoryItem(Long id, InventoryItemRequest request) {
        log.info("Updating inventory item with ID: {}", id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));

        item.setName(request.getName());
        item.setSku(request.getSku());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setUnitPrice(request.getUnitPrice());
        item.setQuantityOnHand(request.getQuantityOnHand());
        item.setReorderLevel(request.getReorderLevel());
        item.setLocationId(request.getLocationId());
        item.setUnit(request.getUnit());
        item.setStatus(request.getStatus());

        item = inventoryItemRepository.save(item);
        log.info("Inventory item updated with ID: {}", id);

        return mapToResponse(item);
    }

    /**
     * Allocate inventory to a task
     */
    public InventoryItemResponse allocateInventory(Long id, Integer quantity) {
        log.info("Allocating {} units of inventory item: {}", quantity, id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + id));

        if (item.getQuantityOnHand() < quantity) {
            throw new IllegalArgumentException("Insufficient inventory. Available: " + item.getQuantityOnHand());
        }

        item.setQuantityOnHand(item.getQuantityOnHand() - quantity);
        item.setStatus("IN_USE");

        item = inventoryItemRepository.save(item);
        log.info("Inventory allocated successfully for item: {}", id);

        return mapToResponse(item);
    }

    /**
     * Delete inventory item
     */
    public void deleteInventoryItem(Long id) {
        log.info("Deleting inventory item with ID: {}", id);

        if (!inventoryItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found with ID: " + id);
        }

        inventoryItemRepository.deleteById(id);
        log.info("Inventory item deleted with ID: {}", id);
    }

    /**
     * Map InventoryItem entity to response DTO
     */
    private InventoryItemResponse mapToResponse(InventoryItem item) {
        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .sku(item.getSku())
                .category(item.getCategory())
                .description(item.getDescription())
                .unitPrice(item.getUnitPrice())
                .quantityOnHand(item.getQuantityOnHand())
                .reorderLevel(item.getReorderLevel())
                .isLowStock(item.isLowStock())
                .totalValue(item.getTotalValue())
                .locationId(item.getLocationId())
                .projectId(item.getProjectId())
                .unit(item.getUnit())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
