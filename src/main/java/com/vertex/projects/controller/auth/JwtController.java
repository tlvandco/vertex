package com.vertex.projects.controller.auth;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.request.RefreshTokenRequest;
import com.vertex.projects.dto.response.RefreshTokenResponse;
import com.vertex.projects.service.auth.JwtAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * JWT refresh endpoint.
 */
@RestController
@RequestMapping("/api/v2/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JwtController {

    private final JwtAuthService jwtAuthService;

    /**
     * POST /api/v2/auth/refresh-token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        log.info("Refresh token attempt");

        // rotation: invalidate old and create new refresh token
        com.vertex.projects.model.auth.RefreshToken newRefresh = jwtAuthService.refreshAccessToken(request);

        String newAccessToken = jwtAuthService.issueAccessTokenFromUser(newRefresh.getUser());

        ApiResponse<RefreshTokenResponse> payload = ApiResponse.success(
                RefreshTokenResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefresh.getToken())
                        .build(),
                "Token refreshed successfully"
        );

        return ResponseEntity.status(HttpStatus.OK).body(payload);
    }
}

