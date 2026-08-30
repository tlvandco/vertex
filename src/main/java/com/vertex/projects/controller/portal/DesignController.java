package com.vertex.projects.controller.portal;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.portal.Design;
import com.vertex.projects.service.portal.DesignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Design management
 */
@RestController("portalDesignController")
@RequestMapping("/api/v2/designs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DesignController {

    private final DesignService designService;

    @PostMapping
    public ResponseEntity<ApiResponse<Design>> createDesign(@RequestBody Design design) {
        log.info("Creating new design: {}", design.getTitle());
        Design created = designService.createDesign(design);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Design created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Design>> getDesign(@PathVariable Long id) {
        return designService.getDesignById(id)
            .map(design -> ResponseEntity.ok(ApiResponse.success(design, "Design retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Design>>> getProjectDesigns(@PathVariable Long projectId) {
        List<Design> designs = designService.getProjectDesigns(projectId);
        return ResponseEntity.ok(ApiResponse.success(designs, "Project designs retrieved successfully"));
    }

    @GetMapping("/project/{projectId}/paged")
    public ResponseEntity<ApiResponse<Page<Design>>> getProjectDesignsPaged(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Design> designs = designService.getProjectDesignsPaged(projectId, page, size);
        return ResponseEntity.ok(ApiResponse.success(designs, "Project designs retrieved successfully"));
    }

    @GetMapping("/designer/{designerId}")
    public ResponseEntity<ApiResponse<List<Design>>> getDesignerDesigns(@PathVariable Long designerId) {
        List<Design> designs = designService.getDesignerDesigns(designerId);
        return ResponseEntity.ok(ApiResponse.success(designs, "Designer designs retrieved successfully"));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<ApiResponse<List<Design>>> getDesignsByStatus(
            @PathVariable Long projectId,
            @PathVariable Design.DesignStatus status) {
        List<Design> designs = designService.getDesignsByStatus(projectId, status);
        return ResponseEntity.ok(ApiResponse.success(designs, "Designs retrieved successfully"));
    }

    @GetMapping("/project/{projectId}/approval/{approvalStatus}")
    public ResponseEntity<ApiResponse<List<Design>>> getDesignsByApprovalStatus(
            @PathVariable Long projectId,
            @PathVariable Design.ApprovalStatus approvalStatus) {
        List<Design> designs = designService.getDesignsByApprovalStatus(projectId, approvalStatus);
        return ResponseEntity.ok(ApiResponse.success(designs, "Designs retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Design>> updateDesign(
            @PathVariable Long id,
            @RequestBody Design design) {
        log.info("Updating design: {}", id);
        Design updated = designService.updateDesign(id, design);
        return ResponseEntity.ok(ApiResponse.success(updated, "Design updated successfully"));
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<ApiResponse<Design>> updateStatus(
            @PathVariable Long id,
            @PathVariable Design.DesignStatus status) {
        Design updated = designService.updateDesignStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Status updated successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Design>> approveDesign(
            @PathVariable Long id,
            @RequestParam Long approvedBy,
            @RequestParam(required = false) String notes) {
        Design approved = designService.approveDesign(id, approvedBy, notes);
        return ResponseEntity.ok(ApiResponse.success(approved, "Design approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Design>> rejectDesign(
            @PathVariable Long id,
            @RequestParam Long rejectedBy,
            @RequestParam(required = false) String notes) {
        Design rejected = designService.rejectDesign(id, rejectedBy, notes);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Design rejected successfully"));
    }

    @PutMapping("/{id}/request-revision")
    public ResponseEntity<ApiResponse<Design>> requestRevision(
            @PathVariable Long id,
            @RequestParam Long requestedBy,
            @RequestParam(required = false) String notes) {
        Design design = designService.requestRevision(id, requestedBy, notes);
        return ResponseEntity.ok(ApiResponse.success(design, "Revision requested successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDesign(@PathVariable Long id) {
        log.info("Deleting design: {}", id);
        designService.deleteDesign(id);
        return ResponseEntity.ok(ApiResponse.success("", "Design deleted successfully"));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Design>> deactivateDesign(@PathVariable Long id) {
        Design deactivated = designService.deactivateDesign(id);
        return ResponseEntity.ok(ApiResponse.success(deactivated, "Design deactivated successfully"));
    }
}
