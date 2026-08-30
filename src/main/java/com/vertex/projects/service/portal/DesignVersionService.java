package com.vertex.projects.service.portal;

import com.vertex.projects.model.portal.DesignVersion;
import com.vertex.projects.repository.portal.DesignVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Design Version management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DesignVersionService {

    private final DesignVersionRepository versionRepository;

    /**
     * Create new version
     */
    public DesignVersion createVersion(DesignVersion version) {
        log.info("Creating version {} for design: {}", version.getVersionNumber(), version.getDesignId());
        return versionRepository.save(version);
    }

    /**
     * Get version by ID
     */
    public Optional<DesignVersion> getVersionById(Long id) {
        return versionRepository.findById(id);
    }

    /**
     * Get all versions for a design
     */
    public List<DesignVersion> getDesignVersions(Long designId) {
        return versionRepository.findByDesignIdOrderByVersionNumberDesc(designId);
    }

    /**
     * Get specific version
     */
    public DesignVersion getVersion(Long designId, Integer versionNumber) {
        return versionRepository.findByDesignIdAndVersionNumber(designId, versionNumber);
    }

    /**
     * Get latest version number
     */
    public Integer getLatestVersionNumber(Long designId) {
        Long count = versionRepository.countByDesignId(designId);
        return count.intValue();
    }

    /**
     * Update version
     */
    public DesignVersion updateVersion(Long id, DesignVersion version) {
        version.setId(id);
        return versionRepository.save(version);
    }

    /**
     * Delete version
     */
    public void deleteVersion(Long id) {
        versionRepository.deleteById(id);
    }

    /**
     * Get version count for design
     */
    public Long getVersionCount(Long designId) {
        return versionRepository.countByDesignId(designId);
    }
}
