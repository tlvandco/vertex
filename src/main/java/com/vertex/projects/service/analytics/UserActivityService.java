package com.vertex.projects.service.analytics;

import com.vertex.projects.model.analytics.UserActivity;
import com.vertex.projects.repository.analytics.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for User Activity tracking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final UserActivityRepository activityRepository;

    /**
     * Log user activity
     */
    public UserActivity logActivity(UserActivity activity) {
        log.debug("Logging activity for user: {} - {}", activity.getUserId(), activity.getActivityType());
        return activityRepository.save(activity);
    }

    /**
     * Get user activity history
     */
    public List<UserActivity> getUserActivity(Long userId) {
        return activityRepository.findByUserIdOrderByActivityTimestampDesc(userId);
    }

    /**
     * Get user activity with pagination
     */
    public Page<UserActivity> getUserActivityPaged(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.findByUserIdOrderByActivityTimestampDesc(userId, pageable);
    }

    /**
     * Get activity for date range
     */
    public List<UserActivity> getActivityForDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return activityRepository.findByUserIdAndActivityTimestampBetween(userId, start, end);
    }

    /**
     * Get activities by type
     */
    public List<UserActivity> getActivitiesByType(UserActivity.ActivityType activityType) {
        return activityRepository.findByActivityType(activityType);
    }

    /**
     * Get entity activity
     */
    public List<UserActivity> getEntityActivity(String entityType, Long entityId) {
        return activityRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
}
