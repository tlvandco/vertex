package com.vertex.projects.repository.portal;

import com.vertex.projects.model.portal.DesignComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for DesignComment entity
 */
@Repository
public interface DesignCommentRepository extends JpaRepository<DesignComment, Long> {

    List<DesignComment> findByDesignId(Long designId);

    List<DesignComment> findByDesignIdOrderByCreatedAtDesc(Long designId);

    List<DesignComment> findByCreatedBy(Long createdBy);

    List<DesignComment> findByParentCommentId(Long parentCommentId);

    List<DesignComment> findByDesignIdAndIsPinned(Long designId, Boolean isPinned);
}
