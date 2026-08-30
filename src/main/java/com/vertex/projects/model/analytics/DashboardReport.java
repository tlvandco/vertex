package com.vertex.projects.model.analytics;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DashboardReport entity for storing generated reports
 */
@Entity
@Table(name = "dashboard_reports", indexes = {
    @Index(name = "idx_created_by", columnList = "created_by"),
    @Index(name = "idx_report_type", columnList = "report_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_name", nullable = false)
    private String reportName;

    @Column(name = "report_type")
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @Column(name = "report_data", columnDefinition = "LONGTEXT")
    private String reportData;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReportType {
        PROJECT_SUMMARY,
        FINANCIAL,
        RESOURCE_ALLOCATION,
        TIMELINE,
        QUALITY,
        USER_ENGAGEMENT,
        CUSTOM
    }
}
