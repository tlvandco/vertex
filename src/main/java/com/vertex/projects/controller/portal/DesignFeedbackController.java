package com.vertex.projects.controller.portal;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.portal.DesignFeedback;
import com.vertex.projects.service.portal.DesignFeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Design Feedback management
 */
@RestController
@RequestMapping("/api/v2/design-feedback")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DesignFeedbackController {

    private final DesignFeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<DesignFeedback>> createFeedback(@RequestBody DesignFeedback feedback) {
        log.info("Creating feedback for design: {}", feedback.getDesignId());
        DesignFeedback created = feedbackService.createFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Feedback created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignFeedback>> getFeedback(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
            .map(feedback -> ResponseEntity.ok(ApiResponse.success(feedback, "Feedback retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/design/{designId}")
    public ResponseEntity<ApiResponse<List<DesignFeedback>>> getDesignFeedback(@PathVariable Long designId) {
        List<DesignFeedback> feedback = feedbackService.getDesignFeedback(designId);
        return ResponseEntity.ok(ApiResponse.success(feedback, "Feedback retrieved successfully"));
    }

    @GetMapping("/design/{designId}/unresolved")
    public ResponseEntity<ApiResponse<List<DesignFeedback>>> getUnresolvedFeedback(@PathVariable Long designId) {
        List<DesignFeedback> feedback = feedbackService.getUnresolvedFeedback(designId);
        return ResponseEntity.ok(ApiResponse.success(feedback, "Unresolved feedback retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignFeedback>> updateFeedback(
            @PathVariable Long id,
            @RequestBody DesignFeedback feedback) {
        DesignFeedback updated = feedbackService.updateFeedback(id, feedback);
        return ResponseEntity.ok(ApiResponse.success(updated, "Feedback updated successfully"));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<DesignFeedback>> resolveFeedback(@PathVariable Long id) {
        DesignFeedback resolved = feedbackService.resolveFeedback(id);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Feedback marked as resolved"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("", "Feedback deleted successfully"));
    }
}
