package com.vertex.projects.controller.team;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.model.team.TeamMember;
import com.vertex.projects.service.team.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for Team Member Management
 */
@RestController
@RequestMapping("/api/v2/team-members")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamMember>> addTeamMember(@Valid @RequestBody TeamMember member) {
        log.info("Adding member {} to team {}", member.getUserId(), member.getTeamId());
        TeamMember created = teamMemberService.addTeamMember(member);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Team member added successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamMember>> getTeamMember(@PathVariable Long id) {
        log.info("Fetching team member with ID: {}", id);
        return teamMemberService.getTeamMemberById(id)
            .map(member -> ResponseEntity.ok(ApiResponse.success(member, "Team member retrieved successfully")))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<ApiResponse<List<TeamMember>>> getTeamMembers(@PathVariable Long teamId) {
        log.info("Fetching members of team: {}", teamId);
        List<TeamMember> members = teamMemberService.getTeamMembers(teamId);
        return ResponseEntity.ok(ApiResponse.success(members, "Team members retrieved successfully"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<TeamMember>>> getUserTeams(@PathVariable Long userId) {
        log.info("Fetching teams for user: {}", userId);
        List<TeamMember> teams = teamMemberService.getUserTeams(userId);
        return ResponseEntity.ok(ApiResponse.success(teams, "User teams retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamMember>> updateTeamMember(@PathVariable Long id, 
                                                                   @Valid @RequestBody TeamMember updates) {
        log.info("Updating team member with ID: {}", id);
        TeamMember updated = teamMemberService.updateTeamMember(id, updates);
        return ResponseEntity.ok(ApiResponse.success(updated, "Team member updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> removeTeamMember(@PathVariable Long id) {
        log.info("Removing team member with ID: {}", id);
        teamMemberService.removeTeamMember(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Team member removed successfully"));
    }
}
