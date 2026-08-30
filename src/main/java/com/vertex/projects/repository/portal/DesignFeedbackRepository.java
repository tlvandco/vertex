package com.vertex.projects.repository.portal;

import com.vertex.projects.model.portal.DesignFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for DesignFeedback entity
 */
@Repository
public interface DesignFeedbackRepository extends JpaRepository<DesignFeedback, Long> {

    List<DesignFeedback> findByDesignId(Long designId);

    List<DesignFeedback> findByDesignIdAndIsResolved(Long designId, Boolean isResolved);

    List<DesignFeedback> findByCreatedBy(Long createdBy);

    List<DesignFeedback> findByFeedbackType(DesignFeedback.FeedbackType feedbackType);
}
