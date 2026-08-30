package com.vertex.projects.repository.analytics;

import com.vertex.projects.model.analytics.DashboardReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for DashboardReport entity
 */
@Repository
public interface DashboardReportRepository extends JpaRepository<DashboardReport, Long> {

    List<DashboardReport> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    List<DashboardReport> findByReportType(DashboardReport.ReportType reportType);

    List<DashboardReport> findByReportTypeAndCreatedByOrderByCreatedAtDesc(DashboardReport.ReportType reportType, Long createdBy);
}
