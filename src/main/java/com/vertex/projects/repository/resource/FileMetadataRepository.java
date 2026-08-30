package com.vertex.projects.repository.resource;

import com.vertex.projects.model.resource.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for FileMetadata entity
 */
@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByAssociatedEntityAndAssociatedEntityId(String associatedEntity, Long associatedEntityId);
    List<FileMetadata> findByUploadedBy(Long uploadedBy);
    List<FileMetadata> findByFileType(String fileType);
}
