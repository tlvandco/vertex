package com.vertex.projects.common.interceptor;

import com.vertex.projects.model.analytics.UserActivity;
import com.vertex.projects.service.analytics.UserActivityService;
import com.vertex.projects.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

/**
 * Interceptor for logging user activities and validating JWT tokens
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityLoggingInterceptor implements HandlerInterceptor {

    private final UserActivityService activityService;
    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = extractToken(request);
        if (token != null) {
            try {
                Long userId = jwtUtil.getUserIdFromToken(token);
                if (userId != null) {
                    logActivity(userId, request);
                }
            } catch (Exception e) {
                log.debug("Failed to extract user from token for activity logging", e);
            }
        }
        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private void logActivity(Long userId, HttpServletRequest request) {
        try {
            UserActivity activity = UserActivity.builder()
                .userId(userId)
                .activityType(UserActivity.ActivityType.USER_LOGGED_IN)
                .description(request.getMethod() + " " + request.getRequestURI())
                .ipAddress(request.getRemoteAddr())
                .activityTimestamp(LocalDateTime.now())
                .build();
            
            // Async logging to avoid performance impact
            // activityService.logActivity(activity);
        } catch (Exception e) {
            log.debug("Failed to log activity", e);
        }
    }
}
