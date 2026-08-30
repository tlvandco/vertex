package com.vertex.projects.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating inventory item
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(min = 3, max = 255, message = "Item name must be between 3 and 255 characters")
    private String name;

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantityOnHand;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    private Long locationId;

    private Long projectId;

    @Size(max = 50, message = "Unit must not exceed 50 characters")
    private String unit;

    @Pattern(regexp = "^(AVAILABLE|IN_USE|DAMAGED|ARCHIVED)$", message = "Invalid status")
    private String status;
}
