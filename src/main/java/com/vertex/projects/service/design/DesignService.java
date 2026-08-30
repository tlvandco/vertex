package com.vertex.projects.service.design;

import com.vertex.projects.dto.design.DesignRequestDto;
import com.vertex.projects.model.design.DesignRequest;
import com.vertex.projects.model.design.DesignStatus;
import com.vertex.projects.repository.design.DesignRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("designRequestService")
public class DesignService {

    private final DesignRequestRepository repo;

    public DesignService(DesignRequestRepository repo) {
        this.repo = repo;
    }

    public DesignRequest create(DesignRequestDto dto) {
        DesignRequest r = DesignRequest.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .createdBy(dto.getCreatedBy())
                .status(DesignStatus.NEW)
                .build();
        return repo.save(r);
    }

    public List<DesignRequest> listAll() {
        return repo.findAll();
    }

    public DesignRequest get(Long id) {
        return repo.findById(id).orElse(null);
    }

    public DesignRequest updateStatus(Long id, DesignStatus status) {
        return repo.findById(id).map(r -> {
            r.setStatus(status);
            return repo.save(r);
        }).orElse(null);
    }
}
