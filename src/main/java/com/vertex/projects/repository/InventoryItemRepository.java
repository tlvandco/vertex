package com.vertex.projects.repository;

import com.vertex.projects.model.resource.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for InventoryItem entity
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Find inventory items by project
     */
    List<InventoryItem> findByProjectId(Long projectId);

    /**
     * Find items by category
     */
    List<InventoryItem> findByCategory(String category);

    /**
     * Find items by SKU
     */
    Optional<InventoryItem> findBySku(String sku);

    /**
     * Find low stock items
     */
    @Query("SELECT ii FROM InventoryItem ii WHERE ii.quantityOnHand <= ii.reorderLevel AND ii.projectId = :projectId")
    List<InventoryItem> findLowStockItems(@Param("projectId") Long projectId);

    /**
     * Find items in a specific location
     */
    List<InventoryItem> findByLocationId(Long locationId);

    /**
     * Find items by status
     */
    List<InventoryItem> findByStatus(String status);
}
