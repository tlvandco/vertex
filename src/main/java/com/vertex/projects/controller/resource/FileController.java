package com.vertex.projects.controller.resource;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.resource.FileMetadata;
import com.vertex.projects.service.resource.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for File Management
 */
@RestController
@RequestMapping("/api/v2/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;

    @PostMapping
    public ResponseEntity<ApiResponse<FileMetadata>> uploadFile(@Valid @RequestBody FileMetadata fileMetadata) {
        log.info("Saving file metadata: {} for entity: {}", fileMetadata.getFileName(), fileMetadata.getAssociatedEntity());
        FileMetadata saved = fileService.saveFileMetadata(fileMetadata);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(saved, "File uploaded successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileMetadata>> getFile(@PathVariable Long id) {
        log.info("Fetching file with ID: {}", id);
        return fileService.getFileById(id)
            .map(file -> ResponseEntity.ok(ApiResponse.success(file, "File retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getFilesForEntity(@PathVariable String entityType,
                                                                             @PathVariable Long entityId) {
        log.info("Fetching files for entity {} with ID: {}", entityType, entityId);
        List<FileMetadata> files = fileService.getFilesForEntity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(files, "Files retrieved successfully"));
    }

    @GetMapping("/uploader/{userId}")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getFilesByUploader(@PathVariable Long userId) {
        log.info("Fetching files uploaded by user: {}", userId);
        List<FileMetadata> files = fileService.getFilesByUploader(userId);
        return ResponseEntity.ok(ApiResponse.success(files, "Files retrieved successfully"));
    }

    @GetMapping("/type/{fileType}")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getFilesByType(@PathVariable String fileType) {
        log.info("Fetching files of type: {}", fileType);
        List<FileMetadata> files = fileService.getFilesByType(fileType);
        return ResponseEntity.ok(ApiResponse.success(files, "Files retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteFile(@PathVariable Long id) {
        log.info("Deleting file with ID: {}", id);
        fileService.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted successfully"));
    }

    @PostMapping("/{id}/presigned-url")
    public ResponseEntity<ApiResponse<String>> getPresignedUrl(@PathVariable Long id) {
        log.info("Generating presigned URL for file id: {}", id);
        return fileService.getFileById(id)
                .map(file -> {
                    String url = file.getS3Url();
                    if (url == null || url.isEmpty()) {
                        // Fallback to internal download endpoint
                        url = String.format("/api/v2/files/%d/download", file.getId());
                    }
                    return ResponseEntity.ok(ApiResponse.success(url, "Presigned URL generated"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("File not found", HttpStatus.NOT_FOUND.value())));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        log.info("Download requested for file id: {}", id);
        return fileService.getFileById(id)
                .map(file -> {
                    String url = file.getS3Url();
                    if (url != null && !url.isEmpty()) {
                        // Redirect to external storage URL
                        return ResponseEntity.status(HttpStatus.FOUND).header("Location", url).build();
                    }
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("File not available for download", HttpStatus.NOT_FOUND.value()));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("File not found", HttpStatus.NOT_FOUND.value())));
    }
}
