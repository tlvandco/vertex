package com.vertex.projects.dto.financial;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceRequest {
    @NotBlank
    private String invoiceNumber;

    private Long projectId;
    private Long clientId;

    @NotNull
    private BigDecimal amount;

    private LocalDate issuedDate;
    private LocalDate dueDate;
    private String description;
}
