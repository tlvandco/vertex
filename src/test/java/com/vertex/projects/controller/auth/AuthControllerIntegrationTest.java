package com.vertex.projects.controller.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vertex.projects.dto.request.LoginRequest;
import com.vertex.projects.model.auth.Role;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.repository.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController
 * Tests JWT token generation, validation, and user retrieval
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    public void setUp() {
        // Clean up before each test
        userRepository.deleteAll();

        // Create test user
        testUser = User.builder()
                .name("Test User")
                .email("test@vertex.com")
                .password(passwordEncoder.encode("test@123"))
                .role(Role.PROJECT_MANAGER)
                .active(true)
                .verified(true)
                .phone("+91-1234567890")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(testUser);
    }

    /**
     * Test successful login and JWT token generation
     */
    @Test
    public void testLoginSuccess() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@vertex.com")
                .password("test@123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v2/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.email").value("test@vertex.com"))
                .andExpect(jsonPath("$.data.role").value("PROJECT_MANAGER"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        System.out.println("Login Response: " + responseBody);
    }

    /**
     * Test login with invalid credentials
     */
    @Test
    public void testLoginInvalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@vertex.com")
                .password("wrong@123")
                .build();

        mockMvc.perform(post("/api/v2/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
    }

    /**
     * Test login with non-existent user
     */
    @Test
    public void testLoginUserNotFound() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@vertex.com")
                .password("test@123")
                .build();

        mockMvc.perform(post("/api/v2/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
    }

    /**
     * Test getting current user with valid token
     */
    @Test
    public void testGetCurrentUserWithValidToken() throws Exception {
        // First, login to get a token
        LoginRequest loginRequest = LoginRequest.builder()
                .email("test@vertex.com")
                .password("test@123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v2/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponse = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(loginResponse).get("data").get("token").asText();

        // Now test the /me endpoint with the token
        mockMvc.perform(get("/api/v2/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@vertex.com"))
                .andExpect(jsonPath("$.data.name").value("Test User"))
                .andExpect(jsonPath("$.data.role").value("PROJECT_MANAGER"))
                .andExpect(jsonPath("$.data.password").doesNotExist()); // Password should not be exposed
    }

    /**
     * Test getting current user without token
     */
    @Test
    public void testGetCurrentUserWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v2/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test getting current user with invalid token
     */
    @Test
    public void testGetCurrentUserWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v2/auth/me")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test initialize admin credentials
     */
    @Test
    public void testInitializeAdmin() throws Exception {
        mockMvc.perform(post("/api/v2/auth/init-admin"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("admin@vertex.com"));
    }

    /**
     * Test initialize test users
     */
    @Test
    public void testInitializeTestUsers() throws Exception {
        mockMvc.perform(post("/api/v2/auth/init-test-users"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("test-users"));
    }
}
