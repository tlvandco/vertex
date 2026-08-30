package com.vertex.projects.service.portal;

import com.vertex.projects.model.portal.DesignComment;
import com.vertex.projects.repository.portal.DesignCommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Design Comment management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DesignCommentService {

    private final DesignCommentRepository commentRepository;

    /**
     * Create comment
     */
    public DesignComment createComment(DesignComment comment) {
        log.info("Creating comment for design: {}", comment.getDesignId());
        return commentRepository.save(comment);
    }

    /**
     * Get comment by ID
     */
    public Optional<DesignComment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    /**
     * Get all comments for a design
     */
    public List<DesignComment> getDesignComments(Long designId) {
        return commentRepository.findByDesignIdOrderByCreatedAtDesc(designId);
    }

    /**
     * Get comments from user
     */
    public List<DesignComment> getUserComments(Long userId) {
        return commentRepository.findByCreatedBy(userId);
    }

    /**
     * Get reply comments
     */
    public List<DesignComment> getReplies(Long parentCommentId) {
        return commentRepository.findByParentCommentId(parentCommentId);
    }

    /**
     * Get pinned comments
     */
    public List<DesignComment> getPinnedComments(Long designId) {
        return commentRepository.findByDesignIdAndIsPinned(designId, true);
    }

    /**
     * Update comment
     */
    public DesignComment updateComment(Long id, DesignComment comment) {
        comment.setId(id);
        return commentRepository.save(comment);
    }

    /**
     * Pin comment
     */
    public DesignComment pinComment(Long id) {
        Optional<DesignComment> comment = commentRepository.findById(id);
        if (comment.isPresent()) {
            DesignComment c = comment.get();
            c.setIsPinned(true);
            return commentRepository.save(c);
        }
        return null;
    }

    /**
     * Unpin comment
     */
    public DesignComment unpinComment(Long id) {
        Optional<DesignComment> comment = commentRepository.findById(id);
        if (comment.isPresent()) {
            DesignComment c = comment.get();
            c.setIsPinned(false);
            return commentRepository.save(c);
        }
        return null;
    }

    /**
     * Delete comment
     */
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
