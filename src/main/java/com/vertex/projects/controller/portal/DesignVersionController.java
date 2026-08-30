package com.vertex.projects.controller.portal;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.portal.DesignVersion;
import com.vertex.projects.service.portal.DesignVersionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Design Version management
 */
@RestController
@RequestMapping("/api/v2/design-versions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DesignVersionController {

    private final DesignVersionService versionService;

    @PostMapping
    public ResponseEntity<ApiResponse<DesignVersion>> createVersion(@RequestBody DesignVersion version) {
        log.info("Creating version {} for design: {}", version.getVersionNumber(), version.getDesignId());
        DesignVersion created = versionService.createVersion(version);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Version created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignVersion>> getVersion(@PathVariable Long id) {
        return versionService.getVersionById(id)
            .map(version -> ResponseEntity.ok(ApiResponse.success(version, "Version retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/design/{designId}")
    public ResponseEntity<ApiResponse<List<DesignVersion>>> getDesignVersions(@PathVariable Long designId) {
        List<DesignVersion> versions = versionService.getDesignVersions(designId);
        return ResponseEntity.ok(ApiResponse.success(versions, "Design versions retrieved successfully"));
    }

    @GetMapping("/design/{designId}/version/{versionNumber}")
    public ResponseEntity<ApiResponse<DesignVersion>> getSpecificVersion(
            @PathVariable Long designId,
            @PathVariable Integer versionNumber) {
        DesignVersion version = versionService.getVersion(designId, versionNumber);
        if (version != null) {
            return ResponseEntity.ok(ApiResponse.success(version, "Version retrieved successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/design/{designId}/version-count")
    public ResponseEntity<ApiResponse<Long>> getVersionCount(@PathVariable Long designId) {
        Long count = versionService.getVersionCount(designId);
        return ResponseEntity.ok(ApiResponse.success(count, "Version count retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignVersion>> updateVersion(
            @PathVariable Long id,
            @RequestBody DesignVersion version) {
        DesignVersion updated = versionService.updateVersion(id, version);
        return ResponseEntity.ok(ApiResponse.success(updated, "Version updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteVersion(@PathVariable Long id) {
        versionService.deleteVersion(id);
        return ResponseEntity.ok(ApiResponse.success("", "Version deleted successfully"));
    }
}
