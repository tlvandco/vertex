package com.vertex.projects.model.core;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Project entity for VERTEX Project Management System
 * Represents an interior design project
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "project_manager_id")
    private Long projectManagerId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Column(name = "project_type")
    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "location")
    private String location;

    @Column(name = "square_feet")
    private Double squareFeet;

    @Column(name = "progress")
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProjectStatus {
        DRAFT, PROPOSAL, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
    }

    public enum ProjectType {
        RESIDENTIAL, COMMERCIAL, MIXED, OFFICE, RETAIL, HOSPITALITY
    }
}
