package com.vertex.projects.repository.portal;

import com.vertex.projects.model.portal.Design;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Design entity
 */
@Repository
public interface DesignRepository extends JpaRepository<Design, Long> {

    List<Design> findByProjectId(Long projectId);

    Page<Design> findByProjectId(Long projectId, Pageable pageable);

    List<Design> findByDesignerId(Long designerId);

    Page<Design> findByDesignerId(Long designerId, Pageable pageable);

    List<Design> findByProjectIdAndStatus(Long projectId, Design.DesignStatus status);

    List<Design> findByProjectIdAndApprovalStatus(Long projectId, Design.ApprovalStatus approvalStatus);

    List<Design> findByDesignTypeOrderByCreatedAtDesc(Design.DesignType designType);

    List<Design> findByProjectIdAndIsActive(Long projectId, Boolean isActive);
}
