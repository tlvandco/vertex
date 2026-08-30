package com.vertex.projects.service.team;

import com.vertex.projects.model.team.TeamMember;
import com.vertex.projects.repository.team.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for TeamMember management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;

    /**
     * Add member to team
     */
    public TeamMember addTeamMember(TeamMember member) {
        log.info("Adding member {} to team {}", member.getUserId(), member.getTeamId());
        return teamMemberRepository.save(member);
    }

    /**
     * Get team member by ID
     */
    public Optional<TeamMember> getTeamMemberById(Long id) {
        log.debug("Fetching team member with ID: {}", id);
        return teamMemberRepository.findById(id);
    }

    /**
     * Get all members of a team
     */
    public List<TeamMember> getTeamMembers(Long teamId) {
        log.debug("Fetching members of team: {}", teamId);
        return teamMemberRepository.findByTeamIdAndActive(teamId, true);
    }

    /**
     * Get all teams for a user
     */
    public List<TeamMember> getUserTeams(Long userId) {
        log.debug("Fetching teams for user: {}", userId);
        return teamMemberRepository.findByUserId(userId);
    }

    /**
     * Update team member
     */
    public TeamMember updateTeamMember(Long id, TeamMember updates) {
        log.info("Updating team member with ID: {}", id);
        return teamMemberRepository.findById(id).map(member -> {
            if (updates.getRole() != null) member.setRole(updates.getRole());
            return teamMemberRepository.save(member);
        }).orElseThrow(() -> new RuntimeException("Team member not found"));
    }

    /**
     * Remove member from team (soft delete)
     */
    public void removeTeamMember(Long id) {
        log.info("Removing team member with ID: {}", id);
        teamMemberRepository.findById(id).ifPresent(member -> {
            member.setActive(false);
            teamMemberRepository.save(member);
        });
    }
}
