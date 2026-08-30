package com.vertex.projects.dto.team;

import com.vertex.projects.model.team.TeamRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignMemberRequest {
    @NotNull
    private Long userId;

    private TeamRole role = TeamRole.MEMBER;
}
