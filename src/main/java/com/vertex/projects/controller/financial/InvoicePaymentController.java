package com.vertex.projects.controller.financial;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.financial.InvoiceRequest;
import com.vertex.projects.dto.financial.PaymentRequest;
import com.vertex.projects.model.financial.Invoice;
import com.vertex.projects.model.financial.InvoiceStatus;
import com.vertex.projects.model.financial.Payment;
import com.vertex.projects.service.financial.FinancialService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/invoices")
public class InvoicePaymentController {

    private static final Logger logger = LoggerFactory.getLogger(InvoicePaymentController.class);

    private final FinancialService financialService;

    public InvoicePaymentController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Invoice>> createInvoice(@Valid @RequestBody InvoiceRequest req) {
        try {
            logger.info("Creating invoice: {}", req.getInvoiceNumber());
            Invoice invoice = financialService.createInvoice(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(invoice));
        } catch (Exception e) {
            logger.error("Error creating invoice", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Failed to create invoice", 400));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> getInvoice(@PathVariable Long id) {
        try {
            return financialService.getInvoice(id)
                    .map(invoice -> ResponseEntity.ok(ApiResponse.success(invoice, "Invoice found")))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Invoice not found", 404)));
        } catch (Exception e) {
            logger.error("Error retrieving invoice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving invoice", 500));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Invoice>>> getInvoicesByProject(@PathVariable Long projectId) {
        try {
            List<Invoice> invoices = financialService.listInvoicesByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success(invoices, "Invoices retrieved"));
        } catch (Exception e) {
            logger.error("Error retrieving invoices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving invoices", 500));
        }
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<Invoice>>> getInvoicesByClient(@PathVariable Long clientId) {
        try {
            List<Invoice> invoices = financialService.listInvoicesByClient(clientId);
            return ResponseEntity.ok(ApiResponse.success(invoices, "Invoices retrieved"));
        } catch (Exception e) {
            logger.error("Error retrieving invoices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving invoices", 500));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Invoice>> updateInvoiceStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        try {
            logger.info("Updating invoice {} status to {}", id, status);
            Invoice invoice = financialService.updateInvoiceStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success(invoice, "Invoice status updated"));
        } catch (IllegalArgumentException e) {
            logger.warn("Invoice not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Invoice not found", 404));
        } catch (Exception e) {
            logger.error("Error updating invoice status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating invoice status", 500));
        }
    }

    @PostMapping("/{invoiceId}/payments")
    public ResponseEntity<ApiResponse<Payment>> recordPayment(@PathVariable Long invoiceId, @Valid @RequestBody PaymentRequest req) {
        try {
            logger.info("Recording payment for invoice {}", invoiceId);
            Payment payment = financialService.recordPayment(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(payment));
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid payment request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), 400));
        } catch (Exception e) {
            logger.error("Error recording payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error recording payment", 500));
        }
    }

    @GetMapping("/{invoiceId}/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        try {
            List<Payment> payments = financialService.listPaymentsByInvoice(invoiceId);
            return ResponseEntity.ok(ApiResponse.success(payments, "Payments retrieved"));
        } catch (Exception e) {
            logger.error("Error retrieving payments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving payments", 500));
        }
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<ApiResponse<Payment>> getPayment(@PathVariable Long paymentId) {
        try {
            return financialService.getPayment(paymentId)
                    .map(payment -> ResponseEntity.ok(ApiResponse.success(payment, "Payment found")))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Payment not found", 404)));
        } catch (Exception e) {
            logger.error("Error retrieving payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving payment", 500));
        }
    }
}
