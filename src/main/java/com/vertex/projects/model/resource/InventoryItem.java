package com.vertex.projects.model.resource;

import com.vertex.projects.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * InventoryItem entity representing materials and equipment
 * Tracks inventory levels, locations, and allocation
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "category", length = 100)
    private String category; // MATERIAL, EQUIPMENT, TOOL, etc.

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "quantity_on_hand")
    private Integer quantityOnHand;

    @Column(name = "reorder_level")
    private Integer reorderLevel;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "unit", length = 50)
    private String unit; // PIECE, KG, METER, etc.

    @Column(name = "status", length = 50)
    private String status; // AVAILABLE, IN_USE, DAMAGED, ARCHIVED

    /**
     * Check if item is below reorder level
     */
    public Boolean isLowStock() {
        if (quantityOnHand == null || reorderLevel == null) {
            return false;
        }
        return quantityOnHand <= reorderLevel;
    }

    /**
     * Calculate total value
     */
    public BigDecimal getTotalValue() {
        if (unitPrice == null || quantityOnHand == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(new BigDecimal(quantityOnHand));
    }
}
