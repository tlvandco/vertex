package com.vertex.projects.service.portal;

import com.vertex.projects.model.portal.Design;
import com.vertex.projects.repository.portal.DesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Design management in Design Portal
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DesignService {

    private final DesignRepository designRepository;

    /**
     * Create a new design
     */
    public Design createDesign(Design design) {
        log.info("Creating new design: {} for project: {}", design.getTitle(), design.getProjectId());
        return designRepository.save(design);
    }

    /**
     * Get design by ID
     */
    public Optional<Design> getDesignById(Long id) {
        return designRepository.findById(id);
    }

    /**
     * Get all designs for a project
     */
    public List<Design> getProjectDesigns(Long projectId) {
        log.debug("Fetching designs for project: {}", projectId);
        return designRepository.findByProjectId(projectId);
    }

    /**
     * Get project designs with pagination
     */
    public Page<Design> getProjectDesignsPaged(Long projectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return designRepository.findByProjectId(projectId, pageable);
    }

    /**
     * Get all designs by designer
     */
    public List<Design> getDesignerDesigns(Long designerId) {
        log.debug("Fetching designs for designer: {}", designerId);
        return designRepository.findByDesignerId(designerId);
    }

    /**
     * Get designs by designer with pagination
     */
    public Page<Design> getDesignerDesignsPaged(Long designerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return designRepository.findByDesignerId(designerId, pageable);
    }

    /**
     * Get designs by status for a project
     */
    public List<Design> getDesignsByStatus(Long projectId, Design.DesignStatus status) {
        return designRepository.findByProjectIdAndStatus(projectId, status);
    }

    /**
     * Get designs by approval status
     */
    public List<Design> getDesignsByApprovalStatus(Long projectId, Design.ApprovalStatus approvalStatus) {
        return designRepository.findByProjectIdAndApprovalStatus(projectId, approvalStatus);
    }

    /**
     * Get designs by type
     */
    public List<Design> getDesignsByType(Design.DesignType designType) {
        return designRepository.findByDesignTypeOrderByCreatedAtDesc(designType);
    }

    /**
     * Update design
     */
    public Design updateDesign(Long id, Design design) {
        log.info("Updating design: {}", id);
        design.setId(id);
        return designRepository.save(design);
    }

    /**
     * Update design status
     */
    public Design updateDesignStatus(Long id, Design.DesignStatus status) {
        Optional<Design> design = designRepository.findById(id);
        if (design.isPresent()) {
            Design d = design.get();
            d.setStatus(status);
            return designRepository.save(d);
        }
        return null;
    }

    /**
     * Update approval status
     */
    public Design updateApprovalStatus(Long id, Design.ApprovalStatus approvalStatus, Long approvedBy, String notes) {
        Optional<Design> design = designRepository.findById(id);
        if (design.isPresent()) {
            Design d = design.get();
            d.setApprovalStatus(approvalStatus);
            d.setApprovedBy(approvedBy);
            d.setApprovalNotes(notes);
            if (approvalStatus == Design.ApprovalStatus.APPROVED) {
                d.setApprovedAt(java.time.LocalDateTime.now());
            }
            return designRepository.save(d);
        }
        return null;
    }

    /**
     * Approve design
     */
    public Design approveDesign(Long id, Long approvedBy, String notes) {
        return updateApprovalStatus(id, Design.ApprovalStatus.APPROVED, approvedBy, notes);
    }

    /**
     * Reject design
     */
    public Design rejectDesign(Long id, Long rejectedBy, String notes) {
        return updateApprovalStatus(id, Design.ApprovalStatus.REJECTED, rejectedBy, notes);
    }

    /**
     * Request revision
     */
    public Design requestRevision(Long id, Long requestedBy, String notes) {
        return updateApprovalStatus(id, Design.ApprovalStatus.NEEDS_REVISION, requestedBy, notes);
    }

    /**
     * Delete design
     */
    public void deleteDesign(Long id) {
        log.info("Deleting design: {}", id);
        designRepository.deleteById(id);
    }

    /**
     * Soft delete design
     */
    public Design deactivateDesign(Long id) {
        Optional<Design> design = designRepository.findById(id);
        if (design.isPresent()) {
            Design d = design.get();
            d.setIsActive(false);
            return designRepository.save(d);
        }
        return null;
    }
}
