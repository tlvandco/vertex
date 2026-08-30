package com.vertex.projects.service.portal;

import com.vertex.projects.model.portal.DesignFeedback;
import com.vertex.projects.repository.portal.DesignFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Design Feedback management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DesignFeedbackService {

    private final DesignFeedbackRepository feedbackRepository;

    /**
     * Create feedback
     */
    public DesignFeedback createFeedback(DesignFeedback feedback) {
        log.info("Creating feedback for design: {}", feedback.getDesignId());
        return feedbackRepository.save(feedback);
    }

    /**
     * Get feedback by ID
     */
    public Optional<DesignFeedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    /**
     * Get all feedback for a design
     */
    public List<DesignFeedback> getDesignFeedback(Long designId) {
        return feedbackRepository.findByDesignId(designId);
    }

    /**
     * Get unresolved feedback
     */
    public List<DesignFeedback> getUnresolvedFeedback(Long designId) {
        return feedbackRepository.findByDesignIdAndIsResolved(designId, false);
    }

    /**
     * Get feedback by type
     */
    public List<DesignFeedback> getFeedbackByType(DesignFeedback.FeedbackType type) {
        return feedbackRepository.findByFeedbackType(type);
    }

    /**
     * Get feedback from user
     */
    public List<DesignFeedback> getUserFeedback(Long userId) {
        return feedbackRepository.findByCreatedBy(userId);
    }

    /**
     * Update feedback
     */
    public DesignFeedback updateFeedback(Long id, DesignFeedback feedback) {
        feedback.setId(id);
        return feedbackRepository.save(feedback);
    }

    /**
     * Mark feedback as resolved
     */
    public DesignFeedback resolveFeedback(Long id) {
        Optional<DesignFeedback> feedback = feedbackRepository.findById(id);
        if (feedback.isPresent()) {
            DesignFeedback f = feedback.get();
            f.setIsResolved(true);
            return feedbackRepository.save(f);
        }
        return null;
    }

    /**
     * Delete feedback
     */
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}
