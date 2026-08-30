package com.vertex.projects.service.resource;

import com.vertex.projects.model.resource.FileMetadata;
import com.vertex.projects.repository.resource.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for File management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileMetadataRepository fileMetadataRepository;

    /**
     * Save file metadata
     */
    public FileMetadata saveFileMetadata(FileMetadata fileMetadata) {
        log.info("Saving file metadata: {} for entity: {}", fileMetadata.getFileName(), fileMetadata.getAssociatedEntity());
        return fileMetadataRepository.save(fileMetadata);
    }

    /**
     * Get file by ID
     */
    public Optional<FileMetadata> getFileById(Long id) {
        log.debug("Fetching file metadata with ID: {}", id);
        return fileMetadataRepository.findById(id);
    }

    /**
     * Get files for an entity
     */
    public List<FileMetadata> getFilesForEntity(String entityType, Long entityId) {
        log.debug("Fetching files for entity {} with ID: {}", entityType, entityId);
        return fileMetadataRepository.findByAssociatedEntityAndAssociatedEntityId(entityType, entityId);
    }

    /**
     * Get files uploaded by user
     */
    public List<FileMetadata> getFilesByUploader(Long userId) {
        log.debug("Fetching files uploaded by user: {}", userId);
        return fileMetadataRepository.findByUploadedBy(userId);
    }

    /**
     * Get files by type
     */
    public List<FileMetadata> getFilesByType(String fileType) {
        log.debug("Fetching files of type: {}", fileType);
        return fileMetadataRepository.findByFileType(fileType);
    }

    /**
     * Delete file metadata
     */
    public void deleteFile(Long id) {
        log.info("Deleting file metadata with ID: {}", id);
        fileMetadataRepository.deleteById(id);
    }
}
