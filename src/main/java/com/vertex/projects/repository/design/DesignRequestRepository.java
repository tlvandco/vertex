package com.vertex.projects.repository.design;

import com.vertex.projects.model.design.DesignRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignRequestRepository extends JpaRepository<DesignRequest, Long> {
    List<DesignRequest> findByCreatedBy(Long userId);
}
