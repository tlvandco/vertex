package com.vertex.projects.dto.financial;

import com.vertex.projects.model.financial.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    @NotNull
    private Long invoiceId;

    @NotNull
    private BigDecimal amount;

    private LocalDate paymentDate;

    @NotNull
    private PaymentMethod paymentMethod;

    private String referenceNumber;
    private String notes;
}
