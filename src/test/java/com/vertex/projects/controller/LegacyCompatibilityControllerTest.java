package com.vertex.projects.controller;

import com.vertex.projects.model.core.Project;
import com.vertex.projects.repository.core.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LegacyCompatibilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        Project testProject = Project.builder()
                .name("Test Project")
                .description("Test project for legacy compatibility tests")
                .status(Project.ProjectStatus.DRAFT)
                .active(true)
                .build();
        projectRepository.save(testProject);
    }

    @Test
    void legacyPortfolioEndpointShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/portfolio"))
                .andExpect(status().isOk());
    }

    @Test
    void doublePrefixedLegacyProjectsEndpointShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/api/projects"))
                .andExpect(status().isOk());
    }

    @Test
    void authRegisterEndpointShouldBeAccessible() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"register-test@example.com\",\"password\":\"secret123\",\"name\":\"Register Test\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void adminAnalyticsEndpointShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/admin/analytics"))
                .andExpect(status().isOk());
    }

    @Test
    void projectStatsEndpointShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/projects/stats"))
                .andExpect(status().isOk());
    }

    @Test
    void projectUpdateEndpointShouldBeAccessible() throws Exception {
        Project testProject = projectRepository.findAll().stream().findFirst().orElseThrow();
        mockMvc.perform(put("/api/projects/" + testProject.getId())
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Updated Project\"}"))
                .andExpect(status().isOk());
    }
}
