package com.vertex.projects.service.analytics;

import com.vertex.projects.model.analytics.DashboardReport;
import com.vertex.projects.repository.analytics.DashboardReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Dashboard Report generation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardReportService {

    private final DashboardReportRepository reportRepository;

    /**
     * Create report
     */
    public DashboardReport createReport(DashboardReport report) {
        log.info("Creating report: {} for user: {}", report.getReportName(), report.getCreatedBy());
        return reportRepository.save(report);
    }

    /**
     * Get report by ID
     */
    public Optional<DashboardReport> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    /**
     * Get user reports
     */
    public List<DashboardReport> getUserReports(Long userId) {
        return reportRepository.findByCreatedByOrderByCreatedAtDesc(userId);
    }

    /**
     * Get reports by type
     */
    public List<DashboardReport> getReportsByType(DashboardReport.ReportType reportType) {
        return reportRepository.findByReportType(reportType);
    }

    /**
     * Get user reports by type
     */
    public List<DashboardReport> getUserReportsByType(Long userId, DashboardReport.ReportType reportType) {
        return reportRepository.findByReportTypeAndCreatedByOrderByCreatedAtDesc(reportType, userId);
    }

    /**
     * Update report
     */
    public DashboardReport updateReport(Long id, DashboardReport report) {
        report.setId(id);
        return reportRepository.save(report);
    }

    /**
     * Delete report
     */
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
