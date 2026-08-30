package com.vertex.projects.repository.portal;

import com.vertex.projects.model.portal.DesignVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for DesignVersion entity
 */
@Repository
public interface DesignVersionRepository extends JpaRepository<DesignVersion, Long> {

    List<DesignVersion> findByDesignIdOrderByVersionNumberDesc(Long designId);

    List<DesignVersion> findByDesignId(Long designId);

    DesignVersion findByDesignIdAndVersionNumber(Long designId, Integer versionNumber);

    Long countByDesignId(Long designId);
}
