package com.vertex.projects.controller.portal;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.portal.DesignComment;
import com.vertex.projects.service.portal.DesignCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Design Comment management
 */
@RestController
@RequestMapping("/api/v2/design-comments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DesignCommentController {

    private final DesignCommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<DesignComment>> createComment(@RequestBody DesignComment comment) {
        log.info("Creating comment for design: {}", comment.getDesignId());
        DesignComment created = commentService.createComment(comment);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Comment created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignComment>> getComment(@PathVariable Long id) {
        return commentService.getCommentById(id)
            .map(comment -> ResponseEntity.ok(ApiResponse.success(comment, "Comment retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/design/{designId}")
    public ResponseEntity<ApiResponse<List<DesignComment>>> getDesignComments(@PathVariable Long designId) {
        List<DesignComment> comments = commentService.getDesignComments(designId);
        return ResponseEntity.ok(ApiResponse.success(comments, "Comments retrieved successfully"));
    }

    @GetMapping("/design/{designId}/pinned")
    public ResponseEntity<ApiResponse<List<DesignComment>>> getPinnedComments(@PathVariable Long designId) {
        List<DesignComment> comments = commentService.getPinnedComments(designId);
        return ResponseEntity.ok(ApiResponse.success(comments, "Pinned comments retrieved successfully"));
    }

    @GetMapping("/comment/{parentCommentId}/replies")
    public ResponseEntity<ApiResponse<List<DesignComment>>> getReplies(@PathVariable Long parentCommentId) {
        List<DesignComment> replies = commentService.getReplies(parentCommentId);
        return ResponseEntity.ok(ApiResponse.success(replies, "Replies retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignComment>> updateComment(
            @PathVariable Long id,
            @RequestBody DesignComment comment) {
        DesignComment updated = commentService.updateComment(id, comment);
        return ResponseEntity.ok(ApiResponse.success(updated, "Comment updated successfully"));
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<DesignComment>> pinComment(@PathVariable Long id) {
        DesignComment pinned = commentService.pinComment(id);
        return ResponseEntity.ok(ApiResponse.success(pinned, "Comment pinned successfully"));
    }

    @PutMapping("/{id}/unpin")
    public ResponseEntity<ApiResponse<DesignComment>> unpinComment(@PathVariable Long id) {
        DesignComment unpinned = commentService.unpinComment(id);
        return ResponseEntity.ok(ApiResponse.success(unpinned, "Comment unpinned successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("", "Comment deleted successfully"));
    }
}
