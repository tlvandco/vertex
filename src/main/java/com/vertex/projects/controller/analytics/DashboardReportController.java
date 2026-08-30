package com.vertex.projects.controller.analytics;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.analytics.DashboardReport;
import com.vertex.projects.service.analytics.DashboardReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Dashboard Reports
 */
@RestController
@RequestMapping("/api/v2/dashboard-reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DashboardReportController {

    private final DashboardReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<DashboardReport>> createReport(@RequestBody DashboardReport report) {
        log.info("Creating report: {}", report.getReportName());
        DashboardReport created = reportService.createReport(report);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Report created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DashboardReport>> getReport(@PathVariable Long id) {
        return reportService.getReportById(id)
            .map(report -> ResponseEntity.ok(ApiResponse.success(report, "Report retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<DashboardReport>>> getUserReports(@PathVariable Long userId) {
        List<DashboardReport> reports = reportService.getUserReports(userId);
        return ResponseEntity.ok(ApiResponse.success(reports, "User reports retrieved successfully"));
    }

    @GetMapping("/type/{reportType}")
    public ResponseEntity<ApiResponse<List<DashboardReport>>> getReportsByType(
            @PathVariable DashboardReport.ReportType reportType) {
        List<DashboardReport> reports = reportService.getReportsByType(reportType);
        return ResponseEntity.ok(ApiResponse.success(reports, "Reports retrieved successfully"));
    }

    @GetMapping("/user/{userId}/type/{reportType}")
    public ResponseEntity<ApiResponse<List<DashboardReport>>> getUserReportsByType(
            @PathVariable Long userId,
            @PathVariable DashboardReport.ReportType reportType) {
        List<DashboardReport> reports = reportService.getUserReportsByType(userId, reportType);
        return ResponseEntity.ok(ApiResponse.success(reports, "Reports retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DashboardReport>> updateReport(
            @PathVariable Long id,
            @RequestBody DashboardReport report) {
        DashboardReport updated = reportService.updateReport(id, report);
        return ResponseEntity.ok(ApiResponse.success(updated, "Report updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.success("", "Report deleted successfully"));
    }
}
