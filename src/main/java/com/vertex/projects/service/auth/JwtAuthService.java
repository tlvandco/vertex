package com.vertex.projects.service.auth;

import com.vertex.projects.dto.request.RefreshTokenRequest;
import com.vertex.projects.model.auth.RefreshToken;
import com.vertex.projects.model.auth.Role;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.repository.auth.RefreshTokenRepository;
import com.vertex.projects.repository.auth.UserRepository;
import com.vertex.projects.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * JWT auth service handling refresh token rotation + issuing access tokens.
 */
@Service
@RequiredArgsConstructor
public class JwtAuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshToken refreshAccessToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!refreshToken.isActive()) {
            throw new RuntimeException("Refresh token has been rotated");
        }

        if (refreshToken.getExpiresAt() != null && refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        // rotate: invalidate old
        refreshToken.setActive(false);
        refreshTokenRepository.save(refreshToken);

        // issue new access token
        User user = refreshToken.getUser();

        // create new refresh token
        RefreshToken newRefresh = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();
        refreshTokenRepository.save(newRefresh);

        newRefresh.setActive(true);
        return newRefresh;
    }

    public String issueAccessTokenFromUser(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
    }

    public String loginAccessToken(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
    }
}

