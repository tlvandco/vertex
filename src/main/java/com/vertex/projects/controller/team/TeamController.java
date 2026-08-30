package com.vertex.projects.controller.team;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.dto.team.AssignMemberRequest;
import com.vertex.projects.dto.team.TeamRequest;
import com.vertex.projects.model.team.Team;
import com.vertex.projects.model.team.TeamMember;
import com.vertex.projects.service.team.TeamService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/teams")
public class TeamController {

    private static final Logger log = LoggerFactory.getLogger(TeamController.class);

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Team>> createTeam(@Valid @RequestBody TeamRequest req) {
        Team t = teamService.createTeam(req);
        log.info("Created team: {}", t.getId());
        return ResponseEntity.status(201).body(ApiResponse.created(t));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Team>> getTeam(@PathVariable Long id) {
        return teamService.getTeam(id)
                .map(team -> ResponseEntity.ok(ApiResponse.success(team)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Team not found", 404)));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<TeamMember>> assignMember(@PathVariable Long id, @Valid @RequestBody AssignMemberRequest req) {
        TeamMember member = teamService.assignUser(id, req);
        return ResponseEntity.status(201).body(ApiResponse.created(member));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<?>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<TeamMember>>> listMembers(@PathVariable Long id) {
        List<TeamMember> members = teamService.listMembers(id);
        return ResponseEntity.ok(ApiResponse.success(members));
    }
}
