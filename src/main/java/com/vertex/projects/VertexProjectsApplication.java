package com.vertex.projects;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * VERTEX - Enterprise Project Management Platform
 * 
 * Main Spring Boot application class for the VERTEX project management system.
 * Supports construction, interior design, and related project-based businesses.
 * 
 * @version 2.0.0
 * @since 2026-05-25
 */
@SpringBootApplication
@EnableAsync
public class VertexProjectsApplication {

	public static void main(String[] args) {
		SpringApplication.run(VertexProjectsApplication.class, args);
        System.out.println("\n" + "=".repeat(60));
        System.out.println("✓ VERTEX - Enterprise Project Management Platform");
        System.out.println("✓ Version: 2.0.0 - Alpha Release");
        System.out.println("✓ Status: Successfully Started");
        System.out.println("=".repeat(60));
        System.out.println("📋 API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("🏥 Health Check: http://localhost:8080/api/v1/health");
        System.out.println("📊 Database: vertex_projects");
        System.out.println("=".repeat(60) + "\n");
	}

}
