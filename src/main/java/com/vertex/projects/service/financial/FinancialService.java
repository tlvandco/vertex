package com.vertex.projects.service.financial;

import com.vertex.projects.dto.financial.InvoiceRequest;
import com.vertex.projects.dto.financial.PaymentRequest;
import com.vertex.projects.model.financial.Invoice;
import com.vertex.projects.model.financial.InvoiceStatus;
import com.vertex.projects.model.financial.Payment;
import com.vertex.projects.model.financial.PaymentStatus;
import com.vertex.projects.repository.financial.InvoiceRepository;
import com.vertex.projects.repository.financial.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FinancialService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public FinancialService(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    public Invoice createInvoice(InvoiceRequest req) {
        Invoice invoice = Invoice.builder()
                .invoiceNumber(req.getInvoiceNumber())
                .projectId(req.getProjectId())
                .clientId(req.getClientId())
                .amount(req.getAmount())
                .issuedDate(req.getIssuedDate())
                .dueDate(req.getDueDate())
                .description(req.getDescription())
                .status(InvoiceStatus.DRAFT)
                .build();
        return invoiceRepository.save(invoice);
    }

    public Optional<Invoice> getInvoice(Long id) {
        return invoiceRepository.findById(id);
    }

    public List<Invoice> listInvoicesByProject(Long projectId) {
        return invoiceRepository.findByProjectId(projectId);
    }

    public List<Invoice> listInvoicesByClient(Long clientId) {
        return invoiceRepository.findByClientId(clientId);
    }

    @Transactional
    public Invoice updateInvoiceStatus(Long invoiceId, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    public Payment recordPayment(PaymentRequest req) {
        Invoice invoice = invoiceRepository.findById(req.getInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        
        Payment payment = Payment.builder()
                .invoiceId(req.getInvoiceId())
                .amount(req.getAmount())
                .paymentDate(req.getPaymentDate() != null ? req.getPaymentDate() : LocalDate.now())
                .paymentMethod(req.getPaymentMethod())
                .referenceNumber(req.getReferenceNumber())
                .notes(req.getNotes())
                .status(PaymentStatus.CONFIRMED)
                .build();
        
        Payment saved = paymentRepository.save(payment);
        
        // Update invoice status to PAID if payment amount matches
        if (req.getAmount().equals(invoice.getAmount())) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }
        
        return saved;
    }

    public List<Payment> listPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    public Optional<Payment> getPayment(Long id) {
        return paymentRepository.findById(id);
    }
}
