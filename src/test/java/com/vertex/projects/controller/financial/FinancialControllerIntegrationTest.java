package com.vertex.projects.controller.financial;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vertex.projects.dto.financial.InvoiceRequest;
import com.vertex.projects.dto.financial.PaymentRequest;
import com.vertex.projects.model.financial.InvoiceStatus;
import com.vertex.projects.model.financial.PaymentMethod;
import com.vertex.projects.repository.financial.InvoiceRepository;
import com.vertex.projects.repository.financial.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "testuser", roles = {"USER"})
public class FinancialControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @BeforeEach
    public void setUp() {
        invoiceRepository.deleteAll();
        paymentRepository.deleteAll();
    }

    @Test
    public void testCreateInvoice() throws Exception {
        InvoiceRequest req = new InvoiceRequest();
        req.setInvoiceNumber("INV-001");
        req.setProjectId(1L);
        req.setClientId(1L);
        req.setAmount(new BigDecimal("1000.00"));
        req.setIssuedDate(LocalDate.now());
        req.setDueDate(LocalDate.now().plusDays(30));
        req.setDescription("Design services");

        mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-001"))
                .andExpect(jsonPath("$.data.amount").value(1000.00));
    }

    @Test
    public void testGetInvoice() throws Exception {
        InvoiceRequest req = new InvoiceRequest();
        req.setInvoiceNumber("INV-002");
        req.setProjectId(1L);
        req.setAmount(new BigDecimal("500.00"));

        String response = mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long invoiceId = objectMapper.readTree(response).get("data").get("id").asLong();

        mockMvc.perform(get("/api/v2/invoices/" + invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-002"));
    }

    @Test
    public void testGetInvoicesByProject() throws Exception {
        InvoiceRequest req1 = new InvoiceRequest();
        req1.setInvoiceNumber("INV-P1");
        req1.setProjectId(1L);
        req1.setAmount(new BigDecimal("100.00"));

        InvoiceRequest req2 = new InvoiceRequest();
        req2.setInvoiceNumber("INV-P2");
        req2.setProjectId(1L);
        req2.setAmount(new BigDecimal("200.00"));

        mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req1)));

        mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req2)));

        mockMvc.perform(get("/api/v2/invoices/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    public void testUpdateInvoiceStatus() throws Exception {
        InvoiceRequest req = new InvoiceRequest();
        req.setInvoiceNumber("INV-003");
        req.setProjectId(1L);
        req.setAmount(new BigDecimal("750.00"));

        String response = mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long invoiceId = objectMapper.readTree(response).get("data").get("id").asLong();

        mockMvc.perform(patch("/api/v2/invoices/" + invoiceId + "/status")
                .param("status", "SENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SENT"));
    }

    @Test
    public void testRecordPayment() throws Exception {
        InvoiceRequest invoiceReq = new InvoiceRequest();
        invoiceReq.setInvoiceNumber("INV-004");
        invoiceReq.setProjectId(1L);
        invoiceReq.setAmount(new BigDecimal("500.00"));

        String invoiceResponse = mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(invoiceReq)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long invoiceId = objectMapper.readTree(invoiceResponse).get("data").get("id").asLong();

        PaymentRequest paymentReq = new PaymentRequest();
        paymentReq.setInvoiceId(invoiceId);
        paymentReq.setAmount(new BigDecimal("500.00"));
        paymentReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        paymentReq.setReferenceNumber("TXN-123");

        mockMvc.perform(post("/api/v2/invoices/" + invoiceId + "/payments")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceId").value(invoiceId))
                .andExpect(jsonPath("$.data.amount").value(500.00));
    }

    @Test
    public void testGetPaymentsByInvoice() throws Exception {
        InvoiceRequest invoiceReq = new InvoiceRequest();
        invoiceReq.setInvoiceNumber("INV-005");
        invoiceReq.setProjectId(1L);
        invoiceReq.setAmount(new BigDecimal("1000.00"));

        String invoiceResponse = mockMvc.perform(post("/api/v2/invoices")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(invoiceReq)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long invoiceId = objectMapper.readTree(invoiceResponse).get("data").get("id").asLong();

        PaymentRequest paymentReq = new PaymentRequest();
        paymentReq.setInvoiceId(invoiceId);
        paymentReq.setAmount(new BigDecimal("500.00"));
        paymentReq.setPaymentMethod(PaymentMethod.CREDIT_CARD);

        mockMvc.perform(post("/api/v2/invoices/" + invoiceId + "/payments")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(paymentReq)));

        mockMvc.perform(get("/api/v2/invoices/" + invoiceId + "/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    public void testRecordPaymentWithInvalidInvoice() throws Exception {
        PaymentRequest paymentReq = new PaymentRequest();
        paymentReq.setInvoiceId(999L);
        paymentReq.setAmount(new BigDecimal("100.00"));
        paymentReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);

        mockMvc.perform(post("/api/v2/invoices/999/payments")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
