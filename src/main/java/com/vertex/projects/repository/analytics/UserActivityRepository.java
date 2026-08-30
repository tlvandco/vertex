package com.vertex.projects.repository.analytics;

import com.vertex.projects.model.analytics.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for UserActivity entity
 */
@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findByUserIdOrderByActivityTimestampDesc(Long userId);

    Page<UserActivity> findByUserIdOrderByActivityTimestampDesc(Long userId, Pageable pageable);

    List<UserActivity> findByActivityType(UserActivity.ActivityType activityType);

    List<UserActivity> findByUserIdAndActivityTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<UserActivity> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
