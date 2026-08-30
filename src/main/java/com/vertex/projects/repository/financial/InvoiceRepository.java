package com.vertex.projects.repository.financial;

import com.vertex.projects.model.financial.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByProjectId(Long projectId);
    List<Invoice> findByClientId(Long clientId);
}
