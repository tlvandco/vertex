package com.vertex.projects.controller.design;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.design.DesignRequestDto;
import com.vertex.projects.model.design.DesignRequest;
import com.vertex.projects.model.design.DesignStatus;
import com.vertex.projects.service.design.DesignService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/design/requests")
public class DesignRequestsController {

    private final DesignService service;

    public DesignRequestsController(DesignService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DesignRequest>> create(@Valid @RequestBody DesignRequestDto dto) {
        DesignRequest r = service.create(dto);
        return ResponseEntity.status(201).body(ApiResponse.created(r));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DesignRequest>>> list() {
        return ResponseEntity.ok(ApiResponse.success(service.listAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignRequest>> get(@PathVariable Long id) {
        DesignRequest r = service.get(id);
        if (r == null) return ResponseEntity.status(404).body(ApiResponse.error("Not found",404));
        return ResponseEntity.ok(ApiResponse.success(r));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DesignRequest>> updateStatus(@PathVariable Long id, @RequestParam DesignStatus status) {
        DesignRequest r = service.updateStatus(id, status);
        if (r == null) return ResponseEntity.status(404).body(ApiResponse.error("Not found",404));
        return ResponseEntity.ok(ApiResponse.success(r, "Status updated"));
    }
}
