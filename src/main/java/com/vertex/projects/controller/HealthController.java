package com.vertex.projects.controller;

import com.vertex.projects.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight health and readiness endpoints for VERTEX
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", LocalDateTime.now());
        data.put("app", "VERTEX");
        data.put("version", "2.0.0-alpha");
        data.put("database", "vertex_projects");

        return ResponseEntity.ok(ApiResponse.success(data, "Healthy"));
    }
}
