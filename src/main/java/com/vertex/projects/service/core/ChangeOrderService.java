package com.vertex.projects.service.core;

import com.vertex.projects.dto.request.ChangeOrderRequest;
import com.vertex.projects.dto.response.ChangeOrderResponse;
import com.vertex.projects.exception.ResourceNotFoundException;
import com.vertex.projects.model.core.ChangeOrder;
import com.vertex.projects.repository.ChangeOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Change Order management
 * Handles project modifications, approvals, and impact analysis
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChangeOrderService {

    private final ChangeOrderRepository changeOrderRepository;

    /**
     * Create a new change order
     */
    public ChangeOrderResponse createChangeOrder(ChangeOrderRequest request) {
        log.info("Creating change order for project: {}", request.getProjectId());

        ChangeOrder changeOrder = ChangeOrder.builder()
                .projectId(request.getProjectId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status("DRAFT")
                .impactOnTimeline(request.getImpactOnTimeline())
                .impactOnBudget(request.getImpactOnBudget())
                .impactOnScope(request.getImpactOnScope())
                .justification(request.getJustification())
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .build();

        changeOrder = changeOrderRepository.save(changeOrder);
        log.info("Change order created with ID: {}", changeOrder.getId());

        return mapToResponse(changeOrder);
    }

    /**
     * Get change order by ID
     */
    public ChangeOrderResponse getChangeOrderById(Long id) {
        log.info("Fetching change order with ID: {}", id);

        ChangeOrder changeOrder = changeOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change order not found with ID: " + id));

        return mapToResponse(changeOrder);
    }

    /**
     * Get all change orders for a project
     */
    public List<ChangeOrderResponse> getChangeOrdersByProjectId(Long projectId) {
        log.info("Fetching change orders for project: {}", projectId);

        List<ChangeOrder> changeOrders = changeOrderRepository.findByProjectId(projectId);
        return changeOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending change orders
     */
    public List<ChangeOrderResponse> getPendingChangeOrders(Long projectId) {
        log.info("Fetching pending change orders for project: {}", projectId);

        List<ChangeOrder> changeOrders = changeOrderRepository.findPendingByProjectId(projectId);
        return changeOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Submit change order for approval
     */
    public ChangeOrderResponse submitForApproval(Long id) {
        log.info("Submitting change order for approval: {}", id);

        ChangeOrder changeOrder = changeOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change order not found with ID: " + id));

        changeOrder.setStatus("SUBMITTED");

        changeOrder = changeOrderRepository.save(changeOrder);
        log.info("Change order submitted for approval: {}", id);

        return mapToResponse(changeOrder);
    }

    /**
     * Approve change order
     */
    public ChangeOrderResponse approveChangeOrder(Long id, Long approvedBy) {
        log.info("Approving change order: {} by user: {}", id, approvedBy);

        ChangeOrder changeOrder = changeOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change order not found with ID: " + id));

        changeOrder.setStatus("APPROVED");
        changeOrder.setApprovedBy(approvedBy);
        changeOrder.setApprovalDate(LocalDateTime.now().toString());

        changeOrder = changeOrderRepository.save(changeOrder);
        log.info("Change order approved: {}", id);

        return mapToResponse(changeOrder);
    }

    /**
     * Reject change order
     */
    public ChangeOrderResponse rejectChangeOrder(Long id) {
        log.info("Rejecting change order: {}", id);

        ChangeOrder changeOrder = changeOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change order not found with ID: " + id));

        changeOrder.setStatus("REJECTED");

        changeOrder = changeOrderRepository.save(changeOrder);
        log.info("Change order rejected: {}", id);

        return mapToResponse(changeOrder);
    }

    /**
     * Delete change order
     */
    public void deleteChangeOrder(Long id) {
        log.info("Deleting change order with ID: {}", id);

        if (!changeOrderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Change order not found with ID: " + id);
        }

        changeOrderRepository.deleteById(id);
        log.info("Change order deleted with ID: {}", id);
    }

    /**
     * Map ChangeOrder entity to response DTO
     */
    private ChangeOrderResponse mapToResponse(ChangeOrder changeOrder) {
        return ChangeOrderResponse.builder()
                .id(changeOrder.getId())
                .projectId(changeOrder.getProjectId())
                .title(changeOrder.getTitle())
                .description(changeOrder.getDescription())
                .status(changeOrder.getStatus())
                .impactOnTimeline(changeOrder.getImpactOnTimeline())
                .impactOnBudget(changeOrder.getImpactOnBudget())
                .impactOnScope(changeOrder.getImpactOnScope())
                .justification(changeOrder.getJustification())
                .priority(changeOrder.getPriority())
                .createdBy(changeOrder.getCreatedBy())
                .approvedBy(changeOrder.getApprovedBy())
                .approvalDate(changeOrder.getApprovalDate())
                .createdAt(changeOrder.getCreatedAt())
                .updatedAt(changeOrder.getUpdatedAt())
                .build();
    }
}
