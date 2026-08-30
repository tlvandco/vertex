package com.vertex.projects.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for InventoryItem
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {

    private Long id;
    private String name;
    private String sku;
    private String category;
    private String description;
    private BigDecimal unitPrice;
    private Integer quantityOnHand;
    private Integer reorderLevel;
    private Boolean isLowStock;
    private BigDecimal totalValue;
    private Long locationId;
    private Long projectId;
    private String unit;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
