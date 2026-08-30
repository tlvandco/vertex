package com.vertex.projects.controller.analytics;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.analytics.UserActivity;
import com.vertex.projects.service.analytics.UserActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for User Activity tracking
 */
@RestController
@RequestMapping("/api/v2/user-activity")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserActivityController {

    private final UserActivityService activityService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserActivity>> logActivity(@RequestBody UserActivity activity) {
        log.debug("Logging activity for user: {}", activity.getUserId());
        UserActivity logged = activityService.logActivity(activity);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(logged, "Activity logged successfully"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<UserActivity>>> getUserActivity(@PathVariable Long userId) {
        List<UserActivity> activities = activityService.getUserActivity(userId);
        return ResponseEntity.ok(ApiResponse.success(activities, "User activity retrieved successfully"));
    }

    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<ApiResponse<Page<UserActivity>>> getUserActivityPaged(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserActivity> activities = activityService.getUserActivityPaged(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(activities, "User activity retrieved successfully"));
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<ApiResponse<List<UserActivity>>> getActivityForDateRange(
            @PathVariable Long userId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        List<UserActivity> activities = activityService.getActivityForDateRange(userId, start, end);
        return ResponseEntity.ok(ApiResponse.success(activities, "Activity retrieved successfully"));
    }

    @GetMapping("/type/{activityType}")
    public ResponseEntity<ApiResponse<List<UserActivity>>> getActivitiesByType(
            @PathVariable UserActivity.ActivityType activityType) {
        List<UserActivity> activities = activityService.getActivitiesByType(activityType);
        return ResponseEntity.ok(ApiResponse.success(activities, "Activities retrieved successfully"));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<UserActivity>>> getEntityActivity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        List<UserActivity> activities = activityService.getEntityActivity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(activities, "Entity activity retrieved successfully"));
    }
}

