package com.vertex.projects.controller.auth;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.LoginRequest;
import com.vertex.projects.dto.response.LoginResponse;
import com.vertex.projects.model.auth.Role;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.repository.auth.UserRepository;
import com.vertex.projects.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller for VERTEX
 * Handles user login and admin credential initialization
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@RestController
@RequestMapping("/api/v2/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Initialize admin credentials (one-time setup)
     * POST /api/v2/auth/init-admin
     */
    @PostMapping("/init-admin")
    public ResponseEntity<ApiResponse<?>> initializeAdmin() {
        log.info("Initializing admin credentials");
        
        // Check if admin already exists
        if (userRepository.existsByEmail("admin@vertex.com")) {
            return ResponseEntity.ok(ApiResponse.success(
                "admin@vertex.com",
                "Admin already exists"
            ));
        }

        // Create admin user
        User admin = User.builder()
                .name("VERTEX Admin")
                .email("admin@vertex.com")
                .password(passwordEncoder.encode("admin@123"))
                .role(Role.ADMIN)
                .active(true)
                .verified(true)
                .phone("+91-9876543210")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        
        log.info("Admin credentials initialized successfully");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                "admin@vertex.com",
                "Admin credentials initialized successfully"
            ));
    }

    /**
     * Initialize test credentials
     * POST /api/v2/auth/init-test-users
     */
    @PostMapping("/init-test-users")
    public ResponseEntity<ApiResponse<?>> initializeTestUsers() {
        log.info("Initializing test user credentials");
        
        // Create test PM user
        if (!userRepository.existsByEmail("pm@vertex.com")) {
            User pm = User.builder()
                    .name("Project Manager")
                    .email("pm@vertex.com")
                    .password(passwordEncoder.encode("pm@123"))
                    .role(Role.PROJECT_MANAGER)
                    .active(true)
                    .verified(true)
                    .phone("+91-9876543211")
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(pm);
        }

        // Create test designer user
        if (!userRepository.existsByEmail("designer@vertex.com")) {
            User designer = User.builder()
                    .name("Interior Designer")
                    .email("designer@vertex.com")
                    .password(passwordEncoder.encode("designer@123"))
                    .role(Role.DESIGNER)
                    .active(true)
                    .verified(true)
                    .phone("+91-9876543212")
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(designer);
        }

        // Create test client user
        if (!userRepository.existsByEmail("client@vertex.com")) {
            User client = User.builder()
                    .name("Test Client")
                    .email("client@vertex.com")
                    .password(passwordEncoder.encode("client@123"))
                    .role(Role.CLIENT)
                    .active(true)
                    .verified(true)
                    .phone("+91-9876543213")
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(client);
        }
        
        log.info("Test user credentials initialized successfully");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                "test-users",
                "Test user credentials initialized successfully"
            ));
    }

    /**
     * Login endpoint
     * POST /api/v2/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        LoginResponse response = LoginResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .message("Login successful")
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    /**
     * Get current user info
     * GET /api/v2/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Fetching current user info");
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authorization token is required", HttpStatus.UNAUTHORIZED.value()));
        }

        // Validate token
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid or expired token", HttpStatus.UNAUTHORIZED.value()));
        }

        // Extract user information from token
        Long userId = jwtUtil.getUserIdFromToken(token);
        String email = jwtUtil.getEmailFromToken(token);

        if (userId == null || email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Cannot extract user information from token", HttpStatus.UNAUTHORIZED.value()));
        }

        // Fetch user details from database
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("User account is inactive", HttpStatus.FORBIDDEN.value()));
        }

        // Return user information (excluding password)
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("name", user.getName());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole());
        userInfo.put("phone", user.getPhone());
        userInfo.put("verified", user.getVerified());
        userInfo.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.success(userInfo, "Current user info retrieved successfully"));
    }
}
